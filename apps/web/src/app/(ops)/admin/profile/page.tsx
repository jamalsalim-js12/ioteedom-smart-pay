"use client";

import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { AppearancePanel } from "@/components/theme/appearance-panel";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useDemoStore } from "@/lib/store";

export default function OpsProfilePage() {
  const router = useRouter();
  const signOut = useDemoStore((s) => s.signOut);

  return (
    <div className="enter">
      <OpsTopbar kicker="Account" title="Profile" />
      <div className="flex flex-col gap-5 p-6">
        <ProfileForm kind="ops" />
        <Panel>
          <PanelHeader eyebrow="Appearance" title="Theme" />
          <AppearancePanel />
        </Panel>
        <div>
          <Button
            intent="ink"
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
