"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Receipt, Search } from "lucide-react";
import { Facts } from "@/components/ops/facts";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { paymentStatusClass } from "@/components/ui/receipt-dialog";
import { compactCedis } from "@/lib/format";
import { propertyLabel, routeParam, useOpsSnapshot } from "@/lib/ops";
import { useDemoStore } from "@/lib/store";

export default function OpsAccountDetailPage() {
  const id = routeParam(useParams<{ id: string }>().id);
  const { accounts, payments, east, airport } = useOpsSnapshot();
  const houses = useDemoStore((s) => s.houses);
  const account = accounts.find((item) => item.id === id);
  const related = payments.filter((item) => item.propertyId === id);
  const house = id === "east-legon" ? east : id === "airport" ? airport : null;
  const bills = house ? Object.values(house.bills) : [];

  if (!account) {
    return (
      <div className="enter">
        <OpsTopbar backHref="/admin/accounts" kicker="Not found" title="Account" />
        <div className="p-6">
          <Panel>
            <EmptyState
              icon={Search}
              title="No account here"
              body={`Nothing matches ${id}.`}
            />
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
            eyebrow={account.kind === "estate" ? "Estate" : "Household"}
            title={account.property}
            action={
              <p className="tabular font-medium">{compactCedis(account.open)}</p>
            }
          />
          <Facts
            rows={[
              { label: "Phone", value: account.phone },
              { label: "City", value: account.city },
              { label: "Last seen", value: account.lastSeen },
              { label: "Modules", value: account.modules.join(" · ") },
              ...(account.units
                ? [{ label: "Units", value: String(account.units) }]
                : []),
              { label: "Note", value: account.note },
            ]}
          />
        </Panel>

        {bills.length > 0 ? (
          <Panel>
            <PanelHeader eyebrow="Docket" title="Open services" />
            <ul className="divide-y divide-line">
              {bills.map((bill) => (
                <li
                  key={bill.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">{bill.label}</p>
                    <p className="mt-1 font-mono text-xs text-mute">
                      {bill.provider} · {bill.account}
                      {bill.meter ? ` · ${bill.meter}` : ""} · {bill.cycle}
                    </p>
                  </div>
                  <p className="tabular font-medium">{compactCedis(bill.due)}</p>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {house?.units.length ? (
          <Panel>
            <PanelHeader eyebrow="Estate" title="Units" />
            <ul className="divide-y divide-line">
              {house.units.map((unit) => (
                <li
                  key={unit.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
                >
                  <p className="font-medium">{unit.name}</p>
                  <p className="font-mono text-xs text-mute">
                    ECG {compactCedis(unit.ecgDue)} · water{" "}
                    {compactCedis(unit.waterDue)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <Panel>
          <PanelHeader
            eyebrow="Rail"
            title="Related money"
            action={
              <p className="font-mono text-xs text-mute">{related.length} rows</p>
            }
          />
          {related.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments"
              body="Nothing has cleared on this account yet."
            />
          ) : (
            <ul className="divide-y divide-line">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/payments/${item.id}`}
                    className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 transition-colors hover:bg-field"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 font-mono text-xs text-mute">
                        {item.ref} · {propertyLabel(item, houses)} · {item.at}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-sm">{compactCedis(item.amount)}</p>
                      <p className={paymentStatusClass(item.status)}>{item.status}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
