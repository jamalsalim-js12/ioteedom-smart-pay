import type { EstateUnit, ServiceId } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import type { BillState, HouseState, Session } from "@/lib/store";

const months: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function parseBillDate(value: string) {
  const [day, month, year] = value.split(" ");
  return new Date(Number(year), months[month] ?? 0, Number(day));
}

export function isOverdue(dueDate: string) {
  const due = parseBillDate(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function waterToCollect(house: HouseState) {
  return (house.units ?? []).reduce((sum, unit) => sum + unit.waterDue, 0);
}

export function railHint(bill: BillState) {
  if (bill.rail === "collect") return `Pays ${bill.destination}`;
  if (bill.rail === "remit") return "Remit to Ghana Water";
  return `Goes to ${bill.destination}`;
}

export function tenantBills(house: HouseState, unit: EstateUnit): BillState[] {
  return [
    {
      ...house.bills.ecg,
      account: `${house.bills.ecg.account} · ${unit.name}`,
      due: unit.ecgDue,
      credit: undefined,
      destination: "ECG",
      rail: "direct",
    },
    {
      ...house.bills.water,
      label: "Water",
      provider: "Landlord",
      account: `${unit.name} · ${house.label}`,
      due: unit.waterDue,
      destination: house.ownerName,
      rail: "collect",
    },
  ];
}

export function visibleBills(
  house: HouseState,
  enabled: Record<ServiceId, boolean>,
  session?: Session | null,
) {
  if (session?.role === "tenant") {
    const unit = (house.units ?? []).find((item) => item.id === session.unitId);
    if (!unit) return [];
    return tenantBills(house, unit).filter((bill) => enabled[bill.service]);
  }
  return (Object.values(house.bills ?? {}) as BillState[]).filter((bill) => {
    if (!enabled[bill.service]) return false;
    if (house.kind === "estate" && bill.id === "ecg") return false;
    return true;
  });
}

export function openBills(
  house: HouseState,
  enabled: Record<ServiceId, boolean>,
  session?: Session | null,
) {
  return visibleBills(house, enabled, session).filter((bill) => bill.due > 0);
}

export function nextDueBill(
  house: HouseState,
  enabled: Record<ServiceId, boolean>,
  session?: Session | null,
) {
  return openBills(house, enabled, session)
    .slice()
    .sort((a, b) => parseBillDate(a.dueDate).getTime() - parseBillDate(b.dueDate).getTime())[0];
}

export function houseAlerts(
  house: HouseState,
  enabled: Record<ServiceId, boolean>,
) {
  return (house.alerts ?? []).filter(
    (item) => enabled[item.service] && !(house.dismissedAlerts ?? []).includes(item.id),
  );
}

export function latestPayment(house: HouseState, unitId?: string) {
  const list = unitId
    ? (house.payments ?? []).filter((item) => item.unitId === unitId)
    : (house.payments ?? []);
  return list.slice().sort((a, b) => (a.at < b.at ? 1 : -1))[0];
}

export function statusHint(house: HouseState, enabled: Record<ServiceId, boolean>) {
  if (enabled.meters && !house.leakResolved && house.kind !== "estate") {
    return {
      label: "Leak watch",
      value: "Armed",
      hint: house.bills.water.meter ?? "Water meter",
      tone: "alert" as const,
    };
  }
  if (house.kind === "estate") {
    const owing = (house.units ?? []).filter((unit) => unit.waterDue > 0).length;
    return {
      label: "To collect",
      value: compactCedis(waterToCollect(house)),
      hint:
        owing === 0
          ? "Tenants have paid water"
          : `${owing} unit${owing === 1 ? "" : "s"} still owing water`,
      tone: owing > 0 ? ("live" as const) : ("ok" as const),
    };
  }
  const open = houseAlerts(house, enabled).length;
  return {
    label: "Alerts",
    value: String(open),
    hint: open === 0 ? "Nothing waiting" : "Needs a look",
    tone: open > 0 ? ("alert" as const) : ("ok" as const),
  };
}

export function dueHint(bill: BillState | undefined) {
  if (!bill) {
    return {
      label: "Next due",
      value: "Clear",
      hint: "Nothing on the docket",
      tone: "ok" as const,
    };
  }
  const overdue = isOverdue(bill.dueDate);
  return {
    label: overdue ? "Overdue" : "Next due",
    value: compactCedis(bill.due),
    hint: `${railHint(bill)} · ${bill.dueDate}`,
    tone: overdue ? ("alert" as const) : ("live" as const),
  };
}
