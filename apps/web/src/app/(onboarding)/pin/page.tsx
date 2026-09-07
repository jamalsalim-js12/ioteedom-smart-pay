"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { getGetMeQueryKey, usePostAuthPin } from "@/api/generated/api";
import { ApiError } from "@/api/mutator";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useAuthSession } from "@/lib/session";

function pinError(error: unknown) {
  if (error instanceof ApiError) return error.message || "Could not save PIN.";
  return "Could not save PIN. Try again.";
}

export default function ChangePinPage() {
  const changePin = usePostAuthPin();
  const queryClient = useQueryClient();
  const { session, signOut } = useAuthSession();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const firstLogin = Boolean(session?.mustChangePin);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{4,6}$/.test(newPin)) {
      setError("PIN must be 4 to 6 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PIN and confirmation do not match.");
      return;
    }
    try {
      await changePin.mutateAsync({
        data: firstLogin ? { newPin } : { currentPin, newPin },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (caught) {
      setError(pinError(caught));
    }
  }

  return (
    <>
      <BrandPane
        kicker="Security"
        title="Replace the temporary PIN from your invite."
        body="Choose 4 to 6 digits you will remember. IoTeedom never asks for your MoMo PIN."
      />
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="enter w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark size="md" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">PIN</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Set your PIN</h1>
          <p className="mt-2 text-sm text-mute">
            {firstLogin
              ? "This is the first sign-in. Pick a PIN that is not the invite code."
              : "Enter your current PIN, then a new one."}
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {firstLogin ? null : (
              <Field
                label="Current PIN"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            )}
            <Field
              label="New PIN"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
            <Field
              label="Confirm PIN"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>
          {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={changePin.isPending}>
            {changePin.isPending ? "Saving…" : "Save PIN"}
          </Button>
          <button
            type="button"
            className="mt-4 text-xs text-mute underline"
            onClick={() => {
              void signOut();
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
