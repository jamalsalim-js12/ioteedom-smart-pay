"use client";

import { ModuleToggles } from "@/components/ops/module-toggles";
import { Topbar } from "@/components/shell/topbar";
import { useDemoStore, useEnabled } from "@/lib/store";

export default function ServicesPage() {
  const enabled = useEnabled();
  const tenant = useDemoStore((s) => s.session?.role === "tenant");

  return (
    <div className="enter">
      <Topbar kicker="Account" title="Services" />
      <div className="p-6">
        <p className="mb-5 max-w-xl text-sm text-mute">
          {tenant
            ? "Your landlord’s account was provisioned by IoTeedom. ECG is yours to pay. Water usage is billed to you, and that money goes to them."
            : "IoTeedom switched these on for this account. You cannot add a module yourself — ask ops if something is missing."}
        </p>
        <ModuleToggles value={enabled} disabled />
      </div>
    </div>
  );
}
