"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { serviceCatalog, type ServiceId } from "@/data/demo";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";

const steps = ["House", "Services", "Accounts"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useDemoStore((s) => s.profile);
  const completeOnboarding = useDemoStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [property, setProperty] = useState(
    profile.property || "12 Boundary Rd, East Legon",
  );
  const [city, setCity] = useState(profile.city || "Accra");
  const [enabled, setEnabled] = useState<Record<ServiceId, boolean>>({
    ecg: true,
    water: true,
    utilities: false,
    meters: true,
    smartHome: false,
    solar: false,
    ev: false,
  });
  const [ecgAccount, setEcgAccount] = useState("5418 2291 03");
  const [waterAccount, setWaterAccount] = useState("W-ACC-209441");

  function toggle(id: ServiceId) {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
  }

  function next() {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    completeOnboarding({
      property,
      city,
      enabled,
      ecgAccount: enabled.ecg ? ecgAccount : undefined,
      waterAccount: enabled.water ? waterAccount : undefined,
    });
    router.replace("/");
  }

  return (
    <>
      <BrandPane
        kicker={`Step ${step + 1} of 3`}
        title="Tell us what this house needs."
        body="You can change services later. ECG and water are the usual start in Accra."
      />
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <BrandMark size="md" />
          </div>
          <ol className="mb-8 flex gap-2">
            {steps.map((label, i) => (
              <li
                key={label}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i <= step ? "bg-live" : "bg-line",
                )}
              />
            ))}
          </ol>

          <div key={step} className="enter">
            {step === 0 ? (
              <>
                <h1 className="font-display text-3xl tracking-tight">
                  Where should bills land?
                </h1>
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
                <h1 className="font-display text-3xl tracking-tight">
                  Choose services
                </h1>
                <p className="mt-2 text-sm text-mute">
                  ECG and water are on. Add the rest if the house has them.
                </p>
                <ul className="mt-6 flex flex-col gap-2">
                  {serviceCatalog.map((service) => (
                    <li key={service.id}>
                      <button
                        type="button"
                        onClick={() => toggle(service.id)}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150 ease-[var(--ease-out)]",
                          enabled[service.id]
                            ? "border-ink bg-ink text-on-ink"
                            : "border-line bg-card",
                        )}
                      >
                        <span>
                          <span className="block font-medium">
                            {service.name}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block text-sm",
                              enabled[service.id]
                                ? "text-on-ink/70"
                                : "text-mute",
                            )}
                          >
                            {service.blurb}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] uppercase">
                          {enabled[service.id] ? "On" : "Off"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h1 className="font-display text-3xl tracking-tight">
                  Link the accounts
                </h1>
                <p className="mt-2 text-sm text-mute">
                  Meter or customer numbers from the last bill.
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
                      label="GWCL account"
                      value={waterAccount}
                      onChange={(e) => setWaterAccount(e.target.value)}
                    />
                  ) : null}
                  {!enabled.ecg && !enabled.water ? (
                    <EmptyState
                      className="py-8"
                      icon={Receipt}
                      title="No billers on"
                      body="You can add them later in Services."
                    />
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-8 flex items-center gap-2">
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
            <Button type="button" className="flex-1" size="lg" onClick={next}>
              {step === 2 ? "Open dashboard" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
