"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DialogActions,
  DialogBackdrop,
  DialogBody,
  DialogHeader,
  DialogPanel,
} from "@/components/ui/dialog-frame";
import { type BillId, type PaymentMethod, paymentMethods } from "@/data/demo";
import { cn } from "@/lib/cn";
import { compactCedis } from "@/lib/format";
import { railHint } from "@/lib/house";
import { useActiveHouse, useDemoStore, useEnabled } from "@/lib/store";

export function PayDialog({
  billId,
  settleAll = false,
  open,
  onOpenChange,
}: {
  billId: BillId | null;
  settleAll?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const house = useActiveHouse();
  const bills = house.bills;
  const enabled = useEnabled();
  const session = useDemoStore((s) => s.session);
  const payBill = useDemoStore((s) => s.payBill);
  const payAllDue = useDemoStore((s) => s.payAllDue);
  const collectTenantWater = useDemoStore((s) => s.collectTenantWater);
  const payTenantEcg = useDemoStore((s) => s.payTenantEcg);
  const [method, setMethod] = useState<PaymentMethod>("mtn");
  const [busy, setBusy] = useState(false);

  const tenant = session?.role === "tenant" ? session : null;
  const unit = tenant ? house.units.find((item) => item.id === tenant.unitId) : null;
  const bill = billId ? bills[billId] : null;
  const dueList = (Object.values(bills) as (typeof bills)[BillId][]).filter((item) => {
    if (!enabled[item.service] || item.due <= 0) return false;
    if (house.kind === "estate" && item.id === "ecg") return false;
    return true;
  });
  const tenantAmount = unit
    ? settleAll
      ? Number((unit.ecgDue + unit.waterDue).toFixed(2))
      : billId === "water"
        ? unit.waterDue
        : billId === "ecg"
          ? unit.ecgDue
          : 0
    : 0;
  const amount = tenant
    ? tenantAmount
    : settleAll
      ? dueList.reduce((sum, item) => sum + item.due, 0)
      : (bill?.due ?? 0);

  const destination = tenant ? (billId === "water" ? house.ownerName : "ECG") : bill?.destination;
  const title = settleAll
    ? "Pay everything due"
    : tenant && billId === "water"
      ? `Pay ${house.ownerName}`
      : `Pay ${destination ?? ""}`;

  function confirm() {
    if (amount <= 0) return;
    setBusy(true);
    const run = new Promise<string>((resolve, reject) => {
      window.setTimeout(() => {
        try {
          if (tenant) {
            if (settleAll) {
              const paid = payAllDue(method);
              resolve(paid[0]?.ref ?? "—");
            } else if (billId === "water") {
              resolve(collectTenantWater(tenant.unitId, method).ref);
            } else if (billId === "ecg") {
              resolve(payTenantEcg(tenant.unitId, method).ref);
            } else {
              resolve("—");
            }
          } else if (settleAll) {
            const paid = payAllDue(method);
            resolve(paid[0]?.ref ?? "—");
          } else if (billId && bill) {
            resolve(payBill(billId, bill.due, method).ref);
          } else {
            resolve("—");
          }
        } catch {
          reject(new Error("Payment did not go through"));
        }
      }, 700);
    });

    toast.promise(run, {
      loading: `Sending ${compactCedis(amount)} via ${paymentMethods.find((m) => m.id === method)?.name}…`,
      success: (ref) =>
        settleAll
          ? `Settled ${tenant ? "your bills" : `${dueList.length} bills`}. Ref ${ref}`
          : `Paid ${destination}. Ref ${ref}`,
      error: "Payment did not go through",
    });

    run.finally(() => {
      setBusy(false);
      onOpenChange(false);
    });
  }

  if (!open || (!settleAll && !bill && !tenant)) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogBackdrop />
        <DialogPanel>
          <DialogHeader>
            <Dialog.Title className="font-display text-xl tracking-tight">{title}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-mute">
              {settleAll
                ? tenant
                  ? "ECG goes to ECG. Water goes to your landlord."
                  : house.kind === "estate"
                    ? "This remits Ghana Water and any other owner bills. Tenant ECG stays with the tenant."
                    : `${dueList.length} open bills on this account.`
                : tenant && billId === "water"
                  ? `${unit?.waterM3 ?? "—"} m³ this cycle. This pays your landlord, not Ghana Water.`
                  : tenant && billId === "ecg"
                    ? "This goes straight to ECG."
                    : bill
                      ? `${railHint(bill)} · ${bill.account} · ${bill.cycle}.`
                      : ""}
            </Dialog.Description>
          </DialogHeader>
          <DialogBody>
            <p className="font-display text-4xl tracking-tight tabular">{compactCedis(amount)}</p>

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
            <Button onClick={confirm} disabled={busy || amount <= 0}>
              Confirm pay
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
