"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { Facts } from "@/components/ops/facts";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  ReceiptDocket,
  paymentStatusClass,
} from "@/components/ui/receipt-dialog";
import { paymentMethods } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { propertyLabel, routeParam, useOpsSnapshot } from "@/lib/ops";
import { useDemoStore } from "@/lib/store";

export default function OpsPaymentDetailPage() {
  const id = routeParam(useParams<{ id: string }>().id);
  const { payments } = useOpsSnapshot();
  const houses = useDemoStore((s) => s.houses);
  const retryPayment = useDemoStore((s) => s.retryPayment);
  const refundPayment = useDemoStore((s) => s.refundPayment);
  const payment = payments.find((item) => item.id === id);
  const method = payment
    ? paymentMethods.find((item) => item.id === payment.method)?.name ??
      payment.method
    : "";

  if (!payment) {
    return (
      <div className="enter">
        <OpsTopbar backHref="/admin/payments" kicker="Not found" title="Payment" />
        <div className="p-6">
          <Panel>
            <EmptyState
              icon={Search}
              title="No payment here"
              body={`Nothing matches ${id}.`}
            />
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div className="enter">
      <OpsTopbar
        backHref="/admin/payments"
        kicker={payment.ref}
        title={payment.label}
      />
      <div className="flex flex-col gap-5 p-6 xl:grid xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Panel>
          <PanelHeader
            eyebrow="Docket"
            title={compactCedis(payment.amount)}
            action={<p className={paymentStatusClass(payment.status)}>{payment.status}</p>}
          />
          <Facts
            rows={[
              { label: "Ref", value: payment.ref },
              { label: "Method", value: method },
              { label: "Account", value: payment.account ?? "—" },
              { label: "Time", value: payment.at },
              {
                label: "Property",
                value: (
                  <Link
                    href={`/admin/accounts/${payment.propertyId}`}
                    className="underline"
                  >
                    {propertyLabel(payment, houses)}
                  </Link>
                ),
              },
            ]}
          />
          {(payment.status === "failed" || payment.status === "success") ? (
            <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
              {payment.status === "failed" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const next = retryPayment(payment.id);
                    if (next) toast.success(`Retried · ${next.ref}`);
                  }}
                >
                  Retry
                </Button>
              ) : (
                <Button
                  size="sm"
                  intent="ghost"
                  onClick={() => {
                    const next = refundPayment(payment.id);
                    if (next) toast.success(`Refunded ${payment.ref}`);
                  }}
                >
                  Refund
                </Button>
              )}
            </div>
          ) : null}
        </Panel>
        {payment.status === "success" ? (
          <ReceiptDocket payment={payment} />
        ) : (
          <Panel>
            <EmptyState
              icon={FileText}
              title="No receipt"
              body={
                payment.status === "failed"
                  ? "This top-up did not clear. Retry from the docket."
                  : payment.status === "pending"
                    ? "Still sitting on the rail. No receipt yet."
                    : "No receipt for this row."
              }
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
