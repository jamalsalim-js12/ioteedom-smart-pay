"use client";

import { Car, Receipt, Zap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  ViewReceiptButton,
  paymentStatusClass,
} from "@/components/ui/receipt-dialog";
import { Topbar } from "@/components/shell/topbar";
import { paymentMethods } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import { useActiveHouse, useDemoStore } from "@/lib/store";

export default function ActivityPage() {
  const house = useActiveHouse();
  const payments = house.payments;
  const sessions = useDemoStore((s) => s.sessions);
  const houseEvents = useDemoStore((s) => s.houseEvents);

  return (
    <div className="enter">
      <Topbar kicker={`${house.label} · one ledger`} title="Activity" />
      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Money" title="Payments" />
          {payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments"
              body="Settled bills will show up here."
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
                        {paymentMethods.find((m) => m.id === item.method)?.name}
                      </p>
                      <p className="mt-1 text-xs text-mute">{item.at}</p>
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

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader eyebrow="Charging" title="EV sessions" />
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
                    className="flex justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <span>
                      {session.site}
                      <span className="mt-1 block font-mono text-xs text-mute">
                        {session.at}
                      </span>
                    </span>
                    <span className="tabular">{compactCedis(session.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel>
            <PanelHeader eyebrow="House" title="Smart home events" />
            {houseEvents.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No events"
                body="Locks, lights, and climate will log here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {houseEvents.map((event) => (
                  <li key={`${event.at}-${event.text}`} className="px-5 py-3 text-sm">
                    <p className="font-mono text-xs text-mute">{event.at}</p>
                    <p className="mt-1">{event.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
