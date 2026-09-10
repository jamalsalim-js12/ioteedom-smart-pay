import { newId, Prisma } from "@ioteedom/db";
import {
  formatGhPhoneLocal,
  isMomoNetworkId,
  type MomoNetworkId,
  normalizeGhPhone,
  type PaymentRail,
} from "@ioteedom/shared";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AuthPrincipal } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import type { CreatePaymentDto, RetryPaymentDto } from "./dto/payments.dto";
import { ProviderAdapter } from "./provider/provider.adapter";

type PaymentRow = Prisma.PaymentGetPayload<object>;
type LoadedBill = Prisma.BillGetPayload<{
  include: {
    account: { include: { modules: true; memberships: true } };
    occupancy: true;
  };
}>;

function newOurRef() {
  return `SP-${newId().slice(-8).toUpperCase()}`;
}

function moduleForBill(type: LoadedBill["type"]): "ecg" | "water" | "utilities" {
  if (type === "ecg_postpaid" || type === "ecg_prepaid") return "ecg";
  if (type === "water_tenant" || type === "water_gwcl") return "water";
  return "utilities";
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: ProviderAdapter,
  ) {}

  async create(actor: AuthPrincipal, dto: CreatePaymentDto, idempotencyKey: string) {
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      this.assertSameReplay(existing, dto);
      this.assertPayer(existing.payerUserId, actor.id);
      return this.toView(existing);
    }

    const bill = await this.loadBill(dto.billId);
    this.assertBillPayable(bill, dto.rail, BigInt(dto.amountPesewas));
    await this.assertActorCanPay(actor, bill);

    const charge = this.chargeParty(actor, dto.method, dto.msisdn);
    return this.chargeNewPayment({
      actor,
      bill,
      method: dto.method,
      msisdnLocal: charge.phoneLocal,
      idempotencyKey,
      retryOfId: null,
    });
  }

  async getById(actor: AuthPrincipal, id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException("Payment not found");
    if (actor.kind === "staff") return this.toView(payment);
    this.assertPayer(payment.payerUserId, actor.id);
    return this.toView(payment);
  }

  async retry(actor: AuthPrincipal, id: string, dto: RetryPaymentDto, idempotencyKey: string) {
    const original = await this.prisma.payment.findUnique({ where: { id } });
    if (!original) throw new NotFoundException("Payment not found");
    this.assertPayer(original.payerUserId, actor.id);
    if (original.status !== "failed" && original.status !== "expired") {
      throw new BadRequestException("Only a failed or expired payment can be retried");
    }
    if (dto.rail && dto.rail !== original.rail) {
      throw new BadRequestException("Rail does not match the original payment");
    }
    if (!original.billId) {
      throw new BadRequestException("This payment has no bill to retry");
    }

    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      this.assertPayer(existing.payerUserId, actor.id);
      return this.toView(existing);
    }

    const bill = await this.loadBill(original.billId);
    this.assertBillPayable(bill, original.rail, original.amountPesewas);
    await this.assertActorCanPay(actor, bill);
    const charge = this.chargeParty(actor, dto.method, dto.msisdn);

    return this.chargeNewPayment({
      actor,
      bill,
      method: dto.method,
      msisdnLocal: charge.phoneLocal,
      idempotencyKey,
      retryOfId: original.id,
    });
  }

  private async chargeNewPayment(input: {
    actor: AuthPrincipal;
    bill: LoadedBill;
    method: MomoNetworkId;
    msisdnLocal: string;
    idempotencyKey: string;
    retryOfId: string | null;
  }) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: input.actor.id } });
    if (!user.email) {
      throw new BadRequestException("This account needs an email before MoMo can run");
    }

    const created = await this.prisma.payment.create({
      data: {
        id: newId(),
        ourRef: newOurRef(),
        billId: input.bill.id,
        retryOfId: input.retryOfId,
        accountId: input.bill.accountId,
        propertyId: input.bill.propertyId,
        unitId: input.bill.unitId,
        occupancyId: input.bill.occupancyId,
        payerUserId: input.actor.id,
        payeeType: input.bill.payeeType,
        payeeLabel: input.bill.payeeLabel,
        rail: input.bill.rail,
        method: input.method,
        amountPesewas: input.bill.amountDuePesewas,
        status: "created",
        collectionStatus: "pending",
        fulfillmentStatus: "pending",
        idempotencyKey: input.idempotencyKey,
      },
    });

    let initiation: Awaited<ReturnType<ProviderAdapter["initiateCharge"]>>;
    try {
      initiation = await this.provider.initiateCharge({
        email: user.email,
        amountPesewas: created.amountPesewas,
        reference: created.ourRef,
        phoneLocal: input.msisdnLocal,
        provider: input.method,
        metadata: {
          paymentId: created.id,
          rail: created.rail,
          payeeType: created.payeeType,
        },
      });
    } catch {
      const next = await this.prisma.payment.update({
        where: { id: created.id },
        data: {
          status: "failed",
          collectionStatus: "failed",
          failureCode: "provider_error",
        },
      });
      return this.toView(next);
    }

    const next = await this.prisma.payment.update({
      where: { id: created.id },
      data: initiation.accepted
        ? {
            status: "pending",
            providerRef: initiation.providerRef,
            collectionStatus: "pending",
          }
        : {
            status: "failed",
            providerRef: initiation.providerRef,
            collectionStatus: "failed",
            failureCode: initiation.failureCode,
          },
    });

    return this.toView(next, initiation.displayText);
  }

  private chargeParty(actor: AuthPrincipal, method: string, msisdn: string) {
    if (actor.kind !== "user") {
      throw new ForbiddenException("Staff cannot pay as a household user");
    }
    if (!isMomoNetworkId(method)) {
      throw new BadRequestException("Choose MTN, Telecel, or AT");
    }
    const normalized = normalizeGhPhone(msisdn);
    const phoneLocal = normalized ? formatGhPhoneLocal(normalized) : null;
    if (!phoneLocal) {
      throw new BadRequestException("Enter a Ghana MoMo number");
    }
    return { method, phoneLocal };
  }

  private async loadBill(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        account: { include: { modules: true, memberships: true } },
        occupancy: true,
      },
    });
    if (!bill) throw new NotFoundException("Bill not found");
    return bill;
  }

  private assertBillPayable(bill: LoadedBill, rail: PaymentRail, amountPesewas: bigint) {
    if (bill.status !== "open") {
      throw new BadRequestException("This bill is not open");
    }
    if (bill.amountDuePesewas <= 0n) {
      throw new BadRequestException("Nothing is due on this bill");
    }
    if (rail !== bill.rail) {
      throw new BadRequestException("Rail does not match this bill");
    }
    if (amountPesewas !== bill.amountDuePesewas) {
      throw new BadRequestException("Amount must match the open bill");
    }
  }

  private async assertActorCanPay(actor: AuthPrincipal, bill: LoadedBill) {
    if (actor.kind !== "user") {
      throw new ForbiddenException("Staff cannot pay as a household user");
    }
    const moduleId = moduleForBill(bill.type);
    const enabled = bill.account.modules.find((row) => row.module === moduleId)?.enabled;
    if (!enabled) {
      throw new ForbiddenException("This service is not on for the account");
    }

    const owner = bill.account.memberships.some(
      (row) => row.userId === actor.id && row.role === "owner",
    );
    const tenantHere = bill.occupancy?.userId === actor.id && bill.occupancy.endedAt == null;

    if (bill.type === "water_tenant") {
      if (!tenantHere) throw new ForbiddenException("Only the tenant pays this water bill");
      return;
    }
    if (bill.rail === "remit" || (bill.type === "water_gwcl" && bill.rail === "direct")) {
      if (!owner) throw new ForbiddenException("Only the owner remits Ghana Water");
      return;
    }
    if (bill.type === "ecg_postpaid" || bill.type === "ecg_prepaid") {
      if (bill.unitId) {
        if (owner) {
          throw new ForbiddenException("Estate owners cannot pay a unit ECG meter");
        }
        if (!tenantHere) throw new ForbiddenException("Only that unit's tenant pays this ECG");
        return;
      }
      if (!owner) throw new ForbiddenException("Only the owner pays this ECG");
    }
  }

  private assertPayer(payerUserId: string, actorId: string) {
    if (payerUserId !== actorId) {
      throw new NotFoundException("Payment not found");
    }
  }

  private assertSameReplay(existing: PaymentRow, dto: CreatePaymentDto) {
    if (existing.billId !== dto.billId || existing.amountPesewas !== BigInt(dto.amountPesewas)) {
      throw new ConflictException("Idempotency-Key already used for a different payment");
    }
  }

  private toView(payment: PaymentRow, displayText?: string) {
    return {
      id: payment.id,
      ourRef: payment.ourRef,
      amountPesewas: payment.amountPesewas.toString(),
      currency: "GHS" as const,
      rail: payment.rail,
      status: payment.status,
      fulfillmentStatus: payment.fulfillmentStatus,
      displayText: displayText ?? defaultDisplayText(payment),
    };
  }
}

function defaultDisplayText(payment: PaymentRow): string {
  if (payment.status === "pending" || payment.status === "created") {
    return "Please approve the payment on your phone";
  }
  if (payment.status === "failed" || payment.status === "expired") {
    return "Payment did not go through. You can retry.";
  }
  if (payment.status === "succeeded" && payment.fulfillmentStatus === "pending") {
    if (payment.payeeType === "ecg") {
      return "MoMo received. Waiting for ECG to credit the meter.";
    }
    if (payment.payeeType === "gwcl") {
      return "MoMo received. Waiting for Ghana Water to credit the account.";
    }
  }
  if (payment.status === "succeeded") {
    return `Paid to ${payment.payeeLabel}`;
  }
  return payment.status;
}
