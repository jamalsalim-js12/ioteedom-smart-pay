"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MeterChart } from "@/components/charts/load";
import { ModuleOff } from "@/components/shell/module-off";
import { Topbar } from "@/components/shell/topbar";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PayDialog } from "@/components/ui/pay-dialog";
import { meter, meterDaily } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { waterToCollect } from "@/lib/house";
import { useActiveHouse, useDemoStore, useEnabled, useTenantUnit } from "@/lib/store";

export default function MetersPage() {
  const on = useEnabled().meters;
  const house = useActiveHouse();
  const session = useDemoStore((s) => s.session);
  const unit = useTenantUnit();
  const leakResolved = house.leakResolved;
  const resolveLeak = useDemoStore((s) => s.resolveLeak);
  const requestReading = useDemoStore((s) => s.requestReading);
  const tenant = session?.role === "tenant";
  const waterDue = tenant ? (unit?.waterDue ?? 0) : house.bills.water.due;
  const meterId = house.bills.water.meter ?? meter.id;
  const [payWater, setPayWater] = useState(false);
  const spike = house.leakResolved ? undefined : meterDaily.find((d) => d.note === "spike");

  if (!on) {
    return (
      <div className="enter">
        <Topbar kicker="Property" title="Water meters" />
        <ModuleOff name="Water meters" />
      </div>
    );
  }

  return (
    <div className="enter">
      <Topbar kicker={meterId} title="Water meters" />
      <div className="grid gap-5 p-6 lg:grid-cols-3">
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {tenant ? "This cycle" : "Last reading"}
          </p>
          <p className="mt-2 font-display text-4xl tracking-tight tabular">
            {tenant
              ? (unit?.waterM3 ?? 0).toLocaleString("en-GH")
              : meter.reading.toLocaleString("en-GH")}
            <span className="ml-1 text-lg text-mute">{meter.unit}</span>
          </p>
          <p className="mt-2 text-sm text-mute">
            {tenant ? `${unit?.name} · ${unit?.tenant}` : `${meter.location} · ${meter.lastSeen}`}
          </p>
          {tenant ? null : (
            <Button
              className="mt-4"
              intent="ghost"
              size="sm"
              onClick={() => {
                requestReading();
                toast.success("Reading requested. We’ll show it when the meter replies.");
              }}
            >
              Request reading
            </Button>
          )}
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Status</p>
          <p
            className={
              leakResolved
                ? "mt-2 font-display text-2xl tracking-tight text-grid"
                : "mt-2 font-display text-2xl tracking-tight text-alert"
            }
          >
            {leakResolved ? "Clear" : "Leak watch"}
          </p>
          <p className="mt-2 text-sm text-mute">
            {leakResolved
              ? "No leak flags on this meter."
              : `Spike of ${spike?.m3 ?? "1.92"} m³ on the 15th. Sensor is still armed.`}
          </p>
          {!leakResolved && !tenant ? (
            <Button
              className="mt-4"
              size="sm"
              intent="water"
              onClick={() => {
                resolveLeak();
                toast.success("Leak watch cleared");
              }}
            >
              Mark resolved
            </Button>
          ) : null}
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {tenant ? "Your bill" : house.kind === "estate" ? "Ghana Water" : "Tied bill"}
          </p>
          <p className="mt-2 font-display text-2xl tracking-tight">
            {tenant ? house.ownerName : "GWCL"}
          </p>
          <p className="mt-2 text-sm text-mute">
            {tenant
              ? "Usage becomes a bill. You pay the landlord; they pay Ghana Water."
              : house.kind === "estate"
                ? `${compactCedis(house.waterCollected)} collected · ${compactCedis(waterToCollect(house))} still with tenants.`
                : "You pay Ghana Water for this meter."}
          </p>
          <Button
            className="mt-4"
            size="sm"
            disabled={waterDue <= 0}
            onClick={() => setPayWater(true)}
          >
            {waterDue <= 0
              ? tenant
                ? "Paid to landlord"
                : "Water settled"
              : tenant
                ? "Pay landlord"
                : house.kind === "estate"
                  ? "Pay Ghana Water"
                  : "Pay water bill"}
          </Button>
        </Panel>
        <Panel className="lg:col-span-3">
          <PanelHeader eyebrow="Last 7 days" title="Daily draw" />
          <div className="h-72 px-2 pt-2 pb-4">
            <MeterChart />
          </div>
        </Panel>
      </div>
      <PayDialog billId="water" open={payWater} onOpenChange={setPayWater} />
    </div>
  );
}
