"use client";

import { Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetOpsAccountsById } from "@/api/generated/api";
import { Facts } from "@/components/ops/facts";
import { ModuleToggles } from "@/components/ops/module-toggles";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { formatWhen } from "@/lib/format";
import { routeParam } from "@/lib/ops";
import { enabledFromModules } from "@/lib/session";

function statusClass(status: string) {
  if (status === "active") {
    return "rounded-full bg-ok/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ok";
  }
  if (status === "suspended") {
    return "rounded-full bg-alert/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-alert";
  }
  return "rounded-full bg-live/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-live";
}

export default function OpsAccountDetailPage() {
  const id = routeParam(useParams<{ id: string }>().id);
  const accountQuery = useGetOpsAccountsById(id);
  const account = accountQuery.data;

  if (accountQuery.isPending) {
    return (
      <div className="enter">
        <OpsTopbar backHref="/admin/accounts" kicker="Account" title="Loading…" />
        <div className="p-6">
          <Panel>
            <p className="px-5 py-8 text-sm text-mute">Loading this account…</p>
          </Panel>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="enter">
        <OpsTopbar backHref="/admin/accounts" kicker="Not found" title="Account" />
        <div className="p-6">
          <Panel>
            <EmptyState icon={Search} title="No account here" body={`Nothing matches ${id}.`} />
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div className="enter">
      <OpsTopbar
        backHref="/admin/accounts"
        kicker={account.kind === "estate" ? "Estate account" : "Household account"}
        title={account.name}
      />
      <div className="flex flex-col gap-5 p-6">
        <Panel>
          <PanelHeader
            eyebrow="Provisioning"
            title="Modules this owner can see"
            action={<span className={statusClass(account.status)}>{account.status}</span>}
          />
          <div className="px-5 py-4">
            <p className="mb-4 text-sm text-mute">
              Superadmin chooses the catalog. Changing modules after invite comes later.
            </p>
            <ModuleToggles value={enabledFromModules(account.moduleFlags)} disabled />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow={account.kind === "estate" ? "Estate" : "Household"}
            title={account.property}
          />
          <Facts
            rows={[
              { label: "Phone", value: account.phoneDisplay },
              { label: "City", value: account.city },
              { label: "Last seen", value: formatWhen(account.lastSeen) },
              { label: "Invite accepted", value: formatWhen(account.inviteAcceptedAt) },
              { label: "Onboarded", value: formatWhen(account.onboardedAt) },
              { label: "Modules", value: account.modules.join(" · ") || "None" },
              ...(account.units ? [{ label: "Units", value: String(account.units) }] : []),
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
