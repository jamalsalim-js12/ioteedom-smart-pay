"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { useActiveHouse, useDemoStore } from "@/lib/store";

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  at: string;
};

export function NotificationsMenu({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const session = useDemoStore((s) => s.session);
  const house = useActiveHouse();
  const platformPayments = useDemoStore((s) => s.platformPayments);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dark = tone === "dark";

  const items = useMemo<NotificationItem[]>(() => {
    if (session?.role === "ops") {
      return platformPayments.slice(0, 5).map((payment) => ({
        id: payment.id,
        title: `${payment.label} · ${payment.status}`,
        detail: payment.propertyLabel ?? payment.propertyId,
        at: payment.at,
      }));
    }

    const alerts = house.alerts.slice(0, 3).map((alert) => ({
      id: alert.id,
      title: alert.title,
      detail: alert.body,
      at: alert.at,
    }));
    const events = house.usage.slice(0, 2).map((usage, index) => ({
      id: `usage-${usage.month}-${index}`,
      title: `Usage update · ${usage.month}`,
      detail: `ECG ${usage.ecg} kWh · Water ${usage.water} m3`,
      at: usage.month,
    }));
    return [...alerts, ...events];
  }, [house.alerts, house.usage, platformPayments, session?.role]);

  const unreadCount = items.length;

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
          dark
            ? "bg-white/10 text-white hover:bg-white/16"
            : "border border-line bg-card text-ink hover:bg-field",
        )}
      >
        <Bell size={18} strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 right-1 min-w-4 rounded-full bg-live px-1 text-center font-mono text-[10px] leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-80 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-card shadow-float"
        >
          <div className="border-b border-line px-3 py-2">
            <p className="text-sm font-medium text-ink">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} className="border-b border-line px-3 py-2.5 last:border-b-0">
                  <p className="truncate text-sm text-ink">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-mute">{item.detail}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                    {item.at}
                  </p>
                </div>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-mute">No notifications yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
