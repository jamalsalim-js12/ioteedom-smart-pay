import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

export function BrandPane({
  kicker,
  title,
  body,
}: {
  kicker?: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative hidden h-full min-h-dvh flex-col justify-between overflow-hidden bg-stub p-10 text-white lg:flex">
      <div>
        <BrandMark size="lg" tone="onDark" priority />
        {kicker ? (
          <p className="mt-8 font-mono text-[11px] tracking-[0.22em] text-brass-soft uppercase">
            {kicker}
          </p>
        ) : null}
        <p
          className={cn(
            "font-display text-4xl leading-[1.05] tracking-tight",
            kicker ? "mt-3" : "mt-8",
          )}
        >
          {title}
        </p>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">{body}</p>
      </div>
      <p className="font-mono text-[11px] text-white/40">
        ECG · GWCL · meters · solar · EV
      </p>
      <span className="pointer-events-none absolute -right-8 -bottom-10 font-display text-[180px] leading-none text-white/5">
        SP
      </span>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[minmax(280px,42%)_1fr]">
      <div className="absolute top-4 right-4 z-20 lg:top-6 lg:right-6">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
