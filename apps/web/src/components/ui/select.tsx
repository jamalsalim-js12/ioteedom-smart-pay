"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type SelectOption = {
  value: string;
  label: string;
};

export function SelectField({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        {label}
      </span>
      <Select.Root value={value} onValueChange={(next) => onValueChange(next ?? "")}>
        <Select.Trigger className="mt-1.5 flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-line bg-card px-3 text-left text-sm text-ink outline-none transition-colors duration-150 select-none hover:border-ink/30 data-popup-open:border-ink/40">
          <Select.Value className="truncate">
            {(next) => options.find((item) => item.value === (next ?? value))?.label ?? ""}
          </Select.Value>
          <Select.Icon>
            <ChevronDown size={14} strokeWidth={1.75} className="shrink-0 opacity-70" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="z-[70] outline-none"
            side="bottom"
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
          >
            <Select.Popup className="max-h-72 w-[var(--anchor-width)] min-w-[220px] origin-[var(--transform-origin)] overflow-y-auto rounded-xl border border-line bg-card py-1 shadow-float outline-none transition-[opacity,transform] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-sm outline-none select-none data-highlighted:bg-field data-selected:font-medium"
                >
                  <Select.ItemText className="truncate text-ink">
                    {option.label}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} strokeWidth={2} className="text-ink" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </label>
  );
}

