"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useActiveHouse, useDemoStore } from "@/lib/store";

export function ProfileForm({ kind }: { kind: "household" | "ops" }) {
  const profile = useDemoStore((s) => s.profile);
  const session = useDemoStore((s) => s.session);
  const updateProfile = useDemoStore((s) => s.updateProfile);
  const house = useActiveHouse();
  const [name, setName] = useState(session?.name || profile.name);
  const [phone, setPhone] = useState(session?.phone || profile.phone);
  const [email, setEmail] = useState(session?.email || profile.email);
  const [property, setProperty] = useState(profile.property);
  const [city, setCity] = useState(profile.city || "Accra");
  const ops = kind === "ops";

  const next = {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    property: property.trim(),
    city: city.trim(),
  };
  const dirty =
    next.name !== (session?.name || profile.name).trim() ||
    next.phone !== (session?.phone || profile.phone).trim() ||
    next.email !== (session?.email || profile.email).trim() ||
    next.property !== profile.property.trim() ||
    next.city !== (profile.city || "Accra").trim();
  const ready = Boolean(
    next.name && next.phone && next.email && next.city && (ops || next.property),
  );

  function save(e: FormEvent) {
    e.preventDefault();
    if (!ready) return;
    updateProfile(next);
    toast.success("Profile saved");
  }

  return (
    <form onSubmit={save}>
      <Panel>
        <PanelHeader
          eyebrow="Settings"
          title="Your details"
          action={
            <Button type="submit" size="sm" disabled={!dirty || !ready}>
              Save
            </Button>
          }
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
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
            label="City"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <div className="sm:col-span-2">
            <Field
              label={ops ? "Desk" : "Property"}
              autoComplete="street-address"
              value={property}
              onChange={(e) => setProperty(e.target.value)}
              required={!ops}
            />
          </div>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-line px-5 py-4 font-mono text-xs">
          <dt className="text-mute">Role</dt>
          <dd>{ops ? "Super admin" : "Household"}</dd>
          {ops ? null : (
            <>
              <dt className="text-mute">Active house</dt>
              <dd>{house.label}</dd>
            </>
          )}
        </dl>
      </Panel>
    </form>
  );
}
