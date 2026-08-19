import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-card shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        {eyebrow ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-lg tracking-tight text-ink">{title}</h2>
      </div>
      {action}
    </header>
  );
}
