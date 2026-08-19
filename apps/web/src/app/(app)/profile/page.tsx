"use client";

import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { Topbar } from "@/components/shell/topbar";
import { AppearancePanel } from "@/components/theme/appearance-panel";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useDemoStore } from "@/lib/store";

export default function ProfilePage() {
  const router = useRouter();
  const signOut = useDemoStore((s) => s.signOut);
  const activePropertyId = useDemoStore((s) => s.activePropertyId);

  return (
    <div className="enter">
      <Topbar kicker="Account" title="Profile" />
      <div className="flex flex-col gap-5 p-6">
        <ProfileForm key={activePropertyId} kind="household" />
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
