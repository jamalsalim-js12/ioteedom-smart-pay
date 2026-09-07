import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthPrincipal } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import type { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async complete(actor: AuthPrincipal, dto: CompleteOnboardingDto) {
    if (actor.kind !== "user") {
      throw new ForbiddenException("Staff do not onboard a household account");
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_accountId: { userId: actor.id, accountId: dto.accountId },
      },
      include: {
        account: {
          include: { properties: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } } },
        },
      },
    });

    if (membership?.role !== "owner") {
      throw new NotFoundException("Account not found");
    }
    if (membership.account.status === "suspended") {
      throw new ForbiddenException("This account is suspended");
    }

    const property = membership.account.properties[0];
    const onboardedAt = membership.account.onboardedAt ?? new Date();
    const address = dto.address.trim();
    const city = dto.city.trim();

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: dto.accountId },
        data: { status: "active", onboardedAt },
      });
      if (property) {
        await tx.property.update({
          where: { id: property.id },
          data: { address, city },
        });
      }
    });

    return {
      accountId: dto.accountId,
      status: "active" as const,
      onboardedAt: onboardedAt.toISOString(),
    };
  }
}
