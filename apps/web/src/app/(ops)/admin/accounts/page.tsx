"use client";

import { Inbox, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useGetOpsAccounts, useGetOpsAudit } from "@/api/generated/api";
import { InviteOwnerDialog } from "@/components/ops/invite-owner-dialog";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select";
import { formatWhen } from "@/lib/format";

function statusClass(status: string) {
  if (status === "active") {
    return "rounded-full bg-ok/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ok";
  }
  if (status === "suspended") {
    return "rounded-full bg-alert/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-alert";
  }
  return "rounded-full bg-live/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-live";
}

export default function OpsAccountsPage() {
  const accountsQuery = useGetOpsAccounts();
  const auditQuery = useGetOpsAudit();
  const accounts = accountsQuery.data?.items ?? [];
  const audit = auditQuery.data?.items ?? [];
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "invited" | "active" | "suspended">(
    "all",
  );
  const [cityFilter, setCityFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  const cities = useMemo(
    () => [...new Set(accounts.map((item) => item.city).filter(Boolean))].sort(),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (cityFilter !== "all" && item.city !== cityFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phoneDisplay.toLowerCase().includes(q) ||
        item.property.toLowerCase().includes(q)
      );
    });
  }, [accounts, cityFilter, query, statusFilter]);

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "invited", label: "Invited" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
  ];
  const cityOptions = [
    { value: "all", label: "All cities" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];

  return (
    <div className="enter">
      <OpsTopbar kicker={`${accounts.length} on the platform`} title="Accounts" />
      <div className="p-6">
        <div className="mb-5">
          <Button onClick={() => setInviteOpen(true)}>Invite property owner</Button>
        </div>
        <Panel>
          <PanelHeader
            eyebrow="Owners we invited"
            title="Everyone on the rails"
            action={
              <p className="font-mono text-xs text-mute">
                {filteredAccounts.filter((item) => item.status === "invited").length} waiting
              </p>
            }
          />
          <div className="grid gap-3 border-b border-line px-5 py-4 md:grid-cols-3">
            <Field
              label="Search"
              placeholder="Name, phone, property"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "invited" | "active" | "suspended")
              }
            />
            <SelectField
              label="City"
              value={cityFilter}
              options={cityOptions}
              onValueChange={setCityFilter}
            />
          </div>
          {accountsQuery.isPending ? (
            <p className="px-5 py-8 text-sm text-mute">Loading accounts…</p>
          ) : accountsQuery.isError ? (
            <EmptyState
              icon={Inbox}
              title="Couldn’t load accounts"
              body="Sign in as staff and try again."
            />
          ) : filteredAccounts.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching accounts"
              body="Invite a property owner, or clear the filters."
            />
          ) : (
            <ul className="divide-y divide-line">
              {filteredAccounts.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/accounts/${item.id}`}
                    className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-field"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 font-mono text-xs text-mute">
                        {item.kind === "estate"
                          ? `Estate${item.units ? ` · ${item.units} units` : ""}`
                          : "Owner"}{" "}
                        · {item.property} · {item.phoneDisplay}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-mute">
                        {item.modules.join(" · ") || "No modules yet"} · {item.city}
                      </p>
                    </div>
                    <span className={statusClass(item.status)}>{item.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel className="mt-5">
          <PanelHeader
            eyebrow="Audit trail"
            title="Recent admin actions"
            action={<p className="font-mono text-xs text-mute">{audit.length} events</p>}
          />
          {auditQuery.isPending ? (
            <p className="px-5 py-8 text-sm text-mute">Loading audit…</p>
          ) : audit.length === 0 ? (
            <p className="px-5 py-4 text-sm text-mute">No admin actions yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {audit.slice(0, 12).map((entry) => (
                <li key={entry.id} className="px-5 py-3">
                  <p className="text-sm text-ink">{entry.summary}</p>
                  <p className="mt-1 font-mono text-[11px] text-mute">
                    {entry.actorId} · {entry.accountId ?? "—"} · {formatWhen(entry.at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <InviteOwnerDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
