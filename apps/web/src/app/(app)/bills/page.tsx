"use client";

import { Receipt, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { type BillListItemDto, useGetBills, useGetUnitsEcgStatus } from "@/api/generated/api";
import { ModuleOff } from "@/components/shell/module-off";
import { Topbar } from "@/components/shell/topbar";
import { Button } from "@/components/ui/button";
import { Docket } from "@/components/ui/docket";
import { EcgPayDialog } from "@/components/ui/ecg-pay-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { compactCedis } from "@/lib/format";
import { useAuthSession, useEnabled } from "@/lib/session";

function pesewasToCedis(value: string) {
  return Number(value) / 100;
}

function providerFor(bill: BillListItemDto) {
  if (bill.payeeType === "ecg") return "ECG";
  if (bill.payeeType === "gwcl") return "GWCL";
  if (bill.payeeType === "owner") return "Landlord";
  return bill.payeeLabel;
}

function labelFor(bill: BillListItemDto) {
  if (bill.type === "ecg_postpaid" || bill.type === "ecg_prepaid") {
    return bill.unitName ? `ECG · ${bill.unitName}` : "ECG";
  }
  if (bill.type === "water_tenant") return "Water (to landlord)";
  if (bill.type === "water_gwcl") return "Ghana Water";
  return bill.payeeLabel;
}

function formatDue(dueAt: string | null | undefined) {
  if (!dueAt) return "—";
  const date = new Date(`${dueAt}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dueAt;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BillsPage() {
  const { session } = useAuthSession();
  const enabled = useEnabled();
  const tenant = session?.role === "tenant";
  const owner = session?.role === "household";
  const billsQuery = useGetBills({
    query: { enabled: Boolean(session) && session?.role !== "ops" },
  });
  const tenantEcgQuery = useGetUnitsEcgStatus({
    query: { enabled: Boolean(owner) },
  });
  const [payBill, setPayBill] = useState<BillListItemDto | null>(null);

  const bills = billsQuery.data?.items ?? [];
  const ecgBills = useMemo(() => bills.filter((bill) => bill.payeeType === "ecg"), [bills]);
  const otherBills = useMemo(() => bills.filter((bill) => bill.payeeType !== "ecg"), [bills]);
  const totalEcgDue = ecgBills
    .filter((bill) => bill.payable)
    .reduce((sum, bill) => sum + pesewasToCedis(bill.amountDuePesewas), 0);

  if (!enabled.ecg && !enabled.water && !enabled.utilities) {
    return (
      <div className="enter">
        <Topbar kicker="Payments" title="Bills" />
        <ModuleOff name="Bills" />
      </div>
    );
  }

  return (
    <div className="enter">
      <Topbar
        kicker={
          tenant
            ? `${session?.occupancies[0]?.propertyLabel ?? "Your unit"} · you pay ECG`
            : owner
              ? "Your ECG · tenant power is status only"
              : "Bills"
        }
        title="Bills"
      />
      <div className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex flex-col gap-3">
          {billsQuery.isPending ? (
            <p className="text-sm text-mute">Loading bills…</p>
          ) : billsQuery.isError ? (
            <EmptyState
              icon={Receipt}
              title="Could not load bills"
              body="Check your connection and try again."
            />
          ) : ecgBills.length === 0 && otherBills.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nothing due"
              body="Open bills for this account will show up here."
            />
          ) : (
            <>
              {ecgBills.map((bill) => (
                <Docket
                  key={bill.id}
                  provider={providerFor(bill)}
                  account={bill.accountNumber ?? "—"}
                  meter={bill.meterNumber ?? undefined}
                  label={labelFor(bill)}
                  due={pesewasToCedis(bill.amountDuePesewas)}
                  dueDate={formatDue(bill.dueAt)}
                  cycle={bill.cycle}
                  destination={bill.payeeLabel}
                  rail={bill.rail}
                  onPay={
                    bill.payable && bill.rail === "direct" && bill.payeeType === "ecg"
                      ? () => setPayBill(bill)
                      : undefined
                  }
                />
              ))}
              {otherBills.map((bill) => (
                <Docket
                  key={bill.id}
                  provider={providerFor(bill)}
                  account={bill.accountNumber ?? bill.payeeLabel}
                  meter={bill.meterNumber ?? undefined}
                  label={labelFor(bill)}
                  due={pesewasToCedis(bill.amountDuePesewas)}
                  dueDate={formatDue(bill.dueAt)}
                  cycle={bill.cycle}
                  destination={bill.payeeLabel}
                  rail={bill.rail}
                />
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {owner ? (
            <Panel>
              <PanelHeader eyebrow="Estate" title="Tenant ECG status" />
              {(tenantEcgQuery.data?.items.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Zap}
                  title="No unit meters"
                  body="On an estate, each unit's ECG settlement shows here. You cannot pay those bills."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {tenantEcgQuery.data?.items.map((item) => (
                    <li key={item.unitId} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {item.unitName}
                            {item.tenantName ? ` · ${item.tenantName}` : ""}
                          </p>
                          <p className="mt-1 font-mono text-xs text-mute">
                            {item.accountNumber ?? "—"}
                            {item.meterNumber ? ` · ${item.meterNumber}` : ""}
                          </p>
                          <p className="mt-1 text-sm text-mute">Owner cannot pay this meter.</p>
                        </div>
                        <div className="text-right">
                          <p className="tabular font-medium">
                            {item.status === "open"
                              ? compactCedis(pesewasToCedis(item.amountDuePesewas))
                              : item.status === "paid"
                                ? "Settled"
                                : "—"}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
                            {item.status}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader
              eyebrow="ECG"
              title={
                totalEcgDue > 0
                  ? `${compactCedis(totalEcgDue)} open on your meters`
                  : "Your ECG is clear"
              }
            />
            <p className="px-5 pb-5 text-sm text-mute">
              Receipts name ECG as the payee. Until the biller hop exists, a successful MoMo charge
              stays waiting for the meter credit.
            </p>
            {ecgBills.some((bill) => bill.payable) ? (
              <div className="border-t border-line px-5 py-4">
                <Button
                  disabled={!ecgBills.find((bill) => bill.payable)}
                  onClick={() => setPayBill(ecgBills.find((bill) => bill.payable) ?? null)}
                >
                  Pay your ECG
                </Button>
              </div>
            ) : null}
          </Panel>
        </div>
      </div>

      <EcgPayDialog
        bill={payBill}
        open={payBill != null}
        onOpenChange={(next) => {
          if (!next) setPayBill(null);
        }}
      />
    </div>
  );
}
