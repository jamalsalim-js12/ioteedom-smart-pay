"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { usePostAuthLogin } from "@/api/generated/api";
import { ApiError } from "@/api/mutator";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useAuthSession } from "@/lib/session";

export const SEED_OWNER_PHONE = "024 412 8891";
export const SEED_OWNER_PIN = "2468";
export const SEED_STAFF_PHONE = "020 000 0001";
export const SEED_STAFF_PIN = "1357";

function loginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return "This account is suspended. Contact support.";
    if (error.status === 429) return "Too many PIN attempts. Try again later.";
    return error.message || "Phone or PIN does not match.";
  }
  return "Could not sign in. Try again.";
}

export default function LoginPage() {
  const login = usePostAuthLogin();
  const { applyTokens } = useAuthSession();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submitPhone(nextPhone: string, nextPin: string) {
    setError(null);
    try {
      const tokens = await login.mutateAsync({ data: { phone: nextPhone, pin: nextPin } });
      applyTokens(tokens);
    } catch (caught) {
      setError(loginErrorMessage(caught));
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void submitPhone(phone, pin);
  }

  const busy = login.isPending;

  return (
    <>
      <BrandPane
        kicker="Smart Pay"
        title="One account for the house bills."
        body="Superadmin invites the owner and picks the modules. Tenants pay ECG to ECG. Water goes to the owner, then Ghana Water."
      />
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="enter w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark size="md" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Sign in</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Welcome back</h1>
          <div className="mt-8 flex flex-col gap-4">
            <Field
              label="Phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="024 412 8891"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Field
              label="PIN"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={6}
              placeholder="4 to 6 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>
          {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={busy}>
            {busy ? "Signing in…" : "Continue"}
          </Button>
          <Button
            type="button"
            intent="ghost"
            className="mt-2 w-full"
            disabled={busy}
            onClick={() => {
              setPhone(SEED_OWNER_PHONE);
              setPin(SEED_OWNER_PIN);
              void submitPhone(SEED_OWNER_PHONE, SEED_OWNER_PIN);
            }}
          >
            Sign in as property owner
          </Button>
          <Button
            type="button"
            intent="ghost"
            className="mt-2 w-full"
            disabled={busy}
            onClick={() => {
              setPhone(SEED_STAFF_PHONE);
              setPin(SEED_STAFF_PIN);
              void submitPhone(SEED_STAFF_PHONE, SEED_STAFF_PIN);
            }}
          >
            Sign in as operator
          </Button>
          <p className="mt-6 text-sm text-mute">
            New here? You need an invite from IoTeedom.{" "}
            <Link href="/signup" className="text-ink underline">
              How invites work
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
