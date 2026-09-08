import { newId } from "@ioteedom/db";
import { normalizeGhPhone } from "@ioteedom/shared";
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { argon2id, hash, verify } from "argon2";
import type { CookieOptions, Response } from "express";
import type { AppEnv } from "../config/env";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthPrincipal, PrincipalKind } from "./auth.types";
import { hashRefreshToken, newRefreshToken } from "./refresh-token";

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const REFRESH_COOKIE = "refresh_token";
const INVALID = "Invalid phone or PIN";

type JwtPayload = {
  sub: string;
  kind: PrincipalKind;
  typ: "access";
};

type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  mustChangePin: boolean;
  principal: PrincipalKind;
};

@Injectable()
export class AuthService {
  private dummyHash: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  cookieOptions(): CookieOptions {
    const secure = this.config.get("NODE_ENV", { infer: true }) === "production";
    return {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/v1/auth",
      maxAge: REFRESH_TTL_MS,
    };
  }

  attachRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, this.cookieOptions());
  }

  clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { ...this.cookieOptions(), maxAge: 0 });
  }

  async login(phoneInput: string, pin: string): Promise<TokenBundle> {
    const phone = normalizeGhPhone(phoneInput);
    if (!phone) {
      await this.dummyVerify(pin);
      throw new UnauthorizedException(INVALID);
    }

    const principal = await this.findPrincipal(phone);
    if (!principal) {
      await this.dummyVerify(pin);
      throw new UnauthorizedException(INVALID);
    }

    this.assertActive(principal);
    this.assertUnlocked(principal);

    const ok = await verify(principal.pinHash, pin).catch(() => false);
    if (!ok) {
      await this.recordFailure(principal);
      throw new UnauthorizedException(INVALID);
    }

    await this.clearFailures(principal);
    if (principal.kind === "user") {
      await this.acceptOwnerInvite(principal.phone);
    }
    return this.issueSession(principal);
  }

  async refresh(presented: string | undefined): Promise<TokenBundle> {
    if (!presented) {
      throw new UnauthorizedException("Refresh token required");
    }
    const tokenHash = hashRefreshToken(presented);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!stored) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    if (stored.revokedAt) {
      await this.revokeAllForSubject(stored.userId, stored.staffUserId);
      throw new UnauthorizedException("Invalid refresh token");
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const principal = await this.principalFromRefresh(stored.userId, stored.staffUserId);
    this.assertActive(principal);

    const next = newRefreshToken();
    const nextId = newId();
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date(), replacedById: nextId },
      }),
      this.prisma.refreshToken.create({
        data: {
          id: nextId,
          userId: stored.userId,
          staffUserId: stored.staffUserId,
          tokenHash: hashRefreshToken(next),
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
      }),
    ]);

    return {
      accessToken: await this.signAccess(principal),
      refreshToken: next,
      expiresIn: ACCESS_TTL_SECONDS,
      mustChangePin: principal.mustChangePin,
      principal: principal.kind,
    };
  }

  async logout(presented: string | undefined): Promise<void> {
    if (!presented) return;
    const tokenHash = hashRefreshToken(presented);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async changePin(
    actor: AuthPrincipal,
    input: { currentPin?: string; newPin: string },
  ): Promise<void> {
    const principal = await this.loadPrincipal(actor.kind, actor.id);
    this.assertActive(principal);

    if (!principal.mustChangePin) {
      if (!input.currentPin) {
        throw new UnauthorizedException("Current PIN is required");
      }
      const ok = await verify(principal.pinHash, input.currentPin).catch(() => false);
      if (!ok) {
        throw new UnauthorizedException("Current PIN is incorrect");
      }
    }

    const pinHash = await hash(input.newPin, { type: argon2id });
    if (principal.kind === "user") {
      await this.prisma.user.update({
        where: { id: principal.id },
        data: { pinHash, mustChangePin: false, pinFailedCount: 0, pinLockedUntil: null },
      });
    } else {
      await this.prisma.staffUser.update({
        where: { id: principal.id },
        data: { pinHash, mustChangePin: false, pinFailedCount: 0, pinLockedUntil: null },
      });
    }
  }

  async me(actor: AuthPrincipal) {
    if (actor.kind === "staff") {
      const staff = await this.prisma.staffUser.findUniqueOrThrow({
        where: { id: actor.id },
      });
      return {
        kind: "staff" as const,
        id: staff.id,
        name: staff.name,
        phone: staff.phone,
        phoneDisplay: staff.phoneDisplay,
        role: staff.role,
        mustChangePin: staff.mustChangePin,
      };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: actor.id },
      include: {
        memberships: {
          include: {
            account: {
              include: {
                modules: true,
                properties: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
              },
            },
          },
        },
      },
    });

    return {
      kind: "user" as const,
      id: user.id,
      name: user.name,
      phone: user.phone,
      phoneDisplay: user.phoneDisplay,
      mustChangePin: user.mustChangePin,
      memberships: user.memberships.map((membership) => ({
        role: membership.role,
        accountId: membership.accountId,
        accountName: membership.account.name,
        accountKind: membership.account.kind,
        status: membership.account.status,
        onboardedAt: membership.account.onboardedAt?.toISOString() ?? null,
        modules: Object.fromEntries(
          membership.account.modules.map((row) => [row.module, row.enabled]),
        ),
        properties: membership.account.properties.map((property) => ({
          id: property.id,
          label: property.label,
          address: property.address,
          city: property.city,
          kind: property.kind,
          ecgAccountNumber: property.ecgAccountNumber,
          gwclAccountNumber: property.gwclAccountNumber,
        })),
      })),
    };
  }

  async principalFromAccess(payload: JwtPayload): Promise<AuthPrincipal> {
    const principal = await this.loadPrincipal(payload.kind, payload.sub);
    this.assertActive(principal);
    return this.toAuthPrincipal(principal);
  }

  async principalFromAccessToken(token: string): Promise<AuthPrincipal> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get("JWT_ACCESS_SECRET", { infer: true }),
        issuer: "ioteedom-smart-pay",
        audience: "api",
      });
      if (payload.typ !== "access" || (payload.kind !== "user" && payload.kind !== "staff")) {
        throw new UnauthorizedException();
      }
      return this.principalFromAccess(payload);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async issueSession(principal: LoadedPrincipal): Promise<TokenBundle> {
    const refresh = newRefreshToken();
    await this.prisma.refreshToken.create({
      data: {
        id: newId(),
        userId: principal.kind === "user" ? principal.id : null,
        staffUserId: principal.kind === "staff" ? principal.id : null,
        tokenHash: hashRefreshToken(refresh),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    await this.touchLastSeen(principal);
    return {
      accessToken: await this.signAccess(principal),
      refreshToken: refresh,
      expiresIn: ACCESS_TTL_SECONDS,
      mustChangePin: principal.mustChangePin,
      principal: principal.kind,
    };
  }

  private async signAccess(principal: LoadedPrincipal): Promise<string> {
    const payload: JwtPayload = {
      sub: principal.id,
      kind: principal.kind,
      typ: "access",
    };
    return this.jwt.signAsync(payload, {
      secret: this.config.get("JWT_ACCESS_SECRET", { infer: true }),
      expiresIn: ACCESS_TTL_SECONDS,
      issuer: "ioteedom-smart-pay",
      audience: "api",
    });
  }

  private async findPrincipal(phone: string): Promise<LoadedPrincipal | null> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (user && !user.deletedAt) {
      return { kind: "user", ...user };
    }
    const staff = await this.prisma.staffUser.findUnique({ where: { phone } });
    if (staff) {
      return { kind: "staff", ...staff };
    }
    return null;
  }

  private async loadPrincipal(kind: PrincipalKind, id: string): Promise<LoadedPrincipal> {
    if (kind === "user") {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user || user.deletedAt) {
        throw new UnauthorizedException();
      }
      return { kind: "user", ...user };
    }
    const staff = await this.prisma.staffUser.findUnique({ where: { id } });
    if (!staff) {
      throw new UnauthorizedException();
    }
    return { kind: "staff", ...staff };
  }

  private async principalFromRefresh(
    userId: string | null,
    staffUserId: string | null,
  ): Promise<LoadedPrincipal> {
    if (userId) return this.loadPrincipal("user", userId);
    if (staffUserId) return this.loadPrincipal("staff", staffUserId);
    throw new UnauthorizedException("Invalid refresh token");
  }

  private assertActive(principal: LoadedPrincipal) {
    if (principal.status !== "active") {
      throw new ForbiddenException("Account is suspended");
    }
  }

  private assertUnlocked(principal: LoadedPrincipal) {
    if (principal.pinLockedUntil && principal.pinLockedUntil.getTime() > Date.now()) {
      throw new HttpException(
        "Too many PIN attempts. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async recordFailure(principal: LoadedPrincipal) {
    const nextCount = principal.pinFailedCount + 1;
    const locked = nextCount >= MAX_PIN_ATTEMPTS;
    const data = {
      pinFailedCount: locked ? 0 : nextCount,
      pinLockedUntil: locked ? new Date(Date.now() + LOCKOUT_MS) : principal.pinLockedUntil,
    };
    if (principal.kind === "user") {
      await this.prisma.user.update({ where: { id: principal.id }, data });
    } else {
      await this.prisma.staffUser.update({ where: { id: principal.id }, data });
    }
  }

  private async clearFailures(principal: LoadedPrincipal) {
    const data = { pinFailedCount: 0, pinLockedUntil: null };
    if (principal.kind === "user") {
      await this.prisma.user.update({ where: { id: principal.id }, data });
    } else {
      await this.prisma.staffUser.update({ where: { id: principal.id }, data });
    }
  }

  private async touchLastSeen(principal: LoadedPrincipal) {
    const now = new Date();
    if (principal.kind === "user") {
      await this.prisma.user.update({
        where: { id: principal.id },
        data: { lastSeenAt: now },
      });
    } else {
      await this.prisma.staffUser.update({
        where: { id: principal.id },
        data: { lastSeenAt: now },
      });
    }
  }

  private async revokeAllForSubject(userId: string | null, staffUserId: string | null) {
    await this.prisma.refreshToken.updateMany({
      where: {
        revokedAt: null,
        ...(userId ? { userId } : { staffUserId }),
      },
      data: { revokedAt: new Date() },
    });
  }

  private async acceptOwnerInvite(phone: string) {
    await this.prisma.invite.updateMany({
      where: { phone, kind: "owner", acceptedAt: null },
      data: { acceptedAt: new Date() },
    });
  }

  private async dummyVerify(pin: string) {
    this.dummyHash ??= await hash("000000", { type: argon2id });
    await verify(this.dummyHash, pin).catch(() => false);
  }

  private toAuthPrincipal(principal: LoadedPrincipal): AuthPrincipal {
    return {
      id: principal.id,
      kind: principal.kind,
      name: principal.name,
      phone: principal.phone,
      mustChangePin: principal.mustChangePin,
      status: principal.status,
    };
  }
}

type LoadedPrincipal = {
  kind: PrincipalKind;
  id: string;
  name: string;
  phone: string;
  pinHash: string;
  mustChangePin: boolean;
  status: "active" | "suspended";
  pinFailedCount: number;
  pinLockedUntil: Date | null;
};
