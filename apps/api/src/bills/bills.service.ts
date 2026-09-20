import { Injectable } from "@nestjs/common";
import type { AuthPrincipal } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForActor(actor: AuthPrincipal) {
    if (actor.kind === "staff") {
      return { items: [] };
    }

    const [ownedAccountIds, occupancyIds] = await Promise.all([
      this.ownedAccountIds(actor.id),
      this.openOccupancyIds(actor.id),
    ]);

    if (ownedAccountIds.length === 0 && occupancyIds.length === 0) {
      return { items: [] };
    }

    const bills = await this.prisma.bill.findMany({
      where: {
        OR: [
          ...(ownedAccountIds.length ? [{ accountId: { in: ownedAccountIds }, unitId: null }] : []),
          ...(occupancyIds.length ? [{ occupancyId: { in: occupancyIds } }] : []),
        ],
      },
      include: {
        property: true,
        unit: true,
        utilityAccount: true,
      },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    });

    const ownerSet = new Set(ownedAccountIds);

    return {
      items: bills.map((bill) => {
        const isOwnerBill = bill.unitId == null && ownerSet.has(bill.accountId);
        const isTenantBill = bill.occupancyId != null && occupancyIds.includes(bill.occupancyId);
        const payable =
          bill.status === "open" && bill.amountDuePesewas > 0n && (isTenantBill || isOwnerBill);

        return {
          id: bill.id,
          type: bill.type,
          rail: bill.rail,
          payeeType: bill.payeeType,
          payeeLabel: bill.payeeLabel,
          cycle: bill.cycle,
          dueAt: bill.dueAt?.toISOString().slice(0, 10) ?? null,
          amountDuePesewas: bill.amountDuePesewas.toString(),
          status: bill.status,
          propertyId: bill.propertyId,
          propertyLabel: bill.property.label,
          unitId: bill.unitId,
          unitName: bill.unit?.name ?? null,
          accountNumber: bill.utilityAccount?.accountNumber ?? null,
          meterNumber: bill.utilityAccount?.meterNumber ?? null,
          usageM3: bill.usageM3?.toString() ?? null,
          payable,
        };
      }),
    };
  }

  private async ownedAccountIds(userId: string) {
    const rows = await this.prisma.membership.findMany({
      where: { userId, role: "owner" },
      select: { accountId: true },
    });
    return rows.map((row) => row.accountId);
  }

  private async openOccupancyIds(userId: string) {
    const rows = await this.prisma.occupancy.findMany({
      where: { userId, endedAt: null },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }
}
