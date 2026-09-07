"use client";

import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { serviceCatalog } from "@/data/demo";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";

const steps = ["House", "Modules", "Accounts"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useDemoStore((s) => s.profile);
  const enabled = useDemoStore((s) => s.enabled);
  const completeOnboarding = useDemoStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [property, setProperty] = useState(profile.property || "12 Boundary Rd, East Legon");
  const [city, setCity] = useState(profile.city || "Accra");
  const [ecgAccount, setEcgAccount] = useState("5418 2291 03");
  const [waterAccount, setWaterAccount] = useState("W-ACC-209441");

  function next() {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    completeOnboarding({
      property,
      city,
      ecgAccount: enabled.ecg ? ecgAccount : undefined,
      waterAccount: enabled.water ? waterAccount : undefined,
    });
    router.replace("/");
  }

  return (
    <>
      <BrandPane
        kicker={`Step ${step + 1} of 3`}
        title="Confirm the house IoTeedom invited you for."
        body="Modules were chosen by superadmin. ECG is paid to ECG. Water from a tenant goes to the owner, then Ghana Water."
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
                className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-live" : "bg-line")}
              />
            ))}
          </ol>

          <div key={step} className="enter">
            {step === 0 ? (
              <>
                <h1 className="font-display text-3xl tracking-tight">Where should bills land?</h1>
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
                <h1 className="font-display text-3xl tracking-tight">What’s on this account</h1>
                <p className="mt-2 text-sm text-mute">
                  Superadmin picked these. You can’t add more from here.
                </p>
                <ul className="mt-6 flex flex-col gap-2">
                  {serviceCatalog.map((service) => (
                    <li
                      key={service.id}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left",
                        enabled[service.id]
                          ? "border-ink bg-ink text-on-ink"
                          : "border-line bg-card",
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
                <h1 className="font-display text-3xl tracking-tight">Link the accounts</h1>
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
                      label="GWCL account (property)"
                      value={waterAccount}
                      onChange={(e) => setWaterAccount(e.target.value)}
                    />
                  ) : null}
                  {!enabled.ecg && !enabled.water ? (
                    <EmptyState
                      className="py-8"
                      icon={Receipt}
                      title="No billers on"
                      body="IoTeedom hasn’t switched ECG or water on for this account yet."
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
