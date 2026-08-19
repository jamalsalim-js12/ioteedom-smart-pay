"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
} from "@/components/ui/map";
import { Kpi } from "@/components/ops/kpi";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { platformChargers } from "@/data/platform";
import { compactCedis } from "@/lib/format";
import { chargerSlug } from "@/lib/ops";
import { cn } from "@/lib/cn";

const ACCRA: [number, number] = [-0.17, 5.61];

export default function OpsChargersPage() {
  const router = useRouter();
  const online = platformChargers.filter((site) => site.status === "online");
  const collected = platformChargers.reduce(
    (sum, site) => sum + site.collectedToday,
    0,
  );
  const sessions = platformChargers.reduce(
    (sum, site) => sum + site.sessionsToday,
    0,
  );

  return (
    <div className="enter">
      <OpsTopbar kicker="Designated sites" title="Chargers" />
      <div className="flex flex-col gap-5 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi
            label="Online"
            value={`${online.length}/${platformChargers.length}`}
            tone={online.length < platformChargers.length ? "alert" : "ok"}
          />
          <Kpi label="Sessions today" value={String(sessions)} />
          <Kpi
            label="Collected today"
            value={compactCedis(collected)}
            tone="live"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="h-[360px] w-full">
            <Map center={ACCRA} zoom={11.4} theme="light">
              <MapControls position="bottom-right" />
              {platformChargers.map((site) => (
                <MapMarker
                  key={site.name}
                  longitude={site.lng}
                  latitude={site.lat}
                  onClick={() =>
                    router.push(`/admin/chargers/${chargerSlug(site.name)}`)
                  }
                >
                  <MarkerContent>
                    <span
                      className={cn(
                        "block size-4 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(21,34,56,0.28)]",
                        site.status === "online" ? "bg-live" : "bg-mute",
                      )}
                    />
                    <MarkerLabel className="rounded-md bg-card/90 px-1.5 py-0.5 font-sans text-[11px] text-ink shadow-sm">
                      {site.name}
                    </MarkerLabel>
                  </MarkerContent>
                </MapMarker>
              ))}
            </Map>
          </div>
        </div>

        <Panel>
          <PanelHeader eyebrow="Network" title="Designated Accra sites" />
          <ul className="divide-y divide-line">
            {platformChargers.map((site) => (
              <li key={site.name}>
                <Link
                  href={`/admin/chargers/${chargerSlug(site.name)}`}
                  className="flex w-full flex-wrap items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-field"
                >
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="mt-1 font-mono text-xs text-mute">
                      {site.area} · {site.connectors} connectors · last{" "}
                      {site.lastSession}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-mono text-[11px] uppercase",
                        site.status === "online" ? "text-grid" : "text-alert",
                      )}
                    >
                      {site.status}
                    </p>
                    <p className="mt-1 tabular text-sm">
                      {site.sessionsToday} sessions ·{" "}
                      {compactCedis(site.collectedToday)}
                    </p>
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
