"use client";

import Link from "next/link";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { compactCedis } from "@/lib/format";
import { useOpsSnapshot } from "@/lib/ops";
import { useDemoStore } from "@/lib/store";

export default function OpsAccountsPage() {
  const { accounts } = useOpsSnapshot();
  const toggleOpsAccountStatus = useDemoStore((s) => s.toggleOpsAccountStatus);
  const open = accounts.filter((item) => item.open > 0).length;

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
          <ul className="divide-y divide-line">
            {accounts.map((item) => (
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
      </div>
    </div>
  );
}
