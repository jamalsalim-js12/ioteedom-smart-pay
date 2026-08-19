import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        {label}
      </span>
      <input
        {...props}
        className={cn(
          "mt-1.5 h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none transition-[border-color] duration-150 ease-[var(--ease-out)] focus:border-ink",
          className,
        )}
      />
      {hint ? <span className="mt-1 block text-xs text-mute">{hint}</span> : null}
    </label>
  );
}
