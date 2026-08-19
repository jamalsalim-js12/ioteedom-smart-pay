"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { paymentMethods } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { type Payment, useDemoStore } from "@/lib/store";

export function ReceiptDocket({ payment }: { payment: Payment }) {
  const house = useDemoStore((s) =>
    Object.values(s.houses).find((item) => item.id === payment.propertyId),
  );
  const method =
    paymentMethods.find((item) => item.id === payment.method)?.name ??
    payment.method;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="docket-pips h-2.5 border-b border-dashed border-line" />
      <div className="px-5 py-5">
        <BrandMark size="sm" />
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
          Receipt
        </p>
        <p className="mt-2 font-display text-3xl tracking-tight tabular">
          {compactCedis(payment.amount)}
        </p>
        <p className="mt-1 text-sm text-mute">{payment.label}</p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-xs">
          <dt className="text-mute">Provider</dt>
          <dd>{payment.label.split("·")[0]?.trim()}</dd>
          <dt className="text-mute">Method</dt>
          <dd>{method}</dd>
          <dt className="text-mute">Ref</dt>
          <dd>{payment.ref}</dd>
          <dt className="text-mute">Account</dt>
          <dd>{payment.account ?? "—"}</dd>
          <dt className="text-mute">Time</dt>
          <dd>{payment.at}</dd>
          <dt className="text-mute">Property</dt>
          <dd>{house?.label ?? payment.propertyLabel ?? payment.propertyId}</dd>
        </dl>
      </div>
      <div className="docket-pips h-2.5 rotate-180 border-t border-dashed border-line" />
    </article>
  );
}

export function ReceiptDialog() {
  const router = useRouter();
  const receipt = useDemoStore((s) => s.receipt);
  const showReceipt = useDemoStore((s) => s.showReceipt);
  const phone = useDemoStore((s) => s.profile.phone || s.session?.phone || "");

  return (
    <Dialog.Root
      open={receipt != null}
      onOpenChange={(open) => {
        if (!open) showReceipt(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim/45 transition-opacity duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-card p-5 outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <Dialog.Title className="font-display text-xl tracking-tight">
            Paid
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-mute">
            Keep this docket for your records.
          </Dialog.Description>
          {receipt ? (
            <div className="mt-4">
              <ReceiptDocket payment={receipt} />
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              intent="ghost"
              type="button"
              onClick={() => {
                toast.success(`Receipt sent to ${phone || "your phone"}`);
              }}
            >
              Resend
            </Button>
            {receipt ? (
              <Button
                intent="ghost"
                type="button"
                onClick={() => {
                  const ref = receipt.ref;
                  showReceipt(null);
                  router.push(`/receipts/${ref}`);
                }}
              >
                Download
              </Button>
            ) : null}
            <Button type="button" onClick={() => showReceipt(null)}>
              Done
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ViewReceiptButton({ payment }: { payment: Payment }) {
  const showReceipt = useDemoStore((s) => s.showReceipt);
  if (payment.status !== "success") return null;
  return (
    <Button
      size="sm"
      intent="ghost"
      className="mt-2"
      onClick={() => showReceipt(payment)}
    >
      View receipt
    </Button>
  );
}

export function paymentStatusClass(status: Payment["status"]) {
  if (status === "success") return "text-xs text-grid";
  if (status === "failed") return "text-xs text-alert";
  if (status === "refunded") return "text-xs text-brass";
  return "text-xs text-mute";
}
