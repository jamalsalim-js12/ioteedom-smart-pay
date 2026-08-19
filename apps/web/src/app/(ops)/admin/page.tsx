"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { Kpi } from "@/components/ops/kpi";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { paymentMethods } from "@/data/demo";
import { platformChargers, platformIncidents } from "@/data/platform";
import { compactCedis } from "@/lib/format";
import { useOpsSnapshot } from "@/lib/ops";
import { cn } from "@/lib/cn";

const tone = {
  warn: "border-l-alert",
  info: "border-l-live",
  ok: "border-l-grid",
};

export default function OpsOverviewPage() {
  const router = useRouter();
  const { accounts, payments, collected, open, failed, leakResolved } =
    useOpsSnapshot();
  const online = platformChargers.filter((site) => site.status === "online").length;
  const households = accounts.filter((item) => item.kind === "home").length;
  const estates = accounts.filter((item) => item.kind === "estate").length;
  const queue = [
    ...(!leakResolved
      ? [
          {
            id: "inc_ama_leak",
            tone: "warn" as const,
            title: "Leak watch · East Legon",
            body: "Ama Mensah, meter WM-110384. Spike of 1.92 m³ on 15 Aug.",
            account: "Ama Mensah",
            href: "/admin/accounts/east-legon",
            at: "18 Aug, 06:14",
          },
        ]
      : []),
    ...platformIncidents,
  ];

  return (
    <div className="enter">
      <OpsTopbar kicker="All properties · all rails" title="What needs doing" />
      <div className="flex flex-col gap-5 p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Collected"
            value={compactCedis(collected)}
            hint="Successful MoMo on the ledger"
            tone="live"
          />
          <Kpi
            label="Still open"
            value={compactCedis(open)}
            hint="Dues across every account"
          />
          <Kpi
            label="Failed pays"
            value={String(failed)}
            hint="Retry from Payments"
            tone={failed > 0 ? "alert" : "ok"}
          />
          <Kpi
            label="Chargers"
            value={`${online}/${platformChargers.length}`}
            hint="Sites up right now"
            tone={online < platformChargers.length ? "alert" : "ok"}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Panel>
            <PanelHeader
              eyebrow="Queue"
              title="Needs a decision"
              action={
                <p className="font-mono text-xs text-mute">
                  {households} homes · {estates} estates
                </p>
              }
            />
            {queue.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Queue is clear"
                body="Nothing needs a decision right now."
              />
            ) : (
              <ul className="divide-y divide-line">
                {queue.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block border-l-4 px-5 py-4 transition-colors hover:bg-field",
                        tone[item.tone],
                      )}
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-mute">{item.body}</p>
                      <p className="mt-3 font-mono text-[11px] text-mute">
                        {item.account} · {item.at}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Rail" title="Latest money" />
            {payments.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No money yet"
                body="Successful MoMo will show here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {payments.slice(0, 7).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/admin/payments/${item.id}`}
                      className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-field"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-1 font-mono text-[11px] text-mute">
                          {item.propertyLabel || item.propertyId} ·{" "}
                          {paymentMethods.find((m) => m.id === item.method)?.short} ·{" "}
                          {item.status}
                        </p>
                      </div>
                      <p className="tabular text-sm">{compactCedis(item.amount)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-line px-5 py-3">
              <button
                type="button"
                className="text-sm underline"
                onClick={() => router.push("/admin/payments")}
              >
                Full ledger
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
