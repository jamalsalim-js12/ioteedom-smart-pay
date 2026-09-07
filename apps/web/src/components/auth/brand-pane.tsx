import type { ComponentPropsWithoutRef, ReactNode } from "react";
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
        ECG · water through the owner · meters · solar · EV
      </p>
      <span className="pointer-events-none absolute -right-8 -bottom-10 font-display text-[180px] leading-none text-white/5">
        SP
      </span>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh lg:h-dvh lg:grid-cols-[minmax(280px,42%)_1fr] lg:overflow-hidden">
      <div className="absolute top-4 right-4 z-20 lg:top-6 lg:right-6">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}

export function AuthColumn({
  children,
  actions,
  size = "sm",
  className,
  ...props
}: ComponentPropsWithoutRef<"form"> & {
  children: ReactNode;
  actions: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <form className={cn("flex h-dvh min-h-0 flex-col bg-field lg:h-full", className)} {...props}>
      <div
        className={cn(
          "mx-auto my-auto flex max-h-full min-h-0 w-full flex-col overflow-hidden",
          size === "md" ? "max-w-md" : "max-w-sm",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-12 pb-4 scrollbar-gutter-stable">
          {children}
        </div>
        <div className="relative shrink-0 bg-field px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-linear-to-t from-field to-transparent" />
          {actions}
        </div>
      </div>
    </form>
  );
}
