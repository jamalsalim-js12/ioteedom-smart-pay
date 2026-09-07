export const PAYMENT_RAILS = ["direct", "collect", "remit"] as const;

export type PaymentRail = (typeof PAYMENT_RAILS)[number];

export const PAYMENT_STATUSES = [
  "created",
  "pending",
  "succeeded",
  "failed",
  "expired",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_STATUSES = ["not_required", "pending", "succeeded", "failed"] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const MOMO_NETWORKS = {
  mtn: {
    id: "mtn",
    label: "MTN MoMo",
    paystackProvider: "mtn",
    transferBankCode: "MTN",
  },
  telecel: {
    id: "telecel",
    label: "Telecel Cash",
    paystackProvider: "vod",
    transferBankCode: "VOD",
  },
  at: {
    id: "at",
    label: "AT Money",
    paystackProvider: "atl",
    transferBankCode: "ATL",
  },
} as const;

export type MomoNetworkId = keyof typeof MOMO_NETWORKS;

export function isPaymentRail(value: string): value is PaymentRail {
  return (PAYMENT_RAILS as readonly string[]).includes(value);
}
