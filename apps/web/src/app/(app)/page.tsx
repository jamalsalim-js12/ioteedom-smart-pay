"use client";

import { BellOff, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SpendChart, SpendTrendChart, UnitsChart, UsageChart } from "@/components/charts/load";
import { Kpi } from "@/components/ops/kpi";
import { Topbar } from "@/components/shell/topbar";
import { AmountDialog } from "@/components/ui/amount-dialog";
import { Button } from "@/components/ui/button";
import { Docket } from "@/components/ui/docket";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PayDialog } from "@/components/ui/pay-dialog";
import type { BillId } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import {
  dueHint,
  houseAlerts,
  latestPayment,
  nextDueBill,
  openBills,
  statusHint,
  waterToCollect,
} from "@/lib/house";
import { useActiveHouse, useDemoStore, useEnabled } from "@/lib/store";

const billColor: Record<BillId, string> = {
  ecg: "var(--color-live)",
  water: "var(--color-water)",
  waste: "var(--color-grid)",
  internet: "var(--color-brass)",
};

const tone = {
  warn: "border-l-alert",
  info: "border-l-live",
  ok: "border-l-grid",
};

export default function OverviewPage() {
  const router = useRouter();
  const house = useActiveHouse();
  const bills = house.bills;
  const enabled = useEnabled();
  const session = useDemoStore((s) => s.session);
  const devicesOn = useDemoStore((s) => s.devicesOn);
  const toggleDevice = useDemoStore((s) => s.toggleDevice);
  const dismissAlert = useDemoStore((s) => s.dismissAlert);
  const resolveLeak = useDemoStore((s) => s.resolveLeak);
  const chargingSite = useDemoStore((s) => s.chargingSite);
  const stopCharge = useDemoStore((s) => s.stopCharge);
  const topUpEcg = useDemoStore((s) => s.topUpEcg);
  const [payId, setPayId] = useState<BillId | null>(null);
  const [payAll, setPayAll] = useState(false);
  const [topup, setTopup] = useState(false);

  const tenant = session?.role === "tenant";
  const due = openBills(house, enabled, session);
  const totalDue = due.reduce((sum, bill) => sum + bill.due, 0);
  const next = dueHint(nextDueBill(house, enabled, session));
  const visibleAlerts = tenant ? [] : houseAlerts(house, enabled);
  const houseStatus = statusHint(house, enabled);
  const lastPay = latestPayment(
    house,
    tenant && session.role === "tenant" ? session.unitId : undefined,
  );
  const credit = bills.ecg.credit ?? 0;
  const collected = house.waterCollected;
  const toCollect = waterToCollect(house);
  const spendMix = due.map((bill) => ({
    name: bill.label,
    value: bill.due,
    color: billColor[bill.id],
  }));

  return (
    <div className="enter">
      <Topbar kicker={`${house.label} · ${house.address}`} title="What needs doing" />

      <div className="flex flex-col gap-5 p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Open amount"
            value={compactCedis(totalDue)}
            hint={
              tenant
                ? `${due.length} bill${due.length === 1 ? "" : "s"} on your unit`
                : house.kind === "estate"
                  ? `${compactCedis(toCollect)} still to collect from tenants`
                  : `${due.length} bill${due.length === 1 ? "" : "s"} still open`
            }
            tone={totalDue > 0 ? "live" : "ok"}
          />
          <Kpi label={next.label} value={next.value} hint={next.hint} tone={next.tone} />
          {enabled.ecg && !tenant && house.kind !== "estate" ? (
            <Kpi
              label="ECG credit"
              value={compactCedis(credit)}
              hint={bills.ecg.meter ?? bills.ecg.account}
            />
          ) : house.kind === "estate" && !tenant ? (
            <Kpi
              label="Collected water"
              value={compactCedis(collected)}
              hint="Waiting to remit to Ghana Water"
              tone={collected > 0 ? "ok" : "live"}
            />
          ) : (
            <Kpi
              label="Last payment"
              value={lastPay ? compactCedis(lastPay.amount) : "—"}
              hint={lastPay ? lastPay.label : "Nothing on the ledger"}
            />
          )}
          <Kpi
            label={houseStatus.label}
            value={houseStatus.value}
            hint={houseStatus.hint}
            tone={houseStatus.tone}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button disabled={totalDue <= 0} onClick={() => setPayAll(true)}>
            Pay all due
          </Button>
          {enabled.ecg && !tenant && house.kind !== "estate" ? (
            <Button intent="ghost" onClick={() => setTopup(true)}>
              Top up ECG
            </Button>
          ) : null}
          {enabled.water &&
          (tenant ? due.some((bill) => bill.id === "water") : bills.water.due > 0) ? (
            <Button intent="water" onClick={() => setPayId("water")}>
              {tenant || house.kind !== "estate" ? "Pay water" : "Pay Ghana Water"}
            </Button>
          ) : null}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel>
            <PanelHeader
              eyebrow={house.label}
              title={
                tenant ? "Your usage" : house.kind === "estate" ? "Estate load" : "Power and water"
              }
            />
            <div className="h-64 px-2 pt-2 pb-4">
              <UsageChart data={house.usage} />
            </div>
          </Panel>
          <Panel>
            {house.kind === "estate" && !tenant ? (
              <>
                <PanelHeader eyebrow="This cycle" title="Open by unit" />
                <div className="h-64 px-2 pt-2 pb-4">
                  <UnitsChart units={house.units ?? []} />
                </div>
              </>
            ) : spendMix.length > 0 ? (
              <>
                <PanelHeader eyebrow="Open docket" title="Where the money sits" />
                <div className="grid h-64 grid-cols-[minmax(0,1fr)_auto] items-center pr-5">
                  <SpendChart data={spendMix} />
                  <ul className="flex flex-col gap-2 py-4">
                    {spendMix.map((item) => (
                      <li key={item.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="text-mute">{item.name}</span>
                        <span className="ml-auto tabular">{compactCedis(item.value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <PanelHeader eyebrow="This year" title="What you spent" />
                <div className="h-64 px-2 pt-2 pb-4">
                  <SpendTrendChart data={house.usage} />
                </div>
              </>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <div className="flex flex-col gap-3">
            {house.kind === "estate" && !tenant ? (
              <>
                {enabled.water ? (
                  <Docket {...house.bills.water} onPay={() => setPayId("water")} />
                ) : null}
                {(house.units ?? []).map((unit) => (
                  <article
                    key={unit.id}
                    className="flex flex-col gap-3 rounded-2xl border border-line bg-card px-5 py-4"
                  >
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                        {unit.tenant}
                      </p>
                      <p className="mt-1 font-display text-2xl tracking-tight">{unit.name}</p>
                      <p className="mt-2 font-mono text-xs text-mute">
                        ECG {unit.ecgDue > 0 ? compactCedis(unit.ecgDue) : "paid"} · tenant pays ECG
                      </p>
                      <p className="mt-1 font-mono text-xs text-mute">
                        Water{" "}
                        {unit.waterDue > 0
                          ? `${compactCedis(unit.waterDue)} to collect`
                          : "collected"}{" "}
                        · {unit.waterM3} m³
                      </p>
                    </div>
                  </article>
                ))}
              </>
            ) : due.length === 0 ? (
              <Panel>
                <EmptyState
                  icon={CircleCheck}
                  title="Nothing waiting"
                  body="Cycle is clear. History is in Activity."
                />
              </Panel>
            ) : (
              due.map((bill) => <Docket key={bill.id} {...bill} onPay={() => setPayId(bill.id)} />)
            )}
          </div>

          <div className="flex flex-col gap-5">
            {enabled.smartHome ? (
              <Panel className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">House</p>
                <p className="mt-1 font-display text-xl tracking-tight">Controls</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    intent={devicesOn.lock ? "ink" : "ghost"}
                    onClick={() => {
                      toggleDevice("lock");
                      toast.success(devicesOn.lock ? "Front lock opened" : "Front lock closed");
                    }}
                  >
                    {devicesOn.lock ? "Unlock door" : "Lock door"}
                  </Button>
                  <Button
                    intent={devicesOn.lights ? "brass" : "ghost"}
                    onClick={() => {
                      toggleDevice("lights");
                      toast.success(devicesOn.lights ? "Yard lights off" : "Yard lights on");
                    }}
                  >
                    {devicesOn.lights ? "Lights off" : "Lights on"}
                  </Button>
                  <Button
                    intent={devicesOn.ac ? "ink" : "ghost"}
                    onClick={() => {
                      toggleDevice("ac");
                      toast.success(devicesOn.ac ? "AC off" : "AC on");
                    }}
                  >
                    {devicesOn.ac ? "AC off" : "AC on"}
                  </Button>
                </div>
              </Panel>
            ) : null}

            {enabled.ev && chargingSite ? (
              <Panel className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                  Charging now
                </p>
                <p className="mt-2 font-display text-xl tracking-tight">{chargingSite}</p>
                <Button
                  className="mt-4"
                  intent="ink"
                  onClick={() => {
                    const session = stopCharge();
                    if (session) {
                      toast.success(
                        `Stopped · ${session.kwh} kWh · ${compactCedis(session.amount)}`,
                      );
                    }
                  }}
                >
                  Stop session
                </Button>
              </Panel>
            ) : null}

            <Panel>
              <PanelHeader eyebrow="Watch" title="Needs a decision" />
              {visibleAlerts.length === 0 ? (
                <EmptyState
                  icon={BellOff}
                  title="No open alerts"
                  body="Nothing needs a decision on this house."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {visibleAlerts.map((item) => (
                    <li key={item.id} className={`border-l-4 px-5 py-4 ${tone[item.tone]}`}>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-mute">{item.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.id === "a1" && !house.leakResolved ? (
                          <>
                            <Button size="sm" intent="water" onClick={() => router.push("/meters")}>
                              Inspect meter
                            </Button>
                            <Button
                              size="sm"
                              intent="ghost"
                              onClick={() => {
                                resolveLeak();
                                toast.success("Leak watch cleared");
                              }}
                            >
                              Mark resolved
                            </Button>
                          </>
                        ) : null}
                        {item.id === "a2" ? (
                          <Button size="sm" onClick={() => setPayId("ecg")}>
                            Pay ECG
                          </Button>
                        ) : null}
                        <Button size="sm" intent="ghost" onClick={() => dismissAlert(item.id)}>
                          Dismiss
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>

      <PayDialog
        billId={payId}
        open={payId != null}
        onOpenChange={(open) => {
          if (!open) setPayId(null);
        }}
      />
      <PayDialog billId={null} settleAll open={payAll} onOpenChange={setPayAll} />
      <AmountDialog
        open={topup}
        title="Top up ECG credit"
        description="Adds prepaid units. Does not settle the postpaid docket."
        onOpenChange={setTopup}
        onConfirm={(amount, method) =>
          new Promise((resolve) => {
            window.setTimeout(() => resolve(topUpEcg(amount, method).ref), 600);
          })
        }
      />
    </div>
  );
}
