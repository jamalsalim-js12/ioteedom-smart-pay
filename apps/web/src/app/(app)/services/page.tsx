"use client";

import { Switch } from "@base-ui/react/switch";
import { Topbar } from "@/components/shell/topbar";
import { Panel } from "@/components/ui/panel";
import { serviceCatalog } from "@/data/demo";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";

export default function ServicesPage() {
  const enabled = useDemoStore((s) => s.enabled);
  const toggleService = useDemoStore((s) => s.toggleService);

  return (
    <div className="enter">
      <Topbar kicker="Account" title="Services" />
      <div className="p-6">
        <p className="mb-5 max-w-xl text-sm text-mute">
          Pick what this house needs. Turn something off and it leaves the sidebar
          — the rest of the account stays.
        </p>
        <ul className="grid gap-3 md:grid-cols-2">
          {serviceCatalog.map((service) => {
            const on = enabled[service.id];
            return (
              <li key={service.id}>
                <Panel className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-display text-xl tracking-tight">
                      {service.name}
                    </p>
                    <p className="mt-1 text-sm text-mute">{service.blurb}</p>
                  </div>
                  <Switch.Root
                    checked={on}
                    onCheckedChange={() => toggleService(service.id)}
                    className={cn(
                      "relative flex h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-150 ease-[var(--ease-out)]",
                      on ? "bg-grid" : "bg-line",
                    )}
                  >
                    <Switch.Thumb className="block h-6 w-6 rounded-full bg-paper transition-transform duration-150 ease-[var(--ease-out)] data-checked:translate-x-5" />
                  </Switch.Root>
                </Panel>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
