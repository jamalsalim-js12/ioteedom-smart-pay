"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { destinationFor, useAuthSession } from "@/lib/session";

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
  const { isReady, session } = useAuthSession();
  const ops = session?.role === "ops";

  useEffect(() => {
    if (!isReady) return;
    if (!session) {
      if (!guestPaths.has(pathname)) router.replace("/login");
      return;
    }

    const dest = destinationFor(session);
    if (session.mustChangePin) {
      if (pathname !== "/pin") router.replace("/pin");
      return;
    }
    if (ops) {
      if (guestPaths.has(pathname) || pathname === "/onboarding" || pathname === "/pin") {
        router.replace("/admin");
        return;
      }
      if (!isOpsPath(pathname) && !isPrintPath(pathname)) {
        router.replace("/admin");
      }
      return;
    }
    if (isOpsPath(pathname)) {
      router.replace(dest);
      return;
    }
    if (!session.onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }
    if (
      session.onboarded &&
      (guestPaths.has(pathname) || pathname === "/onboarding" || pathname === "/pin")
    ) {
      router.replace("/");
    }
  }, [isReady, session, ops, pathname, router]);

  const allowed =
    isReady &&
    ((session?.mustChangePin && pathname === "/pin") ||
      (ops &&
        session &&
        !session.mustChangePin &&
        (isOpsPath(pathname) || isPrintPath(pathname))) ||
      (session &&
        !ops &&
        !session.mustChangePin &&
        !session.onboarded &&
        pathname === "/onboarding") ||
      (session &&
        !ops &&
        !session.mustChangePin &&
        session.onboarded &&
        !guestPaths.has(pathname) &&
        pathname !== "/onboarding" &&
        pathname !== "/pin" &&
        !isOpsPath(pathname)) ||
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
