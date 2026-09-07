"use client";

import { Switch } from "@base-ui/react/switch";
import { serviceCatalog, type ServiceId } from "@/data/demo";
import { cn } from "@/lib/cn";

export function ModuleToggles({
  value,
  onChange,
  disabled = false,
}: {
  value: Record<ServiceId, boolean>;
  onChange?: (next: Record<ServiceId, boolean>) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {serviceCatalog.map((service) => {
        const on = value[service.id];
        return (
          <li key={service.id}>
            <div className="flex items-start justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="mt-0.5 text-sm text-mute">{service.blurb}</p>
              </div>
              <Switch.Root
                checked={on}
                disabled={disabled}
                onCheckedChange={() =>
                  onChange?.({ ...value, [service.id]: !on })
                }
                className={cn(
                  "relative flex h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-150 ease-[var(--ease-out)]",
                  on ? "bg-grid" : "bg-line",
                  disabled && "opacity-60",
                )}
              >
                <Switch.Thumb className="block h-6 w-6 rounded-full bg-paper transition-transform duration-150 ease-[var(--ease-out)] data-checked:translate-x-5" />
              </Switch.Root>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
