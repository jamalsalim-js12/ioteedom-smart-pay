import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { MOMO_NETWORKS } from "@ioteedom/shared";
import type {
  ChargeInitiation,
  ChargeInput,
  ParsedWebhookEvent,
  TransferInput,
  VerifiedCharge,
} from "./provider.adapter";

/** Fixture MSISDN that Paystack-shaped Charge declines so retry can be exercised. */
export const FIXTURE_DECLINED_LOCAL = "0200000000";

const DISPLAY_TEXT = "Please approve the payment on your phone";

export function fixtureProviderRef(reference: string): string {
  const digest = createHash("sha256").update(reference).digest("hex");
  const n = BigInt(`0x${digest.slice(0, 12)}`) % 9_000_000_000n;
  return String(1_000_000_000n + n);
}

export function fixtureCharge(input: ChargeInput): ChargeInitiation {
  const declined = input.phoneLocal === FIXTURE_DECLINED_LOCAL;
  return {
    reference: input.reference,
    displayText: declined ? "Charge declined" : DISPLAY_TEXT,
    providerRef: fixtureProviderRef(input.reference),
    accepted: !declined,
    failureCode: declined ? "declined" : null,
  };
}

export function fixtureVerify(reference: string): VerifiedCharge {
  return {
    reference,
    providerRef: fixtureProviderRef(reference),
    status: "pending",
    amountPesewas: 0n,
    currency: "GHS",
    feesPesewas: null,
    gatewayResponse: "Pending OTP",
  };
}

export function fixtureTransfer(input: TransferInput): { transferCode: string } {
  return { transferCode: `TRF_${input.reference}` };
}

export function fixtureParseWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): ParsedWebhookEvent {
  const expected = createHmac("sha512", "fixture").update(rawBody).digest("hex");
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

export function paystackProvider(network: ChargeInput["provider"]): string {
  return MOMO_NETWORKS[network].paystackProvider;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
