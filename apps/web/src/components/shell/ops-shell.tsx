"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Car,
  LayoutGrid,
  Radio,
  Receipt,
} from "lucide-react";
import { AccountMenu } from "@/components/shell/account-menu";
import { BrandMark } from "@/components/brand/brand-mark";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ReceiptDialog } from "@/components/ui/receipt-dialog";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/accounts", label: "Accounts", icon: Building2 },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/chargers", label: "Chargers", icon: Car },
  { href: "/admin/devices", label: "Devices", icon: Radio },
];

function OpsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col bg-stub text-white">
      <div className="px-5 pt-6 pb-5">
        <Link href="/admin" className="block">
          <BrandMark size="md" tone="onDark" />
          <p className="mt-3 font-display text-2xl leading-none tracking-tight">
            Ops
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
            Platform
          </p>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
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
        <AccountMenu tone="dark" layout="row" profileHref="/admin/profile" />
      </div>
    </aside>
  );
}

function OpsMobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-stub text-white md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="min-w-0">
          <BrandMark size="sm" tone="onDark" />
          <p className="mt-1 font-display text-lg leading-none tracking-tight">
            Ops
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationsMenu tone="dark" />
          <ThemeToggle tone="dark" />
          <AccountMenu tone="dark" profileHref="/admin/profile" />
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-3">
        {nav.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                active ? "bg-paper text-navy" : "bg-white/10 text-white/80",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function OpsTopbar({
  title,
  kicker,
  backHref,
}: {
  title: string;
  kicker?: string;
  backHref?: string;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-line px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-mute hover:text-ink"
          >
            ← Back
          </Link>
        ) : null}
        {kicker ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-3xl tracking-tight text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-mono text-xs text-mute">Accra</p>
        <div className="hidden items-center gap-2 md:flex">
          <NotificationsMenu />
          <ThemeToggle />
          <AccountMenu profileHref="/admin/profile" />
        </div>
      </div>
    </header>
  );
}

export function OpsShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh md:block">
        <OpsSidebar />
      </div>
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <OpsMobileNav />
        <div className="flex-1">{children}</div>
      </div>
      <ReceiptDialog />
    </div>
  );
}
