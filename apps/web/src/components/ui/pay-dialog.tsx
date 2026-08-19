"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { paymentMethods, type BillId, type PaymentMethod } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { useActiveHouse, useDemoStore } from "@/lib/store";
import { cn } from "@/lib/cn";

export function PayDialog({
  billId,
  settleAll = false,
  unitId = null,
  open,
  onOpenChange,
}: {
  billId: BillId | null;
  settleAll?: boolean;
  unitId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const house = useActiveHouse();
  const bills = house.bills;
  const enabled = useDemoStore((s) => s.enabled);
  const payBill = useDemoStore((s) => s.payBill);
  const payAllDue = useDemoStore((s) => s.payAllDue);
  const payUnit = useDemoStore((s) => s.payUnit);
  const [method, setMethod] = useState<PaymentMethod>("mtn");
  const [busy, setBusy] = useState(false);

  const bill = billId ? bills[billId] : null;
  const unit = unitId ? house.units.find((item) => item.id === unitId) : null;
  const dueList = (Object.values(bills) as (typeof bills)[BillId][]).filter(
    (item) => enabled[item.service] && item.due > 0,
  );
  const amount = unit
    ? Number((unit.ecgDue + unit.waterDue).toFixed(2))
    : settleAll
      ? dueList.reduce((sum, item) => sum + item.due, 0)
      : (bill?.due ?? 0);
  const title = unit
    ? `Pay ${unit.name}`
    : settleAll
      ? "Pay everything due"
      : `Pay ${bill?.provider ?? ""}`;

  function confirm() {
    if (amount <= 0) return;
    setBusy(true);
    const run = new Promise<string>((resolve, reject) => {
      window.setTimeout(() => {
        try {
          if (unitId) {
            resolve(payUnit(unitId, method).ref);
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
        unit
          ? `Paid ${unit.name}. Ref ${ref}`
          : settleAll
            ? `Settled ${dueList.length} bills. Ref ${ref}`
            : `Paid ${bill?.provider}. Ref ${ref}`,
      error: "Payment did not go through",
    });

    run.finally(() => {
      setBusy(false);
      onOpenChange(false);
    });
  }

  if (!open || (!settleAll && !bill && !unit)) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim/45 transition-opacity duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-card p-5 outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <Dialog.Title className="font-display text-xl tracking-tight">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-mute">
            {unit
              ? `${compactCedis(unit.ecgDue)} ECG + ${compactCedis(unit.waterDue)} water.`
              : settleAll
                ? `${dueList.length} open bills on this account.`
                : `${bill?.account} · ${bill?.cycle}.`}
          </Dialog.Description>

          <p className="mt-5 font-display text-4xl tracking-tight tabular">
            {compactCedis(amount)}
          </p>

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

          <div className="mt-6 flex justify-end gap-2">
            <Button intent="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={busy || amount <= 0}>
              Confirm pay
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
