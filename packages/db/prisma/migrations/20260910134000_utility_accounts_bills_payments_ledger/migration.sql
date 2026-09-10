-- CreateEnum
CREATE TYPE "UtilityService" AS ENUM ('ecg', 'water', 'waste', 'internet');

-- CreateEnum
CREATE TYPE "UtilityMode" AS ENUM ('prepaid', 'postpaid', 'unknown');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ecg_postpaid', 'ecg_prepaid', 'water_tenant', 'water_gwcl', 'utility');

-- CreateEnum
CREATE TYPE "PaymentRail" AS ENUM ('direct', 'collect', 'remit');

-- CreateEnum
CREATE TYPE "PayeeType" AS ENUM ('ecg', 'gwcl', 'owner', 'utility', 'ev_wallet');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('open', 'paid', 'void');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'pending', 'succeeded', 'failed', 'expired', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('mtn', 'telecel', 'at', 'card');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('none', 'pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('not_required', 'pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "LedgerKind" AS ENUM ('ecg_out', 'water_collect_in', 'water_remit_out', 'utility_out', 'wallet_in', 'wallet_out', 'fee');

-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('debit', 'credit');

-- CreateTable
CREATE TABLE "utility_accounts" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "service" "UtilityService" NOT NULL,
    "biller" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "meter_number" TEXT,
    "mode" "UtilityMode" NOT NULL DEFAULT 'unknown',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utility_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "type" "BillType" NOT NULL,
    "rail" "PaymentRail" NOT NULL,
    "account_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "occupancy_id" TEXT,
    "utility_account_id" TEXT,
    "cycle" TEXT NOT NULL,
    "due_at" DATE,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "amount_due_pesewas" BIGINT NOT NULL,
    "amount_original_pesewas" BIGINT NOT NULL,
    "payee_type" "PayeeType" NOT NULL,
    "payee_label" TEXT NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'open',
    "usage_m3" DECIMAL(12,3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "our_ref" TEXT NOT NULL,
    "bill_id" TEXT,
    "retry_of_id" TEXT,
    "account_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "occupancy_id" TEXT,
    "payer_user_id" TEXT NOT NULL,
    "payee_type" "PayeeType" NOT NULL,
    "payee_label" TEXT NOT NULL,
    "rail" "PaymentRail" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "amount_pesewas" BIGINT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "provider_ref" TEXT,
    "transfer_code" TEXT,
    "biller_ref" TEXT,
    "collection_status" "CollectionStatus" NOT NULL DEFAULT 'none',
    "fulfillment_status" "FulfillmentStatus" NOT NULL DEFAULT 'not_required',
    "idempotency_key" TEXT NOT NULL,
    "failure_code" TEXT,
    "receipt_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "kind" "LedgerKind" NOT NULL,
    "direction" "LedgerDirection" NOT NULL,
    "amount_pesewas" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "utility_accounts_property_id_idx" ON "utility_accounts"("property_id");

-- CreateIndex
CREATE INDEX "utility_accounts_unit_id_idx" ON "utility_accounts"("unit_id");

-- CreateIndex
CREATE INDEX "bills_account_id_status_idx" ON "bills"("account_id", "status");

-- CreateIndex
CREATE INDEX "bills_property_id_idx" ON "bills"("property_id");

-- CreateIndex
CREATE INDEX "bills_occupancy_id_idx" ON "bills"("occupancy_id");

-- CreateIndex
CREATE INDEX "bills_utility_account_id_idx" ON "bills"("utility_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_our_ref_key" ON "payments"("our_ref");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_account_id_created_at_idx" ON "payments"("account_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payments_provider_ref_idx" ON "payments"("provider_ref");

-- CreateIndex
CREATE INDEX "payments_bill_id_idx" ON "payments"("bill_id");

-- CreateIndex
CREATE INDEX "payments_payer_user_id_idx" ON "payments"("payer_user_id");

-- CreateIndex
CREATE INDEX "ledger_entries_payment_id_idx" ON "ledger_entries"("payment_id");

-- CreateIndex
CREATE INDEX "ledger_entries_account_id_created_at_idx" ON "ledger_entries"("account_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ledger_entries_property_id_kind_idx" ON "ledger_entries"("property_id", "kind");

-- AddForeignKey
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_occupancy_id_fkey" FOREIGN KEY ("occupancy_id") REFERENCES "occupancies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_utility_account_id_fkey" FOREIGN KEY ("utility_account_id") REFERENCES "utility_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_retry_of_id_fkey" FOREIGN KEY ("retry_of_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_occupancy_id_fkey" FOREIGN KEY ("occupancy_id") REFERENCES "occupancies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_user_id_fkey" FOREIGN KEY ("payer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- One ECG (or other service) ledger per unit meter; one property-level ledger when unit_id is null (owner ECG / GWCL).
CREATE UNIQUE INDEX "utility_accounts_one_per_unit_service"
  ON "utility_accounts" ("property_id", "unit_id", "service")
  WHERE "unit_id" IS NOT NULL;
CREATE UNIQUE INDEX "utility_accounts_one_property_service"
  ON "utility_accounts" ("property_id", "service")
  WHERE "unit_id" IS NULL;

-- GWCL accounts are property-level. ECG may be property or unit.
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_water_property_chk"
  CHECK ("service" <> 'water' OR "unit_id" IS NULL);

ALTER TABLE "bills" ADD CONSTRAINT "bills_currency_chk" CHECK ("currency" = 'GHS');
ALTER TABLE "bills" ADD CONSTRAINT "bills_amounts_chk"
  CHECK ("amount_due_pesewas" >= 0 AND "amount_original_pesewas" >= 0 AND "amount_due_pesewas" <= "amount_original_pesewas");
ALTER TABLE "bills" ADD CONSTRAINT "bills_rail_chk" CHECK (
  ("type" IN ('ecg_postpaid', 'ecg_prepaid') AND "rail" = 'direct' AND "payee_type" = 'ecg')
  OR ("type" = 'water_tenant' AND "rail" = 'collect' AND "payee_type" = 'owner')
  OR ("type" = 'water_gwcl' AND "rail" IN ('remit', 'direct') AND "payee_type" = 'gwcl')
  OR ("type" = 'utility' AND "rail" = 'direct' AND "payee_type" = 'utility')
);

ALTER TABLE "payments" ADD CONSTRAINT "payments_currency_chk" CHECK ("currency" = 'GHS');
ALTER TABLE "payments" ADD CONSTRAINT "payments_provider_chk" CHECK ("provider" = 'paystack');
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_chk" CHECK ("amount_pesewas" >= 0);

CREATE INDEX "payments_pending_idx" ON "payments" ("status") WHERE "status" IN ('created', 'pending');

ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_amount_chk" CHECK ("amount_pesewas" > 0);
