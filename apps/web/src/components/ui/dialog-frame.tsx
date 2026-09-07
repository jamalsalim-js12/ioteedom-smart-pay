"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const popupClass =
  "fixed top-1/2 left-1/2 z-50 flex max-h-[min(90dvh,720px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-line bg-card outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95";

export function DialogBackdrop() {
  return (
    <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim/45 transition-opacity duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
  );
}

export function DialogPanel({
  children,
  className,
  size = "sm",
  ...props
}: ComponentProps<typeof Dialog.Popup> & { size?: "sm" | "md" }) {
  return (
    <Dialog.Popup
      className={cn(
        popupClass,
        size === "md" ? "w-[min(92vw,520px)]" : "w-[min(92vw,420px)]",
        className,
      )}
      {...props}
    >
      {children}
    </Dialog.Popup>
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("shrink-0 px-5 pt-5", className)}>{children}</div>;
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 scrollbar-gutter-stable",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-wrap justify-end gap-2 border-t border-line bg-card px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-linear-to-t from-card to-transparent" />
      {children}
    </div>
  );
}
