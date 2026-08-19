"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Car } from "lucide-react";
import { AccraMap } from "@/components/ev/accra-map";
import { EvChart } from "@/components/charts/load";
import { AmountDialog } from "@/components/ui/amount-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ModuleOff } from "@/components/shell/module-off";
import { Topbar } from "@/components/shell/topbar";
import { chargerSites, evVehicle, paymentMethods } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useActiveHouse, useDemoStore } from "@/lib/store";

export default function EvPage() {
  const on = useDemoStore((s) => s.enabled.ev);
  const house = useActiveHouse();
  const wallet = house.wallet;
  const batteryPct = useDemoStore((s) => s.batteryPct);
  const chargingSite = useDemoStore((s) => s.chargingSite);
  const sessions = useDemoStore((s) => s.sessions);
  const startCharge = useDemoStore((s) => s.startCharge);
  const stopCharge = useDemoStore((s) => s.stopCharge);
  const topUpWallet = useDemoStore((s) => s.topUpWallet);
  const [topup, setTopup] = useState(false);
  const [selected, setSelected] = useState(
    chargingSite ?? chargerSites.find((site) => site.status === "online")?.name ??
      chargerSites[0].name,
  );

  function runStart(name: string) {
    const error = startCharge(name);
    if (error) toast.error(error);
    else toast.success(`Charging at ${name}`);
  }

  function runStop() {
    const session = stopCharge();
    if (session) {
      toast.success(`Stopped · ${session.kwh} kWh · ${compactCedis(session.amount)}`);
    }
  }

  if (!on) {
    return (
      <div className="enter">
        <Topbar kicker="Account side" title="EV" />
        <ModuleOff name="EV" />
      </div>
    );
  }

  const selectedSite =
    chargerSites.find((site) => site.name === selected) ?? chargerSites[0];

  return (
    <div className="enter">
      <Topbar kicker={evVehicle.plate} title="EV" />
      <div className="flex flex-col gap-5 p-6">
        <AccraMap
          selected={selected}
          chargingSite={chargingSite}
          onSelect={setSelected}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              Selected site
            </p>
            <p className="mt-1 font-display text-xl tracking-tight">
              {selectedSite.name}
              <span
                className={cn(
                  "ml-2 font-mono text-[11px] uppercase",
                  selectedSite.status === "online" ? "text-grid" : "text-alert",
                )}
              >
                {selectedSite.status}
              </span>
            </p>
          </div>
          {chargingSite === selectedSite.name ? (
            <Button intent="ink" onClick={runStop}>
              Stop
            </Button>
          ) : (
            <Button
              disabled={
                selectedSite.status !== "online" || Boolean(chargingSite)
              }
              onClick={() => runStart(selectedSite.name)}
            >
              Start
            </Button>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              Vehicle
            </p>
            <p className="mt-2 font-display text-2xl tracking-tight">
              {evVehicle.model}
            </p>
            <p className="mt-3 font-display text-4xl tracking-tight tabular">
              {batteryPct}%
            </p>
            <p className="mt-1 text-sm text-mute">
              {Math.round((batteryPct / 100) * evVehicle.rangeKm)} km estimated
            </p>
          </Panel>
          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              Charge wallet
            </p>
            <p className="mt-2 font-display text-4xl tracking-tight tabular">
              {compactCedis(wallet)}
            </p>
            <Button className="mt-4" size="sm" onClick={() => setTopup(true)}>
              Top up wallet
            </Button>
          </Panel>
          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              Legend
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              {chargerSites.map((site) => (
                <li
                  key={site.name}
                  className="flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => setSelected(site.name)}
                  >
                    {site.name}
                    <span
                      className={cn(
                        "ml-2 font-mono text-[11px] uppercase",
                        site.status === "online" ? "text-grid" : "text-alert",
                      )}
                    >
                      {site.status}
                    </span>
                  </button>
                  {chargingSite === site.name ? (
                    <Button size="sm" intent="ink" onClick={runStop}>
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      intent="ghost"
                      disabled={site.status !== "online" || Boolean(chargingSite)}
                      onClick={() => {
                        setSelected(site.name);
                        runStart(site.name);
                      }}
                    >
                      Start
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel>
          <PanelHeader eyebrow="Last 5 weeks" title="Charging load" />
          <div className="h-72 px-2 pt-2 pb-4">
            <EvChart />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Sessions" title="Paid at the charger" />
          {sessions.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No sessions"
              body="Paid charging will land here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {sessions.map((session) => (
                <li
                  key={`${session.site}-${session.at}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">{session.site}</p>
                    <p className="font-mono text-xs text-mute">
                      {session.at} · {session.kwh} kWh ·{" "}
                      {paymentMethods.find((m) => m.id === session.method)?.name}
                    </p>
                  </div>
                  <p className="tabular font-medium">
                    {compactCedis(session.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <AmountDialog
        open={topup}
        title="Top up EV wallet"
        description="The charging app will debit this same wallet."
        onOpenChange={setTopup}
        onConfirm={(amount, method) =>
          new Promise((resolve) => {
            window.setTimeout(
              () => resolve(topUpWallet(amount, method).ref),
              600,
            );
          })
        }
      />
    </div>
  );
}
