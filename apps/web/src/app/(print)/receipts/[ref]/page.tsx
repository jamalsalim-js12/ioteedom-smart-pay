"use client";

import { useEffect } from "react";
import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ReceiptDocket } from "@/components/ui/receipt-dialog";
import { useDemoStore } from "@/lib/store";

export default function ReceiptPrintPage() {
  const params = useParams<{ ref: string }>();
  const ref = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const router = useRouter();
  const docketRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const payment = useDemoStore((s) =>
    [
      ...Object.values(s.houses).flatMap((house) => house.payments),
      ...s.platformPayments,
    ].find((item) => item.ref === ref),
  );

  useEffect(() => {
    const previous = document.title;
    document.title = `receipt-${ref}`;
    return () => {
      document.title = previous;
    };
  }, [ref]);

  async function downloadPdf() {
    if (!docketRef.current || !payment || saving) return;
    setSaving(true);
    try {
      const images = Array.from(
        docketRef.current.querySelectorAll("img"),
      ) as HTMLImageElement[];
      await Promise.all(
        images.map(async (img) => {
          if (img.complete && img.naturalWidth > 0) return;
          try {
            await img.decode();
          } catch {
            // If decode fails, proceed with best effort capture.
          }
        }),
      );
      const canvas = await html2canvas(docketRef.current, {
        backgroundColor: "#ffffff",
        scale: Math.max(3, window.devicePixelRatio || 1),
        useCORS: true,
        imageTimeout: 15000,
      });
      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      const y = Math.max(margin, (pageHeight - contentHeight) / 2);
      pdf.addImage(image, "PNG", margin, y, contentWidth, contentHeight);
      pdf.save(`receipt-${payment.ref}.pdf`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 py-8">
      <div className="no-print flex items-center justify-between gap-3">
        <Button intent="ghost" type="button" onClick={() => router.back()}>
          Back
        </Button>
        <Button type="button" onClick={downloadPdf} disabled={!payment || saving}>
          {saving ? "Saving..." : "Download"}
        </Button>
      </div>
      {payment ? (
        <div ref={docketRef}>
          <ReceiptDocket payment={payment} />
        </div>
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
        Download saves a branded PDF copy
      </p>
    </div>
  );
}
