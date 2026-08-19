"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Gauge,
  House,
  LayoutGrid,
  Receipt,
  SlidersHorizontal,
  Sun,
  Zap,
} from "lucide-react";
import { type ServiceId } from "@/data/demo";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";
import { AccountMenu } from "@/components/shell/account-menu";
import { HouseSwitcher } from "@/components/shell/house-switcher";
import { BrandMark } from "@/components/brand/brand-mark";

const nav = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/bills", label: "Bills", icon: Receipt, anyOf: ["ecg", "water", "utilities"] as ServiceId[] },
  { href: "/meters", label: "Meters", icon: Gauge, service: "meters" as ServiceId },
  { href: "/smart-home", label: "Smart home", icon: House, service: "smartHome" as ServiceId },
  { href: "/solar", label: "Solar", icon: Sun, service: "solar" as ServiceId },
  { href: "/ev", label: "EV", icon: Car, service: "ev" as ServiceId },
  { href: "/activity", label: "Activity", icon: Zap },
  { href: "/services", label: "Services", icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const enabled = useDemoStore((s) => s.enabled);

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col bg-stub text-white">
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="block">
          <BrandMark size="md" tone="onDark" />
          <p className="mt-3 font-display text-2xl leading-none tracking-tight">
            Smart Pay
          </p>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {nav.map((item) => {
          const hidden =
            (item.service && !enabled[item.service]) ||
            (item.anyOf && !item.anyOf.some((id) => enabled[id]));
          if (hidden) return null;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ease-[var(--ease-out)]",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/65 hover:bg-white/6 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "h-4 w-0.5 rounded-full",
                  active ? "bg-brass" : "bg-transparent",
                )}
              />
              <Icon size={16} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 px-4 py-4">
        <HouseSwitcher tone="dark" />
        <div className="mt-3">
          <AccountMenu tone="dark" layout="row" profileHref="/profile" />
        </div>
      </div>
    </aside>
  );
}
