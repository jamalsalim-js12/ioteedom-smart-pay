import { newId } from "@ioteedom/db";
import {
  blankModules,
  formatGhPhoneDisplay,
  isModuleId,
  type ModuleId,
  namedModules,
  normalizeGhPhone,
} from "@ioteedom/shared";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { argon2id, hash } from "argon2";
import type { AuthPrincipal } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import type { InviteOwnerDto } from "./dto/ops.dto";

const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function tempPin() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

function modulesFromInput(input: Record<string, boolean>): Record<ModuleId, boolean> {
  const next = blankModules(false);
  for (const [key, on] of Object.entries(input)) {
    const id = key === "smartHome" ? "smart_home" : key;
    if (isModuleId(id)) next[id] = Boolean(on);
  }
  return next;
}

@Injectable()
export class OpsService {
  private readonly logger = new Logger(OpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async inviteOwner(staff: AuthPrincipal, dto: InviteOwnerDto) {
    const phone = normalizeGhPhone(dto.phone);
    if (!phone) {
      throw new BadRequestException("Enter a Ghana phone number");
    }
    const phoneDisplay = formatGhPhoneDisplay(phone);
    const [existingUser, existingStaff] = await Promise.all([
      this.prisma.user.findUnique({ where: { phone } }),
      this.prisma.staffUser.findUnique({ where: { phone } }),
    ]);
    if (existingUser || existingStaff) {
      throw new ConflictException("This phone is already on the platform");
    }

    const modules = modulesFromInput(dto.modules);
    const pin = tempPin();
    const pinHash = await hash(pin, { type: argon2id });
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const accountId = newId();
    const userId = newId();
    const inviteId = newId();
    const propertyId = newId();
    const name = dto.name.trim();
    const address = dto.property.trim();
    const city = dto.city.trim();
    const email = dto.email.trim();

    await this.prisma.$transaction(async (tx) => {
      await tx.account.create({
        data: {
          id: accountId,
          name,
          kind: dto.kind,
          status: "invited",
          createdByStaffId: staff.id,
        },
      });
      await tx.property.create({
        data: {
          id: propertyId,
          accountId,
          label: address,
          address,
          city,
          kind: dto.kind,
        },
      });
      await tx.accountModule.createMany({
        data: (Object.keys(modules) as ModuleId[]).map((module) => ({
          accountId,
          module,
          enabled: modules[module],
          setByStaffId: staff.id,
        })),
      });
      await tx.user.create({
        data: {
          id: userId,
          phone,
          phoneDisplay,
          email,
          name,
          pinHash,
          mustChangePin: true,
        },
      });
      await tx.membership.create({
        data: {
          id: newId(),
          userId,
          accountId,
          role: "owner",
        },
      });
      await tx.invite.create({
        data: {
          id: inviteId,
          kind: "owner",
          accountId,
          phone,
          email,
          name,
          pinHash,
          expiresAt,
          invitedByType: "staff",
          invitedById: staff.id,
        },
      });
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: "staff",
          actorId: staff.id,
          action: "owner_invited",
          accountId,
          targetType: "invite",
          targetId: inviteId,
          diff: {
            phone: phoneDisplay,
            modules: namedModules(modules),
            kind: dto.kind,
          },
        },
      });
    });

    this.logger.log(`Owner invite PIN for ${phoneDisplay}: ${pin}`);

    return {
      accountId,
      inviteId,
      name,
      phoneDisplay,
      pin,
      expiresAt: expiresAt.toISOString(),
      modules,
    };
  }

  async listAccounts() {
    const accounts = await this.prisma.account.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        modules: true,
        properties: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: { _count: { select: { units: true } } },
        },
        memberships: {
          where: { role: "owner" },
          include: { user: true },
          take: 1,
        },
        invites: {
          where: { kind: "owner" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return {
      items: accounts.map((account) => {
        const property = account.properties[0];
        const owner = account.memberships[0]?.user;
        const invite = account.invites[0];
        const flags = Object.fromEntries(account.modules.map((row) => [row.module, row.enabled]));
        const enabled = blankModules(false);
        for (const [key, on] of Object.entries(flags)) {
          if (isModuleId(key)) enabled[key] = on;
        }
        return {
          id: account.id,
          name: owner?.name ?? account.name,
          phoneDisplay: owner?.phoneDisplay ?? "",
          kind: account.kind,
          status: account.status,
          onboardedAt: account.onboardedAt?.toISOString() ?? null,
          property: property?.address ?? "",
          city: property?.city ?? "",
          modules: namedModules(enabled),
          moduleFlags: enabled,
          units: property?._count.units ?? 0,
          lastSeen: owner?.lastSeenAt?.toISOString() ?? null,
          inviteAcceptedAt: invite?.acceptedAt?.toISOString() ?? null,
        };
      }),
    };
  }

  async getAccount(id: string) {
    const list = await this.listAccounts();
    const item = list.items.find((account) => account.id === id);
    if (!item) throw new NotFoundException("Account not found");
    return item;
  }

  async listAudit() {
    const rows = await this.prisma.auditLog.findMany({
      orderBy: { at: "desc" },
      take: 40,
    });
    return {
      items: rows.map((row) => {
        const diff = row.diff;
        const modules =
          diff && typeof diff === "object" && "modules" in diff && Array.isArray(diff.modules)
            ? diff.modules.map(String).join(", ")
            : "";
        return {
          id: row.id,
          action: row.action,
          actorId: row.actorId,
          accountId: row.accountId,
          summary:
            row.action === "owner_invited"
              ? `Invited owner${modules ? ` · ${modules}` : ""}`
              : row.action,
          at: row.at.toISOString(),
        };
      }),
    };
  }
}
