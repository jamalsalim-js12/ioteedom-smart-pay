"use client";

import { formatGhPhoneDisplay, isPin, normalizeGhPhone } from "@ioteedom/shared";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { usePostAuthLogin } from "@/api/generated/api";
import { ApiError } from "@/api/mutator";
import { AuthColumn, BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PinField } from "@/components/ui/pin-field";
import { useAuthSession } from "@/lib/session";

export const SEED_OWNER_PHONE = "024 412 8891";
export const SEED_OWNER_PIN = "2468";
export const SEED_STAFF_PHONE = "020 000 0001";
export const SEED_STAFF_PIN = "1357";

function loginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return "This account can’t sign in right now. Contact IoTeedom.";
    if (error.status === 429) return "Too many tries. Wait a few minutes, then try again.";
    return error.message || "That phone and PIN don’t match. Try again.";
  }
  return "We couldn’t sign you in. Try again.";
}

export default function LoginPage() {
  const login = usePostAuthLogin();
  const { applyTokens } = useAuthSession();
  const pinRef = useRef<HTMLInputElement>(null);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const busy = login.isPending;

  useEffect(() => {
    return () => {
      if (submitTimer.current) clearTimeout(submitTimer.current);
    };
  }, []);

  async function submitPhone(nextPhone: string, nextPin: string) {
    if (busy) return;
    setPhoneError(null);
    setPinError(null);
    setFormError(null);
    try {
      const tokens = await login.mutateAsync({ data: { phone: nextPhone, pin: nextPin } });
      applyTokens(tokens);
    } catch (caught) {
      const message = loginErrorMessage(caught);
      const status = caught instanceof ApiError ? caught.status : 0;
      if (status === 403 || status === 429) {
        setFormError(message);
      } else {
        setPinError(message);
        setPin("");
        pinRef.current?.focus();
      }
    }
  }

  function queueSubmit(nextPhone: string, nextPin: string) {
    if (submitTimer.current) clearTimeout(submitTimer.current);
    submitTimer.current = setTimeout(() => {
      void submitPhone(nextPhone, nextPin);
    }, 180);
  }

  function readyPhone(nextPhone: string) {
    const formatted = formatGhPhoneDisplay(nextPhone);
    if (normalizeGhPhone(formatted)) return formatted;
    setPhoneError("Enter a Ghana number, like 024 412 8891.");
    return null;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const nextPhone = readyPhone(phone);
    if (!nextPhone) return;
    if (!isPin(pin)) {
      setPinError("Enter all 4 digits.");
      pinRef.current?.focus();
      return;
    }
    void submitPhone(nextPhone, pin);
  }

  return (
    <>
      <BrandPane
        kicker="Smart Pay"
        title="One place for the house bills."
        body="IoTeedom invites the owner and turns on the right services. You pay ECG to ECG. Tenants pay water to you, and you pay Ghana Water."
      />
      <AuthColumn
        onSubmit={submit}
        className="enter"
        aria-busy={busy}
        actions={
          <>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <p className="mt-4 text-center text-xs text-mute">
              Demo{" "}
              <button
                type="button"
                className="cursor-pointer underline decoration-line underline-offset-2 hover:text-ink"
                disabled={busy}
                onClick={() => {
                  setPhone(SEED_OWNER_PHONE);
                  setPin(SEED_OWNER_PIN);
                  void submitPhone(SEED_OWNER_PHONE, SEED_OWNER_PIN);
                }}
              >
                property owner
              </button>
              {" · "}
              <button
                type="button"
                className="cursor-pointer underline decoration-line underline-offset-2 hover:text-ink"
                disabled={busy}
                onClick={() => {
                  setPhone(SEED_STAFF_PHONE);
                  setPin(SEED_STAFF_PIN);
                  void submitPhone(SEED_STAFF_PHONE, SEED_STAFF_PIN);
                }}
              >
                operator
              </button>
            </p>
          </>
        }
      >
        <div className="mb-8 lg:hidden">
          <BrandMark size="md" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Sign in</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Welcome back</h1>
        <div className="mt-8 flex flex-col gap-4">
          <Field
            label="Phone"
            inputMode="tel"
            autoComplete="username"
            autoFocus
            placeholder="024 412 8891"
            value={phone}
            error={phoneError ?? undefined}
            onChange={(e) => {
              const next = formatGhPhoneDisplay(e.target.value);
              setPhone(next);
              setPhoneError(null);
              setFormError(null);
              if (isPin(pin) && normalizeGhPhone(next)) queueSubmit(next, pin);
            }}
            required
          />
          <PinField
            label="PIN"
            name="pin"
            autoComplete="current-password"
            value={pin}
            error={pinError ?? undefined}
            inputRef={pinRef}
            disabled={busy}
            onChange={(next) => {
              setPin(next);
              setPinError(null);
              setFormError(null);
            }}
            onComplete={(next) => {
              const nextPhone = readyPhone(phone);
              if (!nextPhone) return;
              queueSubmit(nextPhone, next);
            }}
          />
        </div>
        {formError ? (
          <p className="mt-3 text-sm text-alert" role="alert">
            {formError}
          </p>
        ) : null}
        <p className="mt-6 text-sm text-mute">
          New here? You need an invite from IoTeedom.{" "}
          <Link href="/signup" className="text-ink underline">
            How invites work
          </Link>
        </p>
      </AuthColumn>
    </>
  );
}
