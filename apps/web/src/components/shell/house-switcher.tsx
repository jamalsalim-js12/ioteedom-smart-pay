"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { type PropertyId } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { cn } from "@/lib/cn";
import { openAmount, useDemoStore } from "@/lib/store";

export function HouseSwitcher({
  tone = "light",
  compact = false,
}: {
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const houses = useDemoStore((s) => s.houses);
  const active = useDemoStore((s) => s.activePropertyId);
  const switchProperty = useDemoStore((s) => s.switchProperty);
  const dark = tone === "dark";
  const list = Object.values(houses);
  const current = houses[active];

  return (
    <div>
      {compact ? null : (
        <p
          className={cn(
            "mb-2 font-mono text-[10px] uppercase tracking-[0.16em]",
            dark ? "text-white/40" : "text-mute",
          )}
        >
          Property
        </p>
      )}
      <Select.Root
        value={active}
        onValueChange={(id) => {
          if (id) switchProperty(id as PropertyId);
        }}
      >
        <Select.Trigger
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm outline-none transition-colors duration-150 select-none",
            dark
              ? "border-white/15 bg-white/10 text-white hover:bg-white/14 data-popup-open:bg-white/14"
              : "border-line bg-field text-ink hover:border-ink/30 data-popup-open:border-ink/40",
          )}
        >
          <Select.Value className="min-w-0 truncate">
            {(value: PropertyId | null) =>
              houses[value ?? active]?.label ?? current?.label ?? "Property"
            }
          </Select.Value>
          <Select.Icon>
            <ChevronDown size={14} strokeWidth={1.75} className="shrink-0 opacity-70" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="z-[70] outline-none"
            side={dark ? "top" : "bottom"}
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
          >
            <Select.Popup className="max-h-72 w-[var(--anchor-width)] min-w-[220px] origin-[var(--transform-origin)] overflow-y-auto rounded-xl border border-line bg-card py-1 shadow-float outline-none transition-[opacity,transform] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              {list.map((house) => (
                <Select.Item
                  key={house.id}
                  value={house.id}
                  className="flex cursor-pointer items-start justify-between gap-3 px-3 py-2.5 text-sm outline-none select-none data-highlighted:bg-field data-selected:font-medium"
                >
                  <div className="min-w-0">
                    <Select.ItemText className="block truncate text-ink">
                      {house.label}
                    </Select.ItemText>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-mute">
                      {house.kind === "estate" ? "Estate" : "Household"} ·{" "}
                      {compactCedis(openAmount(house))} open
                    </p>
                  </div>
                  <Select.ItemIndicator className="mt-0.5 text-live">
                    <Check size={14} strokeWidth={2} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
