"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select";
import { compactCedis } from "@/lib/format";
import { useOpsSnapshot } from "@/lib/ops";
import { useDemoStore } from "@/lib/store";

export default function OpsAccountsPage() {
  const { accounts } = useOpsSnapshot();
  const toggleOpsAccountStatus = useDemoStore((s) => s.toggleOpsAccountStatus);
  const opsActivityLog = useDemoStore((s) => s.opsActivityLog);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [openFilter, setOpenFilter] = useState<"all" | "has_open" | "zero_open">("all");
  const [cityFilter, setCityFilter] = useState("all");

  const cities = useMemo(
    () => [...new Set(accounts.map((item) => item.city).filter(Boolean))].sort(),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (openFilter === "has_open" && item.open <= 0) return false;
      if (openFilter === "zero_open" && item.open > 0) return false;
      if (cityFilter !== "all" && item.city !== cityFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.property.toLowerCase().includes(q)
      );
    });
  }, [accounts, cityFilter, openFilter, query, statusFilter]);

  const open = filteredAccounts.filter((item) => item.open > 0).length;
  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
  ];
  const cityOptions = [
    { value: "all", label: "All cities" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];
  const openOptions = [
    { value: "all", label: "All balances" },
    { value: "has_open", label: "Has dues" },
    { value: "zero_open", label: "No dues" },
  ];

  return (
    <div className="enter">
      <OpsTopbar kicker={`${accounts.length} on the platform`} title="Accounts" />
      <div className="p-6">
        <Panel>
          <PanelHeader
            eyebrow="Households and estates"
            title="Everyone on the rails"
            action={
              <p className="font-mono text-xs text-mute">{open} with dues</p>
            }
          />
          <div className="grid gap-3 border-b border-line px-5 py-4 md:grid-cols-4">
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
                setStatusFilter(value as "all" | "active" | "suspended")
              }
            />
            <SelectField
              label="City"
              value={cityFilter}
              options={cityOptions}
              onValueChange={setCityFilter}
            />
            <SelectField
              label="Open balance"
              value={openFilter}
              options={openOptions}
              onValueChange={(value) =>
                setOpenFilter(value as "all" | "has_open" | "zero_open")
              }
            />
          </div>
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
                        : "Household"}{" "}
                      · {item.property} · {item.phone}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-mute">
                      Last seen {item.lastSeen} · {item.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        item.status === "active"
                          ? "rounded-full bg-ok/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ok"
                          : "rounded-full bg-live/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-live"
                      }
                    >
                      {item.status}
                    </span>
                    <p className="tabular font-medium">{compactCedis(item.open)}</p>
                    <Button
                      type="button"
                      size="sm"
                      intent="ghost"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleOpsAccountStatus(item.id);
                      }}
                    >
                      {item.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="mt-5">
          <PanelHeader
            eyebrow="Audit trail"
            title="Recent admin actions"
            action={
              <p className="font-mono text-xs text-mute">{opsActivityLog.length} events</p>
            }
          />
          <ul className="divide-y divide-line">
            {opsActivityLog.slice(0, 12).map((entry) => (
              <li key={entry.id} className="px-5 py-3">
                <p className="text-sm text-ink">{entry.summary}</p>
                <p className="mt-1 font-mono text-[11px] text-mute">
                  {entry.actor} · {entry.accountId} · {entry.at}
                </p>
              </li>
            ))}
            {opsActivityLog.length === 0 ? (
              <li className="px-5 py-4 text-sm text-mute">No admin actions yet.</li>
            ) : null}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
