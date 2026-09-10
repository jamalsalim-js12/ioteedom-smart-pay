import type { ModuleId } from "./modules";
import type { FulfillmentStatus, PaymentRail, PaymentStatus } from "./rails";

export type InviteKind = "OWNER" | "TENANT";

export type AccountKind = "HOME" | "ESTATE";

export type HealthResponseDto = {
  ok: boolean;
  service: "api" | "worker";
  postgres?: "up" | "down";
  redis?: "up" | "down";
};

export type PaymentViewDto = {
  id: string;
  ourRef: string;
  amountPesewas: string;
  currency: "GHS";
  rail: PaymentRail;
  status: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  displayText: string;
};

export type ProvisionedModulesDto = Record<ModuleId, boolean>;
