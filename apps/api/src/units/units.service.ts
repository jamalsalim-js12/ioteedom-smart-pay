import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthPrincipal } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async listEcgStatus(actor: AuthPrincipal) {
    if (actor.kind !== "user") {
      throw new ForbiddenException("Staff use ops endpoints for account review");
    }

    const memberships = await this.prisma.membership.findMany({
      where: { userId: actor.id, role: "owner" },
      select: { accountId: true },
    });
    const accountIds = memberships.map((row) => row.accountId);
    if (accountIds.length === 0) {
      return { items: [] };
    }

    const units = await this.prisma.unit.findMany({
      where: { property: { accountId: { in: accountIds }, deletedAt: null } },
      include: {
        property: true,
        occupancies: {
          where: { endedAt: null },
          include: { user: true },
          take: 1,
        },
        utilityAccounts: { where: { service: "ecg" }, take: 1 },
        bills: {
          where: {
            type: { in: ["ecg_postpaid", "ecg_prepaid"] },
            status: { in: ["open", "paid"] },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ propertyId: "asc" }, { sortOrder: "asc" }],
    });

    return {
      items: units.map((unit) => {
        const utility = unit.utilityAccounts[0] ?? null;
        const bill = unit.bills[0] ?? null;
        const tenant = unit.occupancies[0]?.user ?? null;
        let status: "open" | "paid" | "none" = "none";
        if (bill) {
          status = bill.status === "open" && bill.amountDuePesewas > 0n ? "open" : "paid";
        }
        return {
          unitId: unit.id,
          unitName: unit.name,
          propertyId: unit.propertyId,
          propertyLabel: unit.property.label,
          tenantName: tenant?.name ?? null,
          accountNumber: utility?.accountNumber ?? null,
          meterNumber: utility?.meterNumber ?? null,
          status,
          amountDuePesewas: bill?.amountDuePesewas.toString() ?? "0",
          billId: bill?.id ?? null,
          cycle: bill?.cycle ?? null,
          ownerCanPay: false as const,
        };
      }),
    };
  }

  async getEcgStatus(actor: AuthPrincipal, unitId: string) {
    const list = await this.listEcgStatus(actor);
    const item = list.items.find((row) => row.unitId === unitId);
    if (!item) {
      const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
      if (!unit) throw new NotFoundException("Unit not found");
      throw new ForbiddenException("Only the property owner can see this unit's ECG status");
    }
    return item;
  }
}
