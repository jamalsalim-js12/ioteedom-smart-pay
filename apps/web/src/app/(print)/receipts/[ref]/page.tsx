"use client";

import { useParams, useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ReceiptDocket } from "@/components/ui/receipt-dialog";
import { useDemoStore } from "@/lib/store";

export default function ReceiptPrintPage() {
  const params = useParams<{ ref: string }>();
  const ref = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const router = useRouter();
  const payment = useDemoStore((s) =>
    [
      ...Object.values(s.houses).flatMap((house) => house.payments),
      ...s.platformPayments,
    ].find((item) => item.ref === ref),
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 py-8">
      <div className="no-print flex items-center justify-between gap-3">
        <Button intent="ghost" type="button" onClick={() => router.back()}>
          Back
        </Button>
        <Button type="button" onClick={() => window.print()} disabled={!payment}>
          Download
        </Button>
      </div>
      {payment ? (
        <ReceiptDocket payment={payment} />
      ) : (
        <div className="rounded-2xl border border-line bg-card">
          <EmptyState
            icon={FileText}
            title="No receipt"
            body={`Nothing for ${ref}.`}
          />
        </div>
      )}
      <p className="no-print text-center font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        Print this page to save a copy
      </p>
    </div>
  );
}
