"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { useDemoStore } from "@/lib/store";

const guestPaths = new Set(["/login", "/signup"]);

function isOpsPath(pathname: string) {
  return pathname.startsWith("/admin");
}

function isPrintPath(pathname: string) {
  return pathname.startsWith("/receipts");
}

export function RouteGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useDemoStore((s) => s.hydrated);
  const session = useDemoStore((s) => s.session);
  const onboarded = useDemoStore((s) => s.onboarded);
  const markHydrated = useDemoStore((s) => s.markHydrated);
  const role = session?.role ?? "household";
  const ops = role === "ops";

  useEffect(() => {
    const done = () => markHydrated();
    const unsub = useDemoStore.persist.onFinishHydration(done);
    if (useDemoStore.persist.hasHydrated()) done();
    const t = window.setTimeout(done, 80);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, [markHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!session && !guestPaths.has(pathname)) {
      router.replace("/login");
      return;
    }
    if (session && ops) {
      if (guestPaths.has(pathname) || pathname === "/onboarding" || (!isOpsPath(pathname) && !isPrintPath(pathname))) {
        router.replace("/admin");
      }
      return;
    }
    if (session && !ops && isOpsPath(pathname)) {
      router.replace("/");
      return;
    }
    if (session && !ops && !onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }
    if (session && !ops && onboarded && (guestPaths.has(pathname) || pathname === "/onboarding")) {
      router.replace("/");
    }
  }, [hydrated, session, ops, onboarded, pathname, router]);

  const allowed =
    hydrated &&
    ((ops &&
      session &&
      (isOpsPath(pathname) || isPrintPath(pathname))) ||
      (session &&
        !ops &&
        onboarded &&
        !guestPaths.has(pathname) &&
        pathname !== "/onboarding" &&
        !isOpsPath(pathname)) ||
      (session && !ops && !onboarded && pathname === "/onboarding") ||
      (!session && guestPaths.has(pathname)));

  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stub text-white">
        <div>
          <BrandMark size="lg" tone="onDark" priority />
          <p className="mt-3 font-display text-3xl tracking-tight">Smart Pay</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-dvh">{children}</div>;
}
