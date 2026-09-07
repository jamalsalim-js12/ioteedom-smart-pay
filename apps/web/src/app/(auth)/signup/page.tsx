"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();

  return (
    <>
      <BrandPane
        kicker="Smart Pay"
        title="IoTeedom invites the house, then you work inside it."
        body="Phone first — that’s how MoMo will find you. PIN is the one superadmin sent."
      />
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <div className="enter w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark size="md" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Invite only</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Wait for IoTeedom</h1>
          <p className="mt-3 text-sm text-mute">
            Superadmin invites property owners and chooses which features they can see. If you
            already have an invite, sign in with that phone and PIN.
          </p>
          <Button
            type="button"
            className="mt-6 w-full"
            size="lg"
            onClick={() => router.replace("/login")}
          >
            I have an invite
          </Button>
          <p className="mt-6 text-sm text-mute">
            Already on the platform?{" "}
            <Link href="/login" className="text-ink underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
