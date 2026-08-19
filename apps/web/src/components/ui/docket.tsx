import { Button } from "@/components/ui/button";
import { compactCedis } from "@/lib/format";
import { cn } from "@/lib/cn";

const stubTone: Record<string, string> = {
  ECG: "bg-live",
  GWCL: "bg-water",
  Zoomlion: "bg-grid",
  "Telecel Home": "bg-brass",
};

export function Docket({
  provider,
  account,
  meter,
  label,
  due,
  credit,
  dueDate,
  cycle,
  onPay,
}: {
  provider: string;
  account: string;
  meter?: string;
  label: string;
  due: number;
  credit?: number;
  dueDate: string;
  cycle: string;
  onPay?: () => void;
}) {
  const paid = due <= 0;

  return (
    <article className="grid overflow-hidden rounded-2xl border border-line bg-card md:grid-cols-[44px_1fr]">
      <div
        className={cn(
          "hidden items-center justify-center md:flex",
          stubTone[provider] ?? "bg-navy",
        )}
      >
        <span className="rotate-180 font-mono text-[10px] font-semibold tracking-[0.22em] text-paper uppercase [writing-mode:vertical-rl]">
          {provider}
        </span>
      </div>
      <div>
        <div className="docket-pips h-2.5 border-b border-dashed border-line" />
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              {label} · {cycle}
            </p>
            <p className="mt-1 font-display text-3xl tracking-tight tabular">
              {paid ? "Settled" : compactCedis(due)}
            </p>
            <p className="mt-2 truncate font-mono text-xs text-mute">
              {account}
              {meter ? ` · ${meter}` : ""}
            </p>
            <p className="mt-1 text-sm text-mute">
              {paid ? "Nothing on this cycle." : `Due ${dueDate}`}
              {credit != null ? ` · prepaid ${compactCedis(credit)}` : ""}
            </p>
          </div>
          {onPay ? (
            <Button
              intent={paid ? "ghost" : "primary"}
              disabled={paid}
              onClick={onPay}
            >
              {paid ? "Paid" : "Pay now"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
