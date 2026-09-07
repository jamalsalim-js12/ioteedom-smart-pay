"use client";

import { PIN_LENGTH } from "@ioteedom/shared";
import { type RefObject, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const slots = Array.from({ length: PIN_LENGTH }, (_, index) => index);
const PEEK_MS = 700;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PinField({
  label,
  value,
  onChange,
  onComplete,
  autoComplete = "one-time-code",
  disabled = false,
  name,
  error,
  hint,
  autoFocus = false,
  mask = true,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (pin: string) => void;
  onComplete?: (pin: string) => void;
  autoComplete?: "one-time-code" | "current-password" | "new-password";
  disabled?: boolean;
  name?: string;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  mask?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const localRef = useRef<HTMLInputElement>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(!mask);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const digits = value.replace(/\D/g, "").slice(0, PIN_LENGTH);
  const activeIndex = Math.min(digits.length, PIN_LENGTH - 1);
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  useEffect(() => {
    if (!error) return;
    setShake(false);
    const frame = requestAnimationFrame(() => setShake(true));
    return () => cancelAnimationFrame(frame);
  }, [error]);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    localRef.current?.focus();
  }, [autoFocus, disabled]);

  useEffect(() => {
    return () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
    };
  }, []);

  function setDigits(next: string) {
    const previous = digits;
    onChange(next);
    if (next.length > previous.length) {
      const index = next.length - 1;
      setPeekIndex(index);
      if (peekTimer.current) clearTimeout(peekTimer.current);
      if (!prefersReducedMotion()) {
        peekTimer.current = setTimeout(() => setPeekIndex(null), PEEK_MS);
      }
    } else {
      setPeekIndex(null);
    }
    if (next.length === PIN_LENGTH && previous.length !== PIN_LENGTH) {
      onComplete?.(next);
    }
  }

  return (
    <div className={cn("min-w-0", disabled && "opacity-60")}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
          {label}
        </label>
        <button
          type="button"
          className="min-h-11 cursor-pointer py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mute hover:text-ink"
          aria-pressed={visible}
          aria-label={visible ? "Hide PIN digits" : "Show PIN digits"}
          disabled={disabled}
          onClick={() => {
            setVisible((current) => !current);
            localRef.current?.focus();
          }}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <div
        className={cn("relative mt-1.5", shake && "pin-shake")}
        onAnimationEnd={() => setShake(false)}
      >
        <input
          ref={(node) => {
            localRef.current = node;
            if (inputRef) inputRef.current = node;
          }}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          pattern="[0-9]*"
          maxLength={PIN_LENGTH}
          enterKeyHint="done"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          value={digits}
          onChange={(event) =>
            setDigits(event.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
          }
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setPeekIndex(null);
          }}
          className="absolute inset-0 z-10 cursor-text touch-manipulation bg-transparent text-transparent caret-transparent outline-none disabled:cursor-not-allowed"
        />
        <div className="grid grid-cols-4 gap-3">
          {slots.map((index) => {
            const active = focused && !error && index === activeIndex;
            const digit = digits[index];
            const showDigit = Boolean(digit && (visible || peekIndex === index));
            return (
              <div
                key={index}
                aria-hidden="true"
                className={cn(
                  "flex h-16 min-w-0 items-center justify-center rounded-xl border bg-card font-mono text-2xl tracking-widest transition-[border-color,box-shadow] duration-150 ease-out",
                  error
                    ? "border-alert"
                    : active
                      ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]"
                      : "border-line",
                )}
              >
                {digit ? (showDigit ? digit : "●") : ""}
              </div>
            );
          })}
        </div>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-2 text-xs text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
