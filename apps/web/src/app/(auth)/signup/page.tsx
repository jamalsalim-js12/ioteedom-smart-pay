"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthColumn, BrandPane } from "@/components/auth/brand-pane";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();

  return (
    <>
      <BrandPane
        kicker="Smart Pay"
        title="IoTeedom invites the house. Then you run the bills."
        body="You sign in with the phone number and PIN they sent. That’s the same number MoMo will use."
      />
      <AuthColumn
        className="enter"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace("/login");
        }}
        actions={
          <Button type="submit" className="w-full" size="lg">
            I have an invite
          </Button>
        }
      >
        <div className="mb-8 lg:hidden">
          <BrandMark size="md" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Invite only</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">You need an invite</h1>
        <p className="mt-3 text-sm text-mute">
          IoTeedom sets up the house and sends a phone number and PIN. If you already have those,
          sign in.
        </p>
        <p className="mt-6 text-sm text-mute">
          Already invited?{" "}
          <Link href="/login" className="text-ink underline">
            Sign in
          </Link>
        </p>
      </AuthColumn>
    </>
  );
}
