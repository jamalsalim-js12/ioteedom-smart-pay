"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type BillListItemDto,
  getGetBillsQueryKey,
  getGetUnitsEcgStatusQueryKey,
  getPaymentsById,
  postPayments,
} from "@/api/generated/api";
import { ApiError } from "@/api/mutator";
import { Button } from "@/components/ui/button";
import {
  DialogActions,
  DialogBackdrop,
  DialogBody,
  DialogHeader,
  DialogPanel,
} from "@/components/ui/dialog-frame";
import { type PaymentMethod, paymentMethods } from "@/data/demo";
import { cn } from "@/lib/cn";
import { compactCedis } from "@/lib/format";
import { useAuthSession } from "@/lib/session";

function pesewasToCedis(value: string) {
  return Number(value) / 100;
}

function newIdempotencyKey() {
  return crypto.randomUUID();
}

export function EcgPayDialog({
  bill,
  open,
  onOpenChange,
}: {
  bill: BillListItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>("mtn");
  const [msisdn, setMsisdn] = useState(session?.phoneDisplay ?? "");
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMsisdn(session?.phoneDisplay ?? "");
      setStatusText(null);
      setBusy(false);
    }
  }, [open, session?.phoneDisplay]);

  if (!open || !bill) return null;

  const amountCedis = pesewasToCedis(bill.amountDuePesewas);

  async function confirm() {
    if (!bill || amountCedis <= 0) return;
    setBusy(true);
    setStatusText("Sending MoMo charge…");
    try {
      let view = await postPayments(
        {
          billId: bill.id,
          amountPesewas: Number(bill.amountDuePesewas),
          method,
          msisdn,
          rail: "direct",
        },
        { headers: { "Idempotency-Key": newIdempotencyKey() } },
      );

      if (view.status === "pending" || view.status === "created") {
        setStatusText(view.displayText);
        for (let i = 0; i < 12; i += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 800));
          view = await getPaymentsById(view.id);
          setStatusText(view.displayText);
          if (view.status !== "pending" && view.status !== "created") break;
        }
      }

      await queryClient.invalidateQueries({ queryKey: getGetBillsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetUnitsEcgStatusQueryKey() });

      if (view.status === "succeeded") {
        toast.success(view.displayText, { description: `Ref ${view.ourRef}` });
        onOpenChange(false);
      } else if (view.status === "failed" || view.status === "expired") {
        toast.error(view.displayText, { description: `Ref ${view.ourRef}` });
      } else {
        toast.message(view.displayText, {
          description: `Still pending · Ref ${view.ourRef}`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Payment did not go through";
      toast.error(message);
    } finally {
      setBusy(false);
      setStatusText(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBackdrop />
        <DialogPanel>
          <DialogHeader>
            <Dialog.Title className="font-display text-xl tracking-tight">Pay ECG</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-mute">
              Goes straight to ECG · {bill.accountNumber ?? "meter"}
              {bill.meterNumber ? ` · ${bill.meterNumber}` : ""}. MoMo may clear before ECG credits
              the meter.
            </Dialog.Description>
          </DialogHeader>
          <DialogBody>
            <p className="font-display text-4xl tracking-tight tabular">
              {compactCedis(amountCedis)}
            </p>
            {statusText ? <p className="mt-3 text-sm text-mute">{statusText}</p> : null}

            <label className="mt-5 block">
              <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                MoMo number
              </span>
              <input
                value={msisdn}
                onChange={(event) => setMsisdn(event.target.value)}
                className="h-11 w-full rounded-lg border border-line bg-field px-3 text-sm outline-none focus:border-ink"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>

            <p className="mt-5 mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              Pay with
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
                    method === item.id
                      ? "border-ink bg-ink text-on-ink"
                      : "border-line bg-field text-ink hover:border-ink/30",
                  )}
                >
                  {item.short}
                </button>
              ))}
            </div>
          </DialogBody>
          <DialogActions>
            <Button intent="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirm()}
              disabled={busy || amountCedis <= 0 || !msisdn.trim()}
            >
              Confirm pay
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
