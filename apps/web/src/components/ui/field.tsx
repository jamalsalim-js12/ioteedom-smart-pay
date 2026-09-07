"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">{label}</span>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          "mt-1.5 h-11 w-full rounded-lg border bg-card px-3 text-sm outline-none transition-[border-color] duration-150 ease-[var(--ease-out)] focus:border-ink",
          error ? "border-alert" : "border-line",
          className,
        )}
      />
      {error ? (
        <span id={errorId} role="alert" className="mt-1 block text-xs text-alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="mt-1 block text-xs text-mute">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
