import type { MomoNetworkId, PaymentRail } from "@ioteedom/shared";

export type ChargeInput = {
  email: string;
  amountPesewas: bigint;
  reference: string;
  phoneLocal: string;
  provider: MomoNetworkId;
  metadata: {
    paymentId: string;
    rail: PaymentRail;
    payeeType: string;
  };
};

export type ChargeInitiation = {
  reference: string;
  displayText: string;
  providerRef: string;
  accepted: boolean;
  failureCode: string | null;
};

export type VerifiedCharge = {
  reference: string;
  providerRef: string;
  status: "success" | "failed" | "abandoned" | "pending";
  amountPesewas: bigint;
  currency: "GHS";
  feesPesewas: bigint | null;
  gatewayResponse: string | null;
};

export type TransferInput = {
  reference: string;
  amountPesewas: bigint;
  recipientCode: string;
};

export type ParsedWebhookEvent = {
  event: string;
  providerEventId: string;
  reference: string | null;
  payload: unknown;
};

export abstract class ProviderAdapter {
  abstract initiateCharge(input: ChargeInput): Promise<ChargeInitiation>;
  abstract verifyTransaction(reference: string): Promise<VerifiedCharge>;
  abstract initiateTransfer(input: TransferInput): Promise<{ transferCode: string }>;
  abstract parseWebhook(rawBody: Buffer, signature: string | undefined): ParsedWebhookEvent;
}
