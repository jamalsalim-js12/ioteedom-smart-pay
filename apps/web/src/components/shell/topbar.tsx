"use client";

import { AccountMenu } from "@/components/shell/account-menu";
import { HouseSwitcher } from "@/components/shell/house-switcher";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useActiveHouse, useDemoStore } from "@/lib/store";

export function Topbar({
  title,
  kicker,
}: {
  title: string;
  kicker?: string;
}) {
  const city = useDemoStore((s) => s.profile.city);
  const house = useActiveHouse();

  return (
    <header className="flex flex-col gap-3 border-b border-line px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-3xl tracking-tight text-ink">{title}</h1>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:items-end">
          <p className="font-mono text-xs text-mute">
            {city || "Accra"} · {house.label}
          </p>
          <div className="w-full min-w-[240px] sm:w-64">
            <HouseSwitcher compact />
          </div>
        </div>
        <div className="hidden items-center gap-2 pb-0.5 md:flex">
          <NotificationsMenu />
          <ThemeToggle />
          <AccountMenu profileHref="/profile" />
        </div>
      </div>
    </header>
  );
}
