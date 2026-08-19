"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { DEMO_PHONE, DEMO_PIN, OPS_PHONE, OPS_PIN, useDemoStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useDemoStore((s) => s.signIn);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const result = signIn(phone, pin);
    if (result) {
      setError(result);
      return;
    }
    const onboarded = useDemoStore.getState().onboarded;
    const role = useDemoStore.getState().session?.role;
    router.replace(role === "ops" ? "/admin" : onboarded ? "/" : "/onboarding");
  }

  return (
    <>
      <BrandPane
        kicker="Smart Pay"
        title="One account for the house bills."
        body="ECG, water, meters, solar, and EV charging — pick what you need, pay from here."
      />
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="enter w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark size="md" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Sign in
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">
            Welcome back
          </h1>
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
              maxLength={4}
              placeholder="4 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
          {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
          <Button type="submit" className="mt-6 w-full" size="lg">
            Continue
          </Button>
          <Button
            type="button"
            intent="ghost"
            className="mt-2 w-full"
            onClick={() => {
              setPhone("024 412 8891");
              setPin(DEMO_PIN);
              const result = signIn(DEMO_PHONE, DEMO_PIN);
              if (result) {
                setError(result);
                return;
              }
              const onboarded = useDemoStore.getState().onboarded;
              router.replace(onboarded ? "/" : "/onboarding");
            }}
          >
            Sign in as household
          </Button>
          <Button
            type="button"
            intent="ghost"
            className="mt-2 w-full"
            onClick={() => {
              setPhone("020 111 2233");
              setPin(OPS_PIN);
              const result = signIn(OPS_PHONE, OPS_PIN);
              if (result) {
                setError(result);
                return;
              }
              router.replace("/admin");
            }}
          >
            Sign in as operator
          </Button>
          <p className="mt-6 text-sm text-mute">
            New here?{" "}
            <Link href="/signup" className="text-ink underline">
              Create an account
            </Link>
          </p>
          <button
            type="button"
            className="mt-4 text-xs text-mute underline"
            onClick={() => {
              resetDemo();
              setPhone("");
              setPin("");
              setError(null);
            }}
          >
            Clear saved session
          </button>
        </form>
      </div>
    </>
  );
}
