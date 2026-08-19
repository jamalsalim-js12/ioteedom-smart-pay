import type { ServiceId } from "@/data/demo";
import { compactCedis } from "@/lib/format";
import type { BillState, HouseState } from "@/lib/store";

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

export function openBills(
  house: HouseState,
  enabled: Record<ServiceId, boolean>,
) {
  return (Object.values(house.bills ?? {}) as BillState[]).filter(
    (bill) => enabled[bill.service] && bill.due > 0,
  );
}

export function nextDueBill(
  house: HouseState,
  enabled: Record<ServiceId, boolean>,
) {
  return openBills(house, enabled)
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

export function latestPayment(house: HouseState) {
  return (house.payments ?? []).slice().sort((a, b) => (a.at < b.at ? 1 : -1))[0];
}

export function statusHint(house: HouseState, enabled: Record<ServiceId, boolean>) {
  if (enabled.meters && !house.leakResolved) {
    return {
      label: "Leak watch",
      value: "Armed",
      hint: house.bills.water.meter ?? "Water meter",
      tone: "alert" as const,
    };
  }
  if (house.kind === "estate") {
    const openUnits = (house.units ?? []).filter((unit) => unit.ecgDue + unit.waterDue > 0).length;
    return {
      label: "Units",
      value: String((house.units ?? []).length),
      hint: `${openUnits} still carrying dues`,
      tone: openUnits > 0 ? ("live" as const) : ("ok" as const),
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
    hint: `${bill.label} · ${bill.dueDate}`,
    tone: overdue ? ("alert" as const) : ("live" as const),
  };
}
