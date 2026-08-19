"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
} from "@/components/ui/map";
import { chargerSites } from "@/data/demo";
import { cn } from "@/lib/cn";

const ACCRA: [number, number] = [-0.172, 5.628];

export function AccraMap({
  selected,
  chargingSite,
  onSelect,
}: {
  selected: string | null;
  chargingSite: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="h-[380px] w-full">
        <Map center={ACCRA} zoom={12.15} theme="light">
          <MapControls position="bottom-right" />
          {chargerSites.map((site) => {
            const active =
              selected === site.name || chargingSite === site.name;
            const online = site.status === "online";
            return (
              <MapMarker
                key={site.name}
                longitude={site.lng}
                latitude={site.lat}
                onClick={() => onSelect(site.name)}
              >
                <MarkerContent>
                  <span
                    className={cn(
                      "block rounded-full border-2 border-white shadow-[0_2px_8px_rgba(21,34,56,0.28)]",
                      online ? "bg-live" : "bg-mute",
                      active ? "size-5 ring-4 ring-live/25" : "size-4",
                    )}
                  />
                  <MarkerLabel
                    className={cn(
                      "rounded-md bg-card/90 px-1.5 py-0.5 font-sans text-[11px] text-ink shadow-sm",
                      active && "font-semibold",
                    )}
                  >
                    {site.name}
                  </MarkerLabel>
                </MarkerContent>
              </MapMarker>
            );
          })}
        </Map>
      </div>
      <p className="border-t border-line bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        Tap a pin · {chargerSites.filter((s) => s.status === "online").length}{" "}
        online
      </p>
    </div>
  );
}
