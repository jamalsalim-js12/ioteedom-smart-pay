"use client";

import { platformAccounts, platformChargers } from "@/data/platform";
import { openAmount, useDemoStore, type HouseState, type Payment } from "@/lib/store";

export type OpsAccount = (typeof platformAccounts)[number] & {
  live: boolean;
};

export function chargerSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function chargerBySlug(slug: string) {
  return platformChargers.find((site) => chargerSlug(site.name) === slug);
}

export function routeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function useOpsSnapshot() {
  const houses = useDemoStore((s) => s.houses);
  const profile = useDemoStore((s) => s.profile);
  const platformPayments = useDemoStore((s) => s.platformPayments);
  const east = houses["east-legon"];
  const airport = houses.airport;
  const leakResolved = east.leakResolved;

  const accounts: OpsAccount[] = [
    {
      id: "east-legon",
      name: profile.name || "Ama Mensah",
      phone: profile.phone || "024 412 8891",
      kind: "home",
      property: east.address,
      city: profile.city || "Accra",
      lastSeen: east.lastSeen,
      open: openAmount(east),
      modules: ["ECG", "Water", "Waste", "Fibre"],
      note: leakResolved
        ? "Leak watch on WM-110384 is cleared."
        : "Water meter WM-110384 is on leak watch.",
      live: true,
    },
    {
      id: "airport",
      name: "Airport Residential",
      phone: profile.phone || "024 412 8891",
      kind: "estate",
      property: airport.address,
      city: "Accra",
      lastSeen: airport.lastSeen,
      open: openAmount(airport),
      units: airport.units.length,
      modules: ["ECG", "Water", "Waste"],
      note: "Four units share a combined ECG and water docket.",
      live: true,
    },
    ...platformAccounts.map((item) => ({ ...item, live: false })),
  ];

  const payments: Payment[] = [
    ...Object.values(houses).flatMap((house) => house.payments),
    ...platformPayments,
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  const collected = payments
    .filter((item) => item.status === "success")
    .reduce((sum, item) => sum + item.amount, 0);
  const open = accounts.reduce((sum, item) => sum + item.open, 0);
  const failed = payments.filter((item) => item.status === "failed").length;
  const pending = payments.filter((item) => item.status === "pending").length;

  return {
    accounts,
    payments,
    collected,
    open,
    failed,
    pending,
    leakResolved,
    east,
    airport,
  };
}

export function propertyLabel(
  payment: Payment,
  houses: Record<string, HouseState>,
) {
  return (
    payment.propertyLabel ||
    Object.values(houses).find((house) => house.id === payment.propertyId)?.label ||
    payment.propertyId
  );
}
