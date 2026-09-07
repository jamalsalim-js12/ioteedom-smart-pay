"use client";

import { platformAccounts, platformChargers } from "@/data/platform";
import { namedModules } from "@/data/demo";
import {
  AMA_OWNER_ID,
  openAmount,
  ownerAccountId,
  useDemoStore,
  type HouseState,
  type OpsAccountStatus,
  type Payment,
} from "@/lib/store";

export type OpsAccount = (typeof platformAccounts)[number] & {
  live: boolean;
  status: OpsAccountStatus;
  inviteStatus?: "invited" | "active";
  pin?: string;
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
  const opsAccounts = useDemoStore((s) => s.opsAccounts);
  const ownerInvites = useDemoStore((s) => s.ownerInvites);
  const accountModules = useDemoStore((s) => s.accountModules);
  const enabled = useDemoStore((s) => s.enabled);
  const east = houses["east-legon"];
  const airport = houses.airport;
  const leakResolved = east.leakResolved;

  function modulesFor(id: string) {
    const ownerId = ownerAccountId(id);
    const fromStore = accountModules[ownerId] ?? opsAccounts[ownerId]?.modules;
    if (fromStore) return namedModules(fromStore);
    if (ownerId === AMA_OWNER_ID) return namedModules(enabled);
    return [];
  }

  const accounts: OpsAccount[] = [
    {
      id: "east-legon",
      name: opsAccounts["east-legon"]?.name || profile.name || "Ama Mensah",
      phone: opsAccounts["east-legon"]?.phone || profile.phone || "024 412 8891",
      kind: "home",
      property: opsAccounts["east-legon"]?.property || east.address,
      city: opsAccounts["east-legon"]?.city || profile.city || "Accra",
      lastSeen: east.lastSeen,
      open: openAmount(east),
      modules: modulesFor("east-legon"),
      note: leakResolved
        ? "Leak watch on WM-110384 is cleared."
        : "Water meter WM-110384 is on leak watch.",
      live: true,
      status: opsAccounts["east-legon"]?.status ?? "active",
    },
    {
      id: "airport",
      name: opsAccounts.airport?.name || "Airport Residential",
      phone: opsAccounts.airport?.phone || profile.phone || "024 412 8891",
      kind: "estate",
      property: opsAccounts.airport?.property || airport.address,
      city: opsAccounts.airport?.city || "Accra",
      lastSeen: airport.lastSeen,
      open: openAmount(airport),
      units: airport.units.length,
      modules: modulesFor("airport"),
      note: "Four units. Tenants pay ECG. Owner collects water, then remits to Ghana Water.",
      live: true,
      status: opsAccounts.airport?.status ?? "active",
    },
    ...ownerInvites.map((invite) => ({
      id: invite.id,
      name: invite.name,
      phone: invite.phone,
      kind: invite.kind,
      property: invite.property,
      city: invite.city,
      lastSeen: invite.status === "invited" ? "Invite sent" : invite.invitedAt,
      open: 0,
      modules: namedModules(accountModules[invite.id] ?? invite.modules),
      note:
        invite.status === "invited"
          ? `Waiting to sign in · PIN ${invite.pin}`
          : "Signed in. Modules stay under superadmin control.",
      live: invite.status === "active",
      status: opsAccounts[invite.id]?.status ?? "active",
      inviteStatus: invite.status,
      pin: invite.status === "invited" ? invite.pin : undefined,
    })),
    ...platformAccounts.map((item) => ({
      ...item,
      name: opsAccounts[item.id]?.name || item.name,
      phone: opsAccounts[item.id]?.phone || item.phone,
      property: opsAccounts[item.id]?.property || item.property,
      city: opsAccounts[item.id]?.city || item.city,
      modules: modulesFor(item.id).length
        ? modulesFor(item.id)
        : item.modules,
      live: false,
      status: opsAccounts[item.id]?.status ?? "active",
    })),
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
