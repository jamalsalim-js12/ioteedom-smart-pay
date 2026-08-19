"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  ViewReceiptButton,
  paymentStatusClass,
} from "@/components/ui/receipt-dialog";
import { paymentMethods } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { propertyLabel, useOpsSnapshot } from "@/lib/ops";
import { useDemoStore } from "@/lib/store";

export default function OpsPaymentsPage() {
  const { payments } = useOpsSnapshot();
  const houses = useDemoStore((s) => s.houses);
  const retryPayment = useDemoStore((s) => s.retryPayment);
  const refundPayment = useDemoStore((s) => s.refundPayment);

  return (
    <div className="enter">
      <OpsTopbar kicker="Every property on one rail" title="Payments" />
      <div className="p-6">
        <Panel>
          <PanelHeader
            eyebrow="Ledger"
            title="MoMo across the platform"
            action={
              <p className="font-mono text-xs text-mute">
                {payments.length} rows
              </p>
            }
          />
          {payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments"
              body="MoMo that clears will show on this ledger."
            />
          ) : (
            <ul className="divide-y divide-line">
              {payments.map((item) => {
                const actions =
                  item.status === "failed" || item.status === "success";
                return (
                  <li key={item.id} className="flex items-stretch">
                    <Link
                      href={`/admin/payments/${item.id}`}
                      className="min-w-0 flex-1 px-5 py-4 transition-colors hover:bg-field"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="mt-1 font-mono text-xs text-mute">
                            {item.ref} · {propertyLabel(item, houses)} ·{" "}
                            {paymentMethods.find((m) => m.id === item.method)?.name}{" "}
                            · {item.at}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="tabular font-medium">
                            {compactCedis(item.amount)}
                          </p>
                          <p className={paymentStatusClass(item.status)}>
                            {item.status}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {actions ? (
                      <div className="flex shrink-0 flex-col items-end justify-center gap-2 py-4 pr-5">
                        <ViewReceiptButton payment={item} />
                        {item.status === "failed" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              const next = retryPayment(item.id);
                              if (next) toast.success(`Retried · ${next.ref}`);
                            }}
                          >
                            Retry
                          </Button>
                        ) : null}
                        {item.status === "success" ? (
                          <Button
                            size="sm"
                            intent="ghost"
                            onClick={() => {
                              const next = refundPayment(item.id);
                              if (next) toast.success(`Refunded ${item.ref}`);
                            }}
                          >
                            Refund
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
