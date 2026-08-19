"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/shell/account-menu";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { Sidebar } from "@/components/shell/sidebar";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ReceiptDialog } from "@/components/ui/receipt-dialog";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/bills", label: "Bills" },
  { href: "/meters", label: "Meters" },
  { href: "/smart-home", label: "House" },
  { href: "/solar", label: "Solar" },
  { href: "/ev", label: "EV" },
  { href: "/activity", label: "Activity" },
  { href: "/services", label: "Services" },
];

function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-stub text-white md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="min-w-0">
          <BrandMark size="sm" tone="onDark" />
          <p className="mt-1 font-display text-lg leading-none tracking-tight">
            Smart Pay
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationsMenu tone="dark" />
          <ThemeToggle tone="dark" />
          <AccountMenu tone="dark" profileHref="/profile" />
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-3">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
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

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh md:block">
        <Sidebar />
      </div>
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <MobileNav />
        <div className="flex-1">{children}</div>
      </div>
      <ReceiptDialog />
    </div>
  );
}
