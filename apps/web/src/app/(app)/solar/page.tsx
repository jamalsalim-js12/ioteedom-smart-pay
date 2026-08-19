"use client";

import { toast } from "sonner";
import { SolarChart } from "@/components/charts/load";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ModuleOff } from "@/components/shell/module-off";
import { Topbar } from "@/components/shell/topbar";
import { solarSite } from "@/data/demo";
import { useDemoStore } from "@/lib/store";

export default function SolarPage() {
  const on = useDemoStore((s) => s.enabled.solar);
  const solarExport = useDemoStore((s) => s.solarExport);
  const toggleSolarExport = useDemoStore((s) => s.toggleSolarExport);

  if (!on) {
    return (
      <div className="enter">
        <Topbar kicker="Roof" title="Solar" />
        <ModuleOff name="Solar" />
      </div>
    );
  }

  return (
    <div className="enter">
      <Topbar kicker={solarSite.inverter} title="Solar" />
      <div className="grid gap-5 p-6 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Produced today
          </p>
          <p className="mt-2 font-display text-4xl tracking-tight tabular">
            {solarSite.todayKwh}
            <span className="ml-1 text-lg text-mute">kWh</span>
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            House used
          </p>
          <p className="mt-2 font-display text-4xl tracking-tight tabular">
            {solarSite.usedKwh}
            <span className="ml-1 text-lg text-mute">kWh</span>
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Battery
          </p>
          <p className="mt-2 font-display text-4xl tracking-tight tabular">
            {solarSite.batteryPct}
            <span className="ml-1 text-lg text-mute">%</span>
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Export to grid
          </p>
          <p className="mt-2 font-display text-2xl tracking-tight">
            {solarExport ? "On" : "Off"}
          </p>
          <Button
            className="mt-4"
            size="sm"
            intent={solarExport ? "ink" : "ghost"}
            onClick={() => {
              toggleSolarExport();
              toast.success(
                solarExport ? "Stopped exporting surplus" : "Exporting surplus to grid",
              );
            }}
          >
            {solarExport ? "Stop export" : "Export surplus"}
          </Button>
        </Panel>
        <Panel className="lg:col-span-4">
          <PanelHeader
            eyebrow={`${solarSite.capacityKw} kW array`}
            title="Today — produced vs used"
          />
          <div className="h-80 px-2 pt-2 pb-4">
            <SolarChart />
          </div>
        </Panel>
      </div>
    </div>
  );
}
