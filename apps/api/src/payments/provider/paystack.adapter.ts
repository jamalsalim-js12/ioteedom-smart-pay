import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppEnv } from "../../config/env";
import {
  fixtureCharge,
  fixtureParseWebhook,
  fixtureTransfer,
  fixtureVerify,
  paystackProvider,
} from "./paystack.fixtures";
import {
  type ChargeInitiation,
  type ChargeInput,
  type ParsedWebhookEvent,
  ProviderAdapter,
  type TransferInput,
  type VerifiedCharge,
} from "./provider.adapter";

const PAYSTACK_API = "https://api.paystack.co";

type PaystackEnvelope = {
  status?: unknown;
  message?: unknown;
  data?: Record<string, unknown>;
};

@Injectable()
export class PaystackAdapter extends ProviderAdapter {
  constructor(private readonly config: ConfigService<AppEnv, true>) {
    super();
  }

  private secret(): string | null {
    return this.config.get("PAYSTACK_SECRET_KEY", { infer: true });
  }

  async initiateCharge(input: ChargeInput): Promise<ChargeInitiation> {
    const secret = this.secret();
    if (!secret) return fixtureCharge(input);

    const payload = await this.request("/charge", {
      method: "POST",
      body: {
        email: input.email,
        amount: input.amountPesewas.toString(),
        currency: "GHS",
        reference: input.reference,
        metadata: input.metadata,
        mobile_money: {
          phone: input.phoneLocal,
          provider: paystackProvider(input.provider),
        },
      },
    });
    const data = payload.data ?? {};
    const status = typeof data.status === "string" ? data.status : "";
    const accepted = payload.status === true && status !== "failed";
    return {
      reference: typeof data.reference === "string" ? data.reference : input.reference,
      displayText:
        typeof data.display_text === "string"
          ? data.display_text
          : accepted
            ? "Please approve the payment on your phone"
            : (stringifyMessage(payload.message) ?? "Charge declined"),
      providerRef: data.id != null ? String(data.id) : input.reference,
      accepted,
      failureCode: accepted ? null : status || "declined",
    };
  }

  async verifyTransaction(reference: string): Promise<VerifiedCharge> {
    const secret = this.secret();
    if (!secret) return fixtureVerify(reference);

    const payload = await this.request(`/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
    });
    const data = payload.data ?? {};
    const statusRaw = typeof data.status === "string" ? data.status : "pending";
    const status =
      statusRaw === "success" || statusRaw === "failed" || statusRaw === "abandoned"
        ? statusRaw
        : "pending";
    const amount = typeof data.amount === "number" ? BigInt(data.amount) : 0n;
    const fees = typeof data.fees === "number" ? BigInt(data.fees) : null;
    return {
      reference: typeof data.reference === "string" ? data.reference : reference,
      providerRef: data.id != null ? String(data.id) : reference,
      status,
      amountPesewas: amount,
      currency: "GHS",
      feesPesewas: fees,
      gatewayResponse: typeof data.gateway_response === "string" ? data.gateway_response : null,
    };
  }

  async initiateTransfer(input: TransferInput): Promise<{ transferCode: string }> {
    const secret = this.secret();
    if (!secret) return fixtureTransfer(input);

    const payload = await this.request("/transfer", {
      method: "POST",
      body: {
        source: "balance",
        amount: input.amountPesewas.toString(),
        reference: input.reference,
        recipient: input.recipientCode,
        currency: "GHS",
      },
    });
    const data = payload.data ?? {};
    const code = typeof data.transfer_code === "string" ? data.transfer_code : null;
    if (!code) {
      throw new Error(stringifyMessage(payload.message) ?? "Paystack transfer failed");
    }
    return { transferCode: code };
  }

  parseWebhook(rawBody: Buffer, signature: string | undefined): ParsedWebhookEvent {
    const secret = this.secret();
    if (!secret) return fixtureParseWebhook(rawBody, signature);

    const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
    if (!signature || !safeEqual(expected, signature)) {
      throw new Error("Invalid Paystack signature");
    }
    const payload = JSON.parse(rawBody.toString("utf8")) as {
      event?: unknown;
      data?: { id?: unknown; reference?: unknown };
    };
    const event = typeof payload.event === "string" ? payload.event : "";
    const id = payload.data?.id;
    const reference = payload.data?.reference;
    return {
      event,
      providerEventId: id == null ? event : String(id),
      reference: typeof reference === "string" ? reference : null,
      payload,
    };
  }

  private async request(
    path: string,
    init: { method: "GET" | "POST"; body?: Record<string, unknown> },
  ): Promise<PaystackEnvelope> {
    const secret = this.secret();
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is required");
    }
    const response = await fetch(`${PAYSTACK_API}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const payload = (await response.json()) as PaystackEnvelope;
    if (!response.ok && payload.status !== false) {
      throw new Error(stringifyMessage(payload.message) ?? `Paystack HTTP ${response.status}`);
    }
    return payload;
  }
}

function stringifyMessage(message: unknown): string | null {
  if (typeof message === "string") return message;
  return null;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
