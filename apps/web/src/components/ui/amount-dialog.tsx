"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { paymentMethods, type PaymentMethod } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { cn } from "@/lib/cn";

const presets = [50, 100, 200, 500];

export function AmountDialog({
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, method: PaymentMethod) => Promise<string> | string;
}) {
  const [method, setMethod] = useState<PaymentMethod>("mtn");
  const [amount, setAmount] = useState(100);
  const [busy, setBusy] = useState(false);

  function confirm() {
    if (amount <= 0) return;
    setBusy(true);
    const run = Promise.resolve(onConfirm(amount, method));
    toast.promise(run, {
      loading: `Sending ${compactCedis(amount)}…`,
      success: (ref) => `Done. Ref ${ref}`,
      error: "That did not go through",
    });
    run.finally(() => {
      setBusy(false);
      onOpenChange(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim/45 transition-opacity duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-card p-5 outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <Dialog.Title className="font-display text-xl tracking-tight">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-mute">
            {description}
          </Dialog.Description>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {presets.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={cn(
                  "h-10 rounded-lg border text-sm tabular transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
                  amount === value
                    ? "border-ink bg-ink text-on-ink"
                    : "border-line bg-field",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 h-11 w-full rounded-lg border border-line bg-card px-3 tabular outline-none focus:border-ink"
          />

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
                    : "border-line bg-field",
                )}
              >
                {item.short}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button intent="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={busy || amount <= 0}>
              Confirm {compactCedis(amount)}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
