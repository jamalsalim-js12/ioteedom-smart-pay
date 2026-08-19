"use client";

import Link from "next/link";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { platformIncidents } from "@/data/platform";
import { useOpsSnapshot } from "@/lib/ops";
import { cn } from "@/lib/cn";

const tone = {
  warn: "border-l-alert",
  info: "border-l-live",
  ok: "border-l-grid",
};

export default function OpsDevicesPage() {
  const { leakResolved, east, airport } = useOpsSnapshot();
  const rows = [
    {
      id: "dev_ama_leak",
      href: "/admin/accounts/east-legon",
      tone: leakResolved ? ("ok" as const) : ("warn" as const),
      title: leakResolved
        ? "East Legon water meter — clear"
        : "East Legon water meter — leak watch",
      body: leakResolved
        ? "Ama marked the 15 Aug spike resolved."
        : "WM-110384 drew 1.92 m³ in a day. Sensor still armed.",
      meta: `${east.address} · meters`,
    },
    {
      id: "dev_airport",
      href: "/admin/accounts/airport",
      tone: "ok" as const,
      title: "Airport Residential — 4 units reporting",
      body: "Estate meters last seen this morning. Combined water due still open.",
      meta: `${airport.address} · ${airport.units.length} units`,
    },
    ...platformIncidents
      .filter((item) => item.kind === "leak" || item.kind === "credit")
      .map((item) => ({
        id: item.id,
        href: item.href,
        tone: item.tone,
        title: item.title,
        body: item.body,
        meta: `${item.account} · ${item.at}`,
      })),
    {
      id: "dev_spintex",
      href: "/admin/accounts/spintex-court",
      tone: "info" as const,
      title: "Spintex Court — 12 unit stack",
      body: "Estate ECG and water are on one docket. No leak flags today.",
      meta: "Spintex Court Ltd · estate",
    },
  ];

  return (
    <div className="enter">
      <OpsTopbar kicker="Meters, sensors, estates" title="Devices" />
      <div className="p-6">
        <Panel>
          <PanelHeader eyebrow="Fleet" title="What the hardware is saying" />
          <ul className="divide-y divide-line">
            {rows.map((item) => (
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
                  <p className="mt-2 font-mono text-[11px] text-mute">
                    {item.meta}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
