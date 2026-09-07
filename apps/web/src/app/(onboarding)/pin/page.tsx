"use client";

import { isPin } from "@ioteedom/shared";
import { useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { getGetMeQueryKey, usePostAuthPin } from "@/api/generated/api";
import { ApiError } from "@/api/mutator";
import { AuthColumn, BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { PinField } from "@/components/ui/pin-field";
import { cn } from "@/lib/cn";
import { useAuthSession } from "@/lib/session";

type Step = "current" | "new" | "confirm";

function pinError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.message.toLowerCase().includes("current pin")) {
      return "That PIN is not correct. Try again.";
    }
    return error.message || "We couldn’t save your PIN. Try again.";
  }
  return "We couldn’t save your PIN. Try again.";
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
  const steps = useMemo<Step[]>(
    () => (firstLogin ? ["new", "confirm"] : ["current", "new", "confirm"]),
    [firstLogin],
  );
  const [step, setStep] = useState<Step>(firstLogin ? "new" : "current");
  const stepIndex = Math.max(0, steps.indexOf(step));
  const firstStep = steps[0] ?? "new";
  const busy = changePin.isPending;
  const saving = useRef(false);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  async function save() {
    if (saving.current) return;
    saving.current = true;
    setError(null);
    try {
      await changePin.mutateAsync({
        data: firstLogin ? { newPin } : { currentPin, newPin },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (caught) {
      const message = pinError(caught);
      if (!firstLogin && message.includes("current PIN")) {
        setCurrentPin("");
        setStep("current");
        setError(message);
        return;
      }
      setError(message);
    } finally {
      saving.current = false;
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (step !== "confirm" || !isPin(newPin) || newPin !== confirmPin) return;
    void save();
  }

  const copy =
    step === "current"
      ? {
          kicker: "Current PIN",
          title: "Enter your current PIN",
          body: "We’ll ask for a new one next.",
          label: "Current PIN",
        }
      : step === "new"
        ? {
            kicker: "New PIN",
            title: "Choose 4 digits you’ll remember",
            body: "Don’t use your MoMo PIN. You’ll enter it once more to confirm.",
            label: "New PIN",
          }
        : {
            kicker: "Confirm",
            title: "Enter the same PIN again",
            body: "This makes sure both entries match.",
            label: "Confirm PIN",
          };

  return (
    <>
      <BrandPane
        kicker="Your PIN"
        title="Set a PIN you’ll remember."
        body="Use 4 digits that are not your MoMo PIN. IoTeedom never asks for that one."
      />
      <AuthColumn
        onSubmit={submit}
        className="enter"
        aria-busy={busy}
        actions={
          <>
            {step === "confirm" ? (
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={busy || !isPin(confirmPin)}
              >
                {busy ? "Saving…" : "Save PIN"}
              </Button>
            ) : null}
            {step !== firstStep ? (
              <button
                type="button"
                className="mt-3 cursor-pointer text-sm text-mute underline"
                onClick={() => {
                  if (step === "confirm") {
                    setConfirmPin("");
                    goTo("new");
                    return;
                  }
                  setNewPin("");
                  goTo("current");
                }}
              >
                {step === "confirm" ? "Use a different PIN" : "Back"}
              </button>
            ) : null}
            <button
              type="button"
              className="mt-3 block cursor-pointer text-xs text-mute underline"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </button>
          </>
        }
      >
        <div className="mb-8 lg:hidden">
          <BrandMark size="md" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">{copy.kicker}</p>
        <h1 className="mt-2 text-balance font-display text-3xl tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-mute">{copy.body}</p>
        <div
          className="mt-5 flex gap-1.5"
          role="status"
          aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
        >
          {steps.map((item) => (
            <span
              key={item}
              className={cn("h-1 w-7 rounded-full", item === step ? "bg-ink" : "bg-line")}
            />
          ))}
        </div>
        <div className="mt-8">
          {step === "current" ? (
            <PinField
              key="current"
              label={copy.label}
              name="currentPin"
              autoComplete="current-password"
              autoFocus
              value={currentPin}
              error={error ?? undefined}
              disabled={busy}
              onChange={(next) => {
                setCurrentPin(next);
                setError(null);
              }}
              onComplete={() => goTo("new")}
            />
          ) : null}
          {step === "new" ? (
            <PinField
              key="new"
              label={copy.label}
              name="newPin"
              autoComplete="new-password"
              autoFocus
              mask={false}
              value={newPin}
              error={error ?? undefined}
              disabled={busy}
              onChange={(next) => {
                setNewPin(next);
                setError(null);
              }}
              onComplete={(next) => {
                if (!firstLogin && next === currentPin) {
                  setError("Choose a different PIN from the one you use now.");
                  setNewPin("");
                  return;
                }
                setConfirmPin("");
                goTo("confirm");
              }}
            />
          ) : null}
          {step === "confirm" ? (
            <PinField
              key="confirm"
              label={copy.label}
              name="confirmPin"
              autoComplete="new-password"
              autoFocus
              value={confirmPin}
              error={error ?? undefined}
              disabled={busy}
              onChange={(next) => {
                setConfirmPin(next);
                setError(null);
              }}
              onComplete={(next) => {
                if (next !== newPin) {
                  setError("Those PINs didn’t match. Try again.");
                  setConfirmPin("");
                  return;
                }
                void save();
              }}
            />
          ) : null}
        </div>
      </AuthColumn>
    </>
  );
}
