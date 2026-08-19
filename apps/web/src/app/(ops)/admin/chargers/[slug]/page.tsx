"use client";

import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
} from "@/components/ui/map";
import { Facts } from "@/components/ops/facts";
import { Kpi } from "@/components/ops/kpi";
import { OpsTopbar } from "@/components/shell/ops-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { compactCedis } from "@/lib/format";
import { chargerBySlug, routeParam } from "@/lib/ops";
import { cn } from "@/lib/cn";

export default function OpsChargerDetailPage() {
  const slug = routeParam(useParams<{ slug: string }>().slug);
  const site = chargerBySlug(slug);

  if (!site) {
    return (
      <div className="enter">
        <OpsTopbar backHref="/admin/chargers" kicker="Not found" title="Charger" />
        <div className="p-6">
          <Panel>
            <EmptyState
              icon={Search}
              title="No charger here"
              body={`Nothing matches ${slug}.`}
            />
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div className="enter">
      <OpsTopbar
        backHref="/admin/chargers"
        kicker={`${site.area} · designated site`}
        title={site.name}
      />
      <div className="flex flex-col gap-5 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi
            label="Status"
            value={site.status}
            tone={site.status === "online" ? "ok" : "alert"}
          />
          <Kpi label="Sessions today" value={String(site.sessionsToday)} />
          <Kpi
            label="Collected today"
            value={compactCedis(site.collectedToday)}
            tone="live"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="h-[280px] w-full">
            <Map center={[site.lng, site.lat]} zoom={13.2} theme="light">
              <MapControls position="bottom-right" />
              <MapMarker longitude={site.lng} latitude={site.lat}>
                <MarkerContent>
                  <span
                    className={cn(
                      "block size-5 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(21,34,56,0.28)] ring-4 ring-live/25",
                      site.status === "online" ? "bg-live" : "bg-mute",
                    )}
                  />
                  <MarkerLabel className="rounded-md bg-card/90 px-1.5 py-0.5 font-sans text-[11px] text-ink shadow-sm">
                    {site.name}
                  </MarkerLabel>
                </MarkerContent>
              </MapMarker>
            </Map>
          </div>
        </div>

        <Panel>
          <PanelHeader eyebrow="Site" title="Connector facts" />
          <Facts
            rows={[
              { label: "Area", value: site.area },
              { label: "Connectors", value: String(site.connectors) },
              { label: "Last session", value: site.lastSession },
              {
                label: "Note",
                value:
                  site.status === "offline"
                    ? "Both connectors dark. No sessions today."
                    : "Accepting sessions. Designated Accra site.",
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
