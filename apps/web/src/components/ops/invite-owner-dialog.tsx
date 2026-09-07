"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { ModuleToggles } from "@/components/ops/module-toggles";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select";
import { blankModules, type ServiceId } from "@/data/demo";
import { useDemoStore } from "@/lib/store";

const starter: Record<ServiceId, boolean> = {
  ...blankModules(),
  ecg: true,
  water: true,
  meters: true,
};

export function InviteOwnerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inviteOwner = useDemoStore((s) => s.inviteOwner);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [property, setProperty] = useState("");
  const [city, setCity] = useState("Accra");
  const [kind, setKind] = useState<"home" | "estate">("home");
  const [modules, setModules] = useState(starter);

  function reset() {
    setName("");
    setPhone("");
    setEmail("");
    setProperty("");
    setCity("Accra");
    setKind("home");
    setModules(starter);
  }

  function submit() {
    if (!name.trim() || !phone.trim() || !email.trim() || !property.trim()) {
      toast.error("Fill in the owner and the property.");
      return;
    }
    const invite = inviteOwner({
      name,
      phone,
      email,
      property,
      city,
      kind,
      modules,
    });
    toast.success(`Invite sent. PIN ${invite.pin} — they sign in with this phone.`);
    reset();
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim/45 transition-opacity duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-card p-5 outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <Dialog.Title className="font-display text-xl tracking-tight">
            Invite a property owner
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-mute">
            They get a phone and PIN. You choose what they can see. They cannot add modules themselves.
          </Dialog.Description>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              label="Phone"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SelectField
              label="Kind"
              value={kind}
              options={[
                { value: "home", label: "Home" },
                { value: "estate", label: "Estate" },
              ]}
              onValueChange={(value) => setKind(value === "estate" ? "estate" : "home")}
            />
            <div className="sm:col-span-2">
              <Field
                label="Property"
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                required
              />
            </div>
            <Field
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <p className="mt-5 mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Modules they can see
          </p>
          <ModuleToggles value={modules} onChange={setModules} />
          <div className="mt-6 flex justify-end gap-2">
            <Button intent="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submit}>
              Send invite
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
