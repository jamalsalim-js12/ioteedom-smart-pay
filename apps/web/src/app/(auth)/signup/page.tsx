"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useDemoStore } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const signUp = useDemoStore((s) => s.signUp);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) return;
    signUp({ name, phone, email, pin });
    router.replace("/onboarding");
  }

  return (
    <>
      <BrandPane
        kicker="Smart Pay"
        title="Set up the house, then pick the services."
        body="Phone first — that’s how MoMo will find you. PIN stays on this device."
      />
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="enter w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark size="md" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Create account
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">
            Start with you
          </h1>
          <div className="mt-8 flex flex-col gap-4">
            <Field
              label="Full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              label="Phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="024 …"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="4-digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              hint="Used to sign in to this account."
            />
          </div>
          <Button
            type="submit"
            className="mt-6 w-full"
            size="lg"
            disabled={pin.length !== 4}
          >
            Continue
          </Button>
          <p className="mt-6 text-sm text-mute">
            Already have an account?{" "}
            <Link href="/login" className="text-ink underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
