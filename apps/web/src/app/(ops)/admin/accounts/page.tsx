"use client";

import Link from "next/link";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { compactCedis } from "@/lib/format";
import { useOpsSnapshot } from "@/lib/ops";

export default function OpsAccountsPage() {
  const { accounts } = useOpsSnapshot();
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
                  <p className="tabular font-medium">{compactCedis(item.open)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
