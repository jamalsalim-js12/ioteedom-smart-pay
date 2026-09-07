"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { getGetMeQueryKey, usePostOnboardingComplete } from "@/api/generated/api";
import { ApiError } from "@/api/mutator";
import { AuthColumn, BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { serviceCatalog } from "@/data/demo";
import { cn } from "@/lib/cn";
import { useAuthSession, useEnabled } from "@/lib/session";

const steps = ["House", "Modules", "Accounts"] as const;

export default function OnboardingPage() {
  const complete = usePostOnboardingComplete();
  const queryClient = useQueryClient();
  const { session, signOut } = useAuthSession();
  const enabled = useEnabled();
  const membership =
    session?.memberships.find((item) => !item.onboardedAt) ?? session?.memberships[0];
  const seeded = membership?.properties[0];
  const [step, setStep] = useState(0);
  const [property, setProperty] = useState(seeded?.address ?? "");
  const [city, setCity] = useState(seeded?.city ?? "Accra");
  const [ecgAccount, setEcgAccount] = useState("");
  const [waterAccount, setWaterAccount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seeded) return;
    setProperty((current) => current || seeded.address);
    setCity((current) => current || seeded.city);
  }, [seeded]);

  async function next() {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    if (!membership) {
      setError("No house is linked to this phone.");
      return;
    }
    setError(null);
    try {
      await complete.mutateAsync({
        data: {
          accountId: membership.accountId,
          address: property.trim(),
          city: city.trim(),
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "We couldn’t finish setup. Try again.",
      );
    }
  }

  return (
    <>
      <BrandPane
        kicker={`Step ${step + 1} of 3`}
        title="Confirm the property you were invited for."
        body="IoTeedom chose which services are on. You pay ECG to ECG. Tenants pay water to you, and you pay Ghana Water."
      />
      <AuthColumn
        size="md"
        className="enter"
        onSubmit={(e) => {
          e.preventDefault();
          void next();
        }}
        actions={
          <>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <Button
                  intent="ghost"
                  size="lg"
                  type="button"
                  className="shrink-0"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              ) : null}
              <Button
                type="submit"
                className="flex-1"
                size="lg"
                disabled={complete.isPending || (step === 0 && (!property.trim() || !city.trim()))}
              >
                {step === 2 ? (complete.isPending ? "Saving…" : "Go to dashboard") : "Continue"}
              </Button>
            </div>
            <button
              type="button"
              className="mt-3 text-xs text-mute underline"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </button>
          </>
        }
      >
        <div className="mb-6 lg:hidden">
          <BrandMark size="md" />
        </div>
        <ol className="mb-8 flex gap-2">
          {steps.map((label, i) => (
            <li
              key={label}
              className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-live" : "bg-line")}
            />
          ))}
        </ol>

        <div key={step} className="enter">
          {step === 0 ? (
            <>
              <h1 className="font-display text-3xl tracking-tight">Confirm the property</h1>
              <div className="mt-8 flex flex-col gap-4">
                <Field
                  label="Property"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  required
                />
                <Field
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h1 className="font-display text-3xl tracking-tight">Your services</h1>
              <p className="mt-2 text-sm text-mute">
                IoTeedom turned these on. Ask them if you need more.
              </p>
              <ul className="mt-6 flex flex-col gap-2">
                {serviceCatalog.map((service) => (
                  <li
                    key={service.id}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left",
                      enabled[service.id] ? "border-ink bg-ink text-on-ink" : "border-line bg-card",
                    )}
                  >
                    <span>
                      <span className="block font-medium">{service.name}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-sm",
                          enabled[service.id] ? "text-on-ink/70" : "text-mute",
                        )}
                      >
                        {service.blurb}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] uppercase">
                      {enabled[service.id] ? "On" : "Off"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h1 className="font-display text-3xl tracking-tight">Add your bill numbers</h1>
              <p className="mt-2 text-sm text-mute">
                Use the meter or customer number from your last bill.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                {enabled.ecg ? (
                  <Field
                    label="ECG account"
                    value={ecgAccount}
                    onChange={(e) => setEcgAccount(e.target.value)}
                  />
                ) : null}
                {enabled.water ? (
                  <Field
                    label="Ghana Water account"
                    value={waterAccount}
                    onChange={(e) => setWaterAccount(e.target.value)}
                  />
                ) : null}
                {!enabled.ecg && !enabled.water ? (
                  <EmptyState
                    className="py-8"
                    icon={Receipt}
                    title="No bills to link yet"
                    body="ECG and water are not on for this house. Contact IoTeedom."
                  />
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-alert">{error}</p> : null}
      </AuthColumn>
    </>
  );
}
