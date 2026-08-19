import { cn } from "@/lib/cn";

export function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "live" | "alert" | "ok";
}) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-3xl tracking-tight tabular",
          tone === "live" && "text-live",
          tone === "alert" && "text-alert",
          tone === "ok" && "text-grid",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-mute">{hint}</p> : null}
    </article>
  );
}
