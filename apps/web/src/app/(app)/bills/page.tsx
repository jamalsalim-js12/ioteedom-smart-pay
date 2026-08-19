"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Docket } from "@/components/ui/docket";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PayDialog } from "@/components/ui/pay-dialog";
import { AmountDialog } from "@/components/ui/amount-dialog";
import {
  ViewReceiptButton,
  paymentStatusClass,
} from "@/components/ui/receipt-dialog";
import { ModuleOff } from "@/components/shell/module-off";
import { Topbar } from "@/components/shell/topbar";
import { paymentMethods, type BillId } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { useActiveHouse, useDemoStore } from "@/lib/store";

export default function BillsPage() {
  const house = useActiveHouse();
  const bills = house.bills;
  const payments = house.payments;
  const enabled = useDemoStore((s) => s.enabled);
  const topUpEcg = useDemoStore((s) => s.topUpEcg);
  const [payId, setPayId] = useState<BillId | null>(null);
  const [payAll, setPayAll] = useState(false);
  const [topup, setTopup] = useState(false);

  const visible = useMemo(
    () =>
      (Object.values(bills) as (typeof bills)[BillId][]).filter(
        (bill) => enabled[bill.service],
      ),
    [bills, enabled],
  );
  const totalDue = visible.reduce((sum, bill) => sum + bill.due, 0);

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
      <Topbar kicker={`${house.label} · ECG · GWCL · the rest`} title="Bills" />
      <div className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button disabled={totalDue <= 0} onClick={() => setPayAll(true)}>
              Pay all due
            </Button>
            {enabled.ecg ? (
              <Button intent="ghost" onClick={() => setTopup(true)}>
                Top up prepaid
              </Button>
            ) : null}
          </div>
          {visible.map((bill) => (
            <Docket key={bill.id} {...bill} onPay={() => setPayId(bill.id)} />
          ))}
        </div>

        <Panel>
          <PanelHeader eyebrow="History" title="What already went through" />
          {payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              body="Cleared bills will show up here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {payments.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 font-mono text-xs text-mute">
                        {item.ref} ·{" "}
                        {paymentMethods.find((m) => m.id === item.method)?.name} ·{" "}
                        {item.at}
                      </p>
                      <ViewReceiptButton payment={item} />
                    </div>
                    <div className="text-right">
                      <p className="tabular font-medium">
                        {compactCedis(item.amount)}
                      </p>
                      <p className={paymentStatusClass(item.status)}>
                        {item.status}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
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
        description={`Prepaid units on meter ${house.bills.ecg.meter ?? house.bills.ecg.account}.`}
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
