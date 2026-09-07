"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  airportAlerts,
  airportBills,
  airportPayments,
  airportUnits,
  airportUsage,
  alerts,
  type BillId,
  chargerSites,
  defaultEnabled,
  type EstateUnit,
  evSessions,
  evVehicle,
  type HouseAlert,
  homeEvents,
  initialBills,
  monthlyUsage,
  namedModules,
  type PaymentMethod,
  type PaymentRail,
  type PaymentStatus,
  type PropertyId,
  type ServiceId,
  seedPayments,
  type UsageMonth,
} from "@/data/demo";
import { platformPayments as seedPlatformPayments } from "@/data/platform";

export type Payment = {
  id: string;
  billId: BillId | "wallet";
  label: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  at: string;
  ref: string;
  account?: string;
  propertyId: string;
  propertyLabel?: string;
  payee: string;
  rail: PaymentRail;
  unitId?: string;
};

export type Session =
  | { role: "household"; name: string; phone: string; email: string }
  | {
      role: "tenant";
      name: string;
      phone: string;
      email: string;
      unitId: string;
      propertyId: PropertyId;
    }
  | { role: "ops"; name: string; phone: string; email: string };

export type Profile = {
  name: string;
  phone: string;
  email: string;
  property: string;
  city: string;
};

export type HouseEvent = { at: string; text: string };

export type ChargeSession = {
  site: string;
  kwh: number;
  amount: number;
  at: string;
  method: PaymentMethod;
};

export type OpsAccountStatus = "active" | "suspended";

export type OpsAccountPatch = {
  name?: string;
  phone?: string;
  property?: string;
  city?: string;
  status?: OpsAccountStatus;
  modules?: Record<ServiceId, boolean>;
};

export type OpsActivityEntry = {
  id: string;
  at: string;
  actor: string;
  action: "account_updated" | "status_changed" | "invited" | "modules_changed";
  accountId: string;
  summary: string;
};

export type OwnerInvite = {
  id: string;
  name: string;
  phone: string;
  email: string;
  property: string;
  city: string;
  kind: "home" | "estate";
  modules: Record<ServiceId, boolean>;
  pin: string;
  status: "invited" | "active";
  invitedAt: string;
};

export const AMA_OWNER_ID = "east-legon";

export function ownerAccountId(accountId: string) {
  return accountId === "airport" ? AMA_OWNER_ID : accountId;
}

export type BillState = (typeof initialBills)[BillId];

export type HouseState = {
  id: PropertyId;
  label: string;
  address: string;
  kind: "home" | "estate";
  ownerName: string;
  lastSeen: string;
  units: EstateUnit[];
  bills: Record<BillId, BillState>;
  payments: Payment[];
  wallet: number;
  waterCollected: number;
  usage: UsageMonth[];
  alerts: HouseAlert[];
  leakResolved: boolean;
  dismissedAlerts: string[];
};

export function openAmount(house: HouseState) {
  return (Object.values(house.bills) as BillState[]).reduce((sum, bill) => sum + bill.due, 0);
}

export const DEMO_PHONE = "0244128891";
export const DEMO_PIN = "2468";
export const TENANT_PHONE = "0245556677";
export const TENANT_PIN = "3579";
export const OPS_PHONE = "0201112233";
export const OPS_PIN = "1357";

export const tenantEnabled: Record<ServiceId, boolean> = {
  ecg: true,
  water: true,
  utilities: false,
  meters: true,
  smartHome: false,
  solar: false,
  ev: false,
};

const allOff: Record<ServiceId, boolean> = {
  ecg: false,
  water: false,
  utilities: false,
  meters: false,
  smartHome: false,
  solar: false,
  ev: false,
};

function stamp() {
  return new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeRef() {
  return `SP-${Math.floor(180000 + Math.random() * 9000)}`;
}

function digits(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

function withProperty(
  list: {
    billId: BillId;
    label: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    at: string;
    ref: string;
    id: string;
    payee: string;
    rail: PaymentRail;
    unitId?: string;
  }[],
  propertyId: PropertyId,
  bills: Record<BillId, BillState>,
): Payment[] {
  return list.map((item) => ({
    ...item,
    propertyId,
    account: bills[item.billId]?.account,
    payee: item.payee,
    rail: item.rail,
    unitId: item.unitId,
  }));
}

function seedHouses(): Record<PropertyId, HouseState> {
  return {
    "east-legon": {
      id: "east-legon",
      label: "East Legon",
      address: "12 Boundary Rd, East Legon",
      kind: "home",
      ownerName: "Ama Mensah",
      lastSeen: "18 Aug, 21:14",
      units: [],
      bills: structuredClone(initialBills),
      payments: withProperty(seedPayments, "east-legon", structuredClone(initialBills)),
      wallet: evVehicle.wallet,
      waterCollected: 0,
      usage: structuredClone(monthlyUsage),
      alerts: structuredClone(alerts),
      leakResolved: false,
      dismissedAlerts: [],
    },
    airport: {
      id: "airport",
      label: "Airport Residential",
      address: "8 Liberia Rd, Airport Residential",
      kind: "estate",
      ownerName: "Ama Mensah",
      lastSeen: "18 Aug, 09:02",
      units: structuredClone(airportUnits),
      bills: structuredClone(airportBills),
      payments: withProperty(airportPayments, "airport", structuredClone(airportBills)),
      wallet: 420,
      waterCollected: 110,
      usage: structuredClone(airportUsage),
      alerts: structuredClone(airportAlerts),
      leakResolved: true,
      dismissedAlerts: [],
    },
  };
}

function normalizeUnit(unit: Partial<EstateUnit>, index: number): EstateUnit {
  return {
    id: unit.id ?? `u${index + 1}`,
    name: unit.name ?? `Unit ${index + 1}`,
    tenant: unit.tenant ?? "Tenant",
    ecgDue: unit.ecgDue ?? 0,
    waterDue: unit.waterDue ?? 0,
    waterM3: unit.waterM3 ?? 0,
  };
}

function normalizePayment(item: Payment): Payment {
  const payee =
    item.payee || (item.billId === "water" ? "Ghana Water" : item.billId === "ecg" ? "ECG" : "—");
  return {
    ...item,
    payee,
    rail: item.rail ?? "direct",
  };
}

function seedPlatform(): Payment[] {
  return structuredClone(seedPlatformPayments).map((item) =>
    normalizePayment({
      ...item,
      payee: item.billId === "water" ? "Ghana Water" : item.billId === "ecg" ? "ECG" : "—",
      rail: "direct",
    }),
  );
}

function withHouseDefaults(house: Partial<HouseState> | undefined, seed: HouseState): HouseState {
  return {
    ...seed,
    ...house,
    ownerName: house?.ownerName ?? seed.ownerName,
    waterCollected: house?.waterCollected ?? seed.waterCollected,
    units: (house?.units ?? seed.units).map(normalizeUnit),
    bills: house?.bills ?? seed.bills,
    payments: (house?.payments ?? seed.payments).map(normalizePayment),
    usage: house?.usage ?? seed.usage,
    alerts: house?.alerts ?? seed.alerts,
    leakResolved: house?.leakResolved ?? seed.leakResolved,
    dismissedAlerts: house?.dismissedAlerts ?? [],
  };
}

function normalizeHouses(
  houses: Record<string, Partial<HouseState>> | undefined,
): Record<PropertyId, HouseState> {
  const seed = seedHouses();
  return {
    "east-legon": withHouseDefaults(houses?.["east-legon"], seed["east-legon"]),
    airport: withHouseDefaults(houses?.airport, seed.airport),
  };
}

type Store = {
  hydrated: boolean;
  session: Session | null;
  pin: string;
  onboarded: boolean;
  profile: Profile;
  enabled: Record<ServiceId, boolean>;
  houses: Record<PropertyId, HouseState>;
  activePropertyId: PropertyId;
  platformPayments: Payment[];
  receipt: Payment | null;
  devicesOn: Record<string, boolean>;
  acTemp: number;
  batteryPct: number;
  chargingSite: string | null;
  sessions: ChargeSession[];
  houseEvents: HouseEvent[];
  solarExport: boolean;
  opsAccounts: Record<string, OpsAccountPatch>;
  opsActivityLog: OpsActivityEntry[];
  ownerInvites: OwnerInvite[];
  accountModules: Record<string, Record<ServiceId, boolean>>;
  onboardedByAccount: Record<string, boolean>;
  activeOwnerId: string;
  markHydrated: () => void;
  signUp: (input: { name: string; phone: string; email: string; pin: string }) => void;
  signIn: (phone: string, pin: string) => string | null;
  signOut: () => void;
  resetDemo: () => void;
  switchProperty: (id: PropertyId) => void;
  showReceipt: (payment: Payment | null) => void;
  completeOnboarding: (input: {
    property: string;
    city: string;
    ecgAccount?: string;
    waterAccount?: string;
  }) => void;
  updateProfile: (input: Profile) => void;
  setAccountModules: (accountId: string, modules: Record<ServiceId, boolean>) => void;
  inviteOwner: (input: {
    name: string;
    phone: string;
    email: string;
    property: string;
    city: string;
    kind: "home" | "estate";
    modules: Record<ServiceId, boolean>;
  }) => OwnerInvite;
  toggleDevice: (id: string) => void;
  setAcTemp: (temp: number) => void;
  payBill: (billId: BillId, amount: number, method: PaymentMethod) => Payment;
  payAllDue: (method: PaymentMethod) => Payment[];
  collectTenantWater: (unitId: string, method: PaymentMethod) => Payment;
  payTenantEcg: (unitId: string, method: PaymentMethod) => Payment;
  topUpEcg: (amount: number, method: PaymentMethod) => Payment;
  topUpWallet: (amount: number, method: PaymentMethod) => Payment;
  retryPayment: (id: string) => Payment | null;
  refundPayment: (id: string) => Payment | null;
  dismissAlert: (id: string) => void;
  resolveLeak: () => void;
  requestReading: () => void;
  startCharge: (site: string) => string | null;
  stopCharge: () => ChargeSession | null;
  toggleSolarExport: () => void;
  updateOpsAccount: (id: string, patch: OpsAccountPatch) => void;
  toggleOpsAccountStatus: (id: string) => void;
  logOpsActivity: (
    input: Omit<OpsActivityEntry, "id" | "at" | "actor"> & { actor?: string },
  ) => void;
  logEvent: (text: string) => void;
  findPayment: (ref: string) => Payment | undefined;
  allPayments: () => Payment[];
};

const initialState = {
  session: null as Session | null,
  pin: DEMO_PIN,
  onboarded: false,
  profile: {
    name: "",
    phone: "",
    email: "",
    property: "",
    city: "Accra",
  },
  enabled: { ...defaultEnabled },
  houses: seedHouses(),
  activePropertyId: "east-legon" as PropertyId,
  activeOwnerId: AMA_OWNER_ID,
  platformPayments: seedPlatform(),
  receipt: null as Payment | null,
  devicesOn: {
    lock: true,
    ac: true,
    lights: false,
    leak: true,
    air: true,
    fire: true,
  },
  acTemp: 24,
  batteryPct: evVehicle.batteryPct,
  chargingSite: null as string | null,
  sessions: [...evSessions] as ChargeSession[],
  houseEvents: [...homeEvents] as HouseEvent[],
  solarExport: false,
  opsAccounts: {},
  opsActivityLog: [],
  ownerInvites: [] as OwnerInvite[],
  accountModules: { [AMA_OWNER_ID]: { ...defaultEnabled } } as Record<
    string,
    Record<ServiceId, boolean>
  >,
  onboardedByAccount: { [AMA_OWNER_ID]: true } as Record<string, boolean>,
};

function activeHouse(state: {
  houses: Record<PropertyId, HouseState>;
  activePropertyId: PropertyId;
}) {
  return state.houses[state.activePropertyId];
}

function patchHouse(
  set: (fn: (state: Store) => Partial<Store>) => void,
  updater: (house: HouseState) => HouseState,
) {
  set((state) => {
    const id = state.activePropertyId;
    return {
      houses: { ...state.houses, [id]: updater(state.houses[id]) },
    };
  });
}

function settlePayment(
  house: HouseState,
  payment: Payment,
  direction: "apply" | "reverse",
): HouseState {
  const add = direction === "apply";
  const amount = payment.amount;
  const topUp = /top-?up/i.test(payment.label);

  if (payment.billId === "wallet") {
    const wallet = Number((house.wallet + (add ? amount : -amount)).toFixed(2));
    return { ...house, wallet: Math.max(0, wallet) };
  }
  if (topUp && payment.billId === "ecg") {
    const credit = Number(((house.bills.ecg.credit ?? 0) + (add ? amount : -amount)).toFixed(2));
    return {
      ...house,
      bills: {
        ...house.bills,
        ecg: { ...house.bills.ecg, credit: Math.max(0, credit) },
      },
    };
  }
  if (payment.rail === "collect" && payment.unitId) {
    return {
      ...house,
      waterCollected: Number(
        Math.max(0, house.waterCollected + (add ? amount : -amount)).toFixed(2),
      ),
      units: house.units.map((unit) =>
        unit.id === payment.unitId
          ? {
              ...unit,
              waterDue: Number(Math.max(0, unit.waterDue + (add ? -amount : amount)).toFixed(2)),
            }
          : unit,
      ),
    };
  }
  if (payment.rail === "remit") {
    return {
      ...house,
      waterCollected: Number(
        Math.max(0, house.waterCollected + (add ? -amount : amount)).toFixed(2),
      ),
      bills: {
        ...house.bills,
        water: {
          ...house.bills.water,
          due: Number(Math.max(0, house.bills.water.due + (add ? -amount : amount)).toFixed(2)),
        },
      },
    };
  }
  if (payment.unitId && payment.billId === "ecg") {
    return {
      ...house,
      units: house.units.map((unit) =>
        unit.id === payment.unitId
          ? {
              ...unit,
              ecgDue: Number(Math.max(0, unit.ecgDue + (add ? -amount : amount)).toFixed(2)),
            }
          : unit,
      ),
    };
  }
  const bill = house.bills[payment.billId];
  return {
    ...house,
    bills: {
      ...house.bills,
      [payment.billId]: {
        ...bill,
        due: Number(Math.max(0, bill.due + (add ? -amount : amount)).toFixed(2)),
      },
    },
  };
}

export const useDemoStore = create<Store>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialState,
      markHydrated: () => set({ hydrated: true }),
      showReceipt: (payment) => set({ receipt: payment }),
      switchProperty: (id) =>
        set((state) => ({
          activePropertyId: id,
          profile: { ...state.profile, property: state.houses[id].address },
        })),
      signUp: ({ name, phone, email, pin }) =>
        set({
          session: { name, phone, email, role: "household" },
          pin,
          onboarded: false,
          activeOwnerId: `self_${digits(phone)}`,
          profile: {
            name,
            phone,
            email,
            property: "",
            city: "Accra",
          },
          enabled: { ...allOff },
        }),
      signIn: (phone, pin) => {
        const state = get();
        const clean = digits(phone);
        const ops = clean === digits(OPS_PHONE) && pin === OPS_PIN;
        const demo = clean === digits(DEMO_PHONE) && pin === DEMO_PIN;
        const tenant = clean === digits(TENANT_PHONE) && pin === TENANT_PIN;
        const invite = state.ownerInvites.find(
          (item) => digits(item.phone) === clean && item.pin === pin,
        );
        const mine =
          digits(state.profile.phone || state.session?.phone || "") === clean &&
          pin === state.pin &&
          state.session?.role === "household";

        const suspended = (id: string) =>
          (state.opsAccounts[id]?.status ?? "active") === "suspended";

        if (!ops && !demo && !tenant && !invite && !mine) {
          return "Phone or PIN does not match.";
        }
        if ((demo || mine) && suspended("east-legon")) {
          return "This account is suspended. Contact support.";
        }
        if (invite && suspended(invite.id)) {
          return "This account is suspended. Contact support.";
        }

        if (tenant) {
          set({
            session: {
              role: "tenant",
              name: "Kojo Boateng",
              phone: "024 555 6677",
              email: "kojo.boateng@email.com",
              unitId: "u2",
              propertyId: "airport",
            },
            activePropertyId: "airport",
          });
          return null;
        }

        if (ops) {
          set({
            session: {
              name: "Kofi Asante",
              phone: "020 111 2233",
              email: "kofi.asante@ioteedom.com",
              role: "ops",
            },
            onboarded: true,
            profile: {
              name: "Kofi Asante",
              phone: "020 111 2233",
              email: "kofi.asante@ioteedom.com",
              property: "IoTeedom operations",
              city: "Accra",
            },
          });
          return null;
        }

        if (invite) {
          const modules = state.accountModules[invite.id] ?? invite.modules;
          set({
            session: {
              role: "household",
              name: invite.name,
              phone: invite.phone,
              email: invite.email,
            },
            pin: invite.pin,
            activeOwnerId: invite.id,
            onboarded: Boolean(state.onboardedByAccount[invite.id]),
            enabled: { ...modules },
            profile: {
              name: invite.name,
              phone: invite.phone,
              email: invite.email,
              property: invite.property,
              city: invite.city,
            },
          });
          return null;
        }

        if (demo) {
          const house = get().houses[get().activePropertyId];
          const modules = get().accountModules[AMA_OWNER_ID] ?? get().enabled;
          set({
            session: {
              name: "Ama Mensah",
              phone: "024 412 8891",
              email: "ama.mensah@email.com",
              role: "household",
            },
            profile: {
              name: "Ama Mensah",
              phone: "024 412 8891",
              email: "ama.mensah@email.com",
              property: get().onboardedByAccount[AMA_OWNER_ID]
                ? get().profile.property || house.address
                : get().profile.property || house.address,
              city: get().profile.city || "Accra",
            },
            pin: DEMO_PIN,
            activeOwnerId: AMA_OWNER_ID,
            enabled: { ...modules },
            onboarded: Boolean(get().onboardedByAccount[AMA_OWNER_ID] || get().onboarded),
          });
          return null;
        }

        set({
          session: {
            name: get().profile.name || "Ama Mensah",
            phone: get().profile.phone || phone,
            email: get().profile.email,
            role: "household",
          },
        });
        return null;
      },
      signOut: () => set({ session: null }),
      resetDemo: () =>
        set({
          ...structuredClone(initialState),
          houses: seedHouses(),
          platformPayments: seedPlatform(),
          hydrated: true,
        }),
      updateProfile: (input) =>
        set((state) => {
          const profile = {
            name: input.name.trim(),
            phone: input.phone.trim(),
            email: input.email.trim(),
            property: input.property.trim(),
            city: input.city.trim(),
          };
          const household = state.session?.role === "household";
          const id = state.activePropertyId;
          const house = state.houses[id];
          return {
            profile,
            session: state.session
              ? {
                  ...state.session,
                  name: profile.name,
                  phone: profile.phone,
                  email: profile.email,
                }
              : null,
            houses:
              household && house
                ? {
                    ...state.houses,
                    [id]: { ...house, address: profile.property },
                  }
                : state.houses,
          };
        }),
      completeOnboarding: ({ property, city, ecgAccount, waterAccount }) =>
        set((state) => {
          const east = state.houses["east-legon"];
          const ownerId = state.activeOwnerId || AMA_OWNER_ID;
          return {
            onboarded: true,
            onboardedByAccount: {
              ...state.onboardedByAccount,
              [ownerId]: true,
            },
            ownerInvites: state.ownerInvites.map((item) =>
              item.id === ownerId ? { ...item, status: "active" as const } : item,
            ),
            activePropertyId: "east-legon",
            profile: { ...state.profile, property, city },
            houses: {
              ...state.houses,
              "east-legon": {
                ...east,
                address: property,
                bills: {
                  ...east.bills,
                  ecg: {
                    ...east.bills.ecg,
                    account: ecgAccount || east.bills.ecg.account,
                  },
                  water: {
                    ...east.bills.water,
                    account: waterAccount || east.bills.water.account,
                  },
                },
              },
            },
          };
        }),
      setAccountModules: (accountId, modules) =>
        set((state) => {
          const ownerId = ownerAccountId(accountId);
          const nextModules = { ...modules };
          const signedIn = state.session?.role === "household" && state.activeOwnerId === ownerId;
          return {
            accountModules: { ...state.accountModules, [ownerId]: nextModules },
            ownerInvites: state.ownerInvites.map((item) =>
              item.id === ownerId ? { ...item, modules: nextModules } : item,
            ),
            opsAccounts: {
              ...state.opsAccounts,
              [ownerId]: {
                ...(state.opsAccounts[ownerId] ?? {}),
                modules: nextModules,
              },
            },
            enabled:
              (ownerId === AMA_OWNER_ID && state.session?.role === "household") || signedIn
                ? nextModules
                : state.enabled,
            opsActivityLog: [
              {
                id: `ops-log-${Date.now()}`,
                at: stamp(),
                actor: state.session?.name || "Operator",
                action: "modules_changed",
                accountId: ownerId,
                summary: `Updated modules for ${ownerId}`,
              },
              ...state.opsActivityLog,
            ],
          };
        }),
      inviteOwner: ({ name, phone, email, property, city, kind, modules }) => {
        const invite: OwnerInvite = {
          id: `own_${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          property: property.trim(),
          city: city.trim(),
          kind,
          modules: { ...modules },
          pin: String(1000 + Math.floor(Math.random() * 9000)),
          status: "invited",
          invitedAt: stamp(),
        };
        set((state) => ({
          ownerInvites: [invite, ...state.ownerInvites],
          accountModules: { ...state.accountModules, [invite.id]: { ...modules } },
          opsActivityLog: [
            {
              id: `ops-log-${Date.now()}`,
              at: stamp(),
              actor: state.session?.name || "Operator",
              action: "invited",
              accountId: invite.id,
              summary: `Invited ${invite.name} · ${namedModules(modules).join(", ") || "no modules"}`,
            },
            ...state.opsActivityLog,
          ],
        }));
        return invite;
      },
      toggleDevice: (id) => {
        const next = !get().devicesOn[id];
        const labels: Record<string, [string, string]> = {
          lock: ["Front lock — unlocked", "Front lock — locked"],
          ac: ["Lounge AC — off", `Lounge AC — ${get().acTemp}°C`],
          lights: ["Yard lights — off", "Yard lights — on"],
        };
        set((state) => ({
          devicesOn: { ...state.devicesOn, [id]: next },
          houseEvents: labels[id]
            ? [{ at: stamp(), text: labels[id][next ? 1 : 0] }, ...state.houseEvents]
            : state.houseEvents,
        }));
      },
      setAcTemp: (temp) => {
        const clamped = Math.min(30, Math.max(18, temp));
        set((state) => ({
          acTemp: clamped,
          devicesOn: { ...state.devicesOn, ac: true },
          houseEvents: [
            { at: stamp(), text: `Lounge AC — set to ${clamped}°C` },
            ...state.houseEvents,
          ],
        }));
      },
      payBill: (billId, amount, method) => {
        const house = activeHouse(get());
        const bill = house.bills[billId];
        const remitting = house.kind === "estate" && billId === "water";
        const payment: Payment = {
          id: `pmt_${Date.now()}_${billId}`,
          billId,
          label: remitting ? `Ghana Water · ${bill.cycle}` : `${bill.destination} · ${bill.cycle}`,
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          account: bill.account,
          propertyId: house.id,
          propertyLabel: house.label,
          payee: bill.destination,
          rail: bill.rail,
        };
        patchHouse(set, (current) => ({
          ...current,
          bills: {
            ...current.bills,
            [billId]: {
              ...current.bills[billId],
              due: Math.max(0, Number((current.bills[billId].due - amount).toFixed(2))),
            },
          },
          waterCollected: remitting
            ? Math.max(0, Number((current.waterCollected - amount).toFixed(2)))
            : current.waterCollected,
          payments: [payment, ...current.payments],
        }));
        set({ receipt: payment });
        return payment;
      },
      payAllDue: (method) => {
        const session = get().session;
        if (session?.role === "tenant") {
          const house = activeHouse(get());
          const unit = house.units.find((item) => item.id === session.unitId);
          const paid: Payment[] = [];
          if (unit && unit.ecgDue > 0) paid.push(get().payTenantEcg(session.unitId, method));
          if (unit && unit.waterDue > 0) {
            paid.push(get().collectTenantWater(session.unitId, method));
          }
          return paid;
        }
        const { enabled, payBill } = get();
        const house = activeHouse(get());
        return (Object.values(house.bills) as BillState[])
          .filter((bill) => {
            if (!enabled[bill.service] || bill.due <= 0) return false;
            if (house.kind === "estate" && bill.id === "ecg") return false;
            return true;
          })
          .map((bill) => payBill(bill.id, bill.due, method));
      },
      collectTenantWater: (unitId, method) => {
        const house = activeHouse(get());
        const unit = house.units.find((item) => item.id === unitId);
        if (!unit) {
          throw new Error("Unit not found");
        }
        const amount = unit.waterDue;
        const payment: Payment = {
          id: `pmt_${Date.now()}_${unitId}_water`,
          billId: "water",
          label: `${unit.name} · water to ${house.ownerName}`,
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          account: `${unit.name} · ${house.label}`,
          propertyId: house.id,
          propertyLabel: house.label,
          payee: house.ownerName,
          rail: "collect",
          unitId,
        };
        patchHouse(set, (current) => ({
          ...current,
          units: current.units.map((item) =>
            item.id === unitId ? { ...item, waterDue: 0 } : item,
          ),
          waterCollected: Number((current.waterCollected + amount).toFixed(2)),
          payments: [payment, ...current.payments],
        }));
        set({ receipt: payment });
        return payment;
      },
      payTenantEcg: (unitId, method) => {
        const house = activeHouse(get());
        const unit = house.units.find((item) => item.id === unitId);
        if (!unit) {
          throw new Error("Unit not found");
        }
        const amount = unit.ecgDue;
        const payment: Payment = {
          id: `pmt_${Date.now()}_${unitId}_ecg`,
          billId: "ecg",
          label: `${unit.name} · ECG`,
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          account: house.bills.ecg.account,
          propertyId: house.id,
          propertyLabel: house.label,
          payee: "ECG",
          rail: "direct",
          unitId,
        };
        patchHouse(set, (current) => ({
          ...current,
          units: current.units.map((item) => (item.id === unitId ? { ...item, ecgDue: 0 } : item)),
          payments: [payment, ...current.payments],
        }));
        set({ receipt: payment });
        return payment;
      },
      topUpEcg: (amount, method) => {
        const house = activeHouse(get());
        const payment: Payment = {
          id: `pmt_${Date.now()}_topup`,
          billId: "ecg",
          label: "ECG prepaid top-up",
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          account: house.bills.ecg.account,
          propertyId: house.id,
          propertyLabel: house.label,
          payee: "ECG",
          rail: "direct",
        };
        patchHouse(set, (current) => ({
          ...current,
          bills: {
            ...current.bills,
            ecg: {
              ...current.bills.ecg,
              credit: Number(((current.bills.ecg.credit ?? 0) + amount).toFixed(2)),
            },
          },
          payments: [payment, ...current.payments],
        }));
        set({ receipt: payment });
        return payment;
      },
      topUpWallet: (amount, method) => {
        const house = activeHouse(get());
        const payment: Payment = {
          id: `pmt_${Date.now()}_wallet`,
          billId: "wallet",
          label: "EV charge wallet",
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          propertyId: house.id,
          propertyLabel: house.label,
          payee: "EV wallet",
          rail: "direct",
        };
        patchHouse(set, (current) => ({
          ...current,
          wallet: Number((current.wallet + amount).toFixed(2)),
          payments: [payment, ...current.payments],
        }));
        set({ receipt: payment });
        return payment;
      },
      retryPayment: (id) => {
        let found: Payment | null = null;
        const houses = { ...get().houses };
        for (const key of Object.keys(houses) as PropertyId[]) {
          const house = houses[key];
          const payment = house.payments.find((item) => item.id === id);
          if (payment?.status !== "failed") continue;
          const next: Payment = {
            ...payment,
            status: "success",
            at: stamp(),
            ref: makeRef(),
          };
          found = next;
          const settled = settlePayment(house, payment, "apply");
          houses[key] = {
            ...settled,
            payments: house.payments.map((item) => (item.id === id ? next : item)),
          };
        }
        if (found) {
          set({ houses, receipt: found });
          return found;
        }
        const platform = get().platformPayments;
        const extra = platform.find((item) => item.id === id);
        if (extra?.status !== "failed") return null;
        const next: Payment = {
          ...extra,
          status: "success",
          at: stamp(),
          ref: makeRef(),
        };
        set({
          platformPayments: platform.map((item) => (item.id === id ? next : item)),
          receipt: next,
        });
        return next;
      },
      refundPayment: (id) => {
        let found: Payment | null = null;
        const houses = { ...get().houses };
        for (const key of Object.keys(houses) as PropertyId[]) {
          const house = houses[key];
          const payment = house.payments.find((item) => item.id === id);
          if (payment?.status !== "success") continue;
          const next: Payment = { ...payment, status: "refunded" };
          found = next;
          const settled = settlePayment(house, payment, "reverse");
          houses[key] = {
            ...settled,
            payments: house.payments.map((item) => (item.id === id ? next : item)),
          };
        }
        if (found) {
          set({ houses });
          return found;
        }
        const platform = get().platformPayments;
        const extra = platform.find((item) => item.id === id);
        if (extra?.status !== "success") return null;
        const next: Payment = { ...extra, status: "refunded" };
        set({
          platformPayments: platform.map((item) => (item.id === id ? next : item)),
        });
        return next;
      },
      dismissAlert: (id) =>
        patchHouse(set, (house) => ({
          ...house,
          dismissedAlerts: [...(house.dismissedAlerts ?? []), id],
        })),
      resolveLeak: () => {
        patchHouse(set, (house) => ({
          ...house,
          leakResolved: true,
          dismissedAlerts: (house.dismissedAlerts ?? []).includes("a1")
            ? (house.dismissedAlerts ?? [])
            : [...(house.dismissedAlerts ?? []), "a1"],
        }));
        set((state) => ({
          houseEvents: [
            { at: stamp(), text: "Leak watch cleared — spike marked resolved" },
            ...state.houseEvents,
          ],
        }));
      },
      requestReading: () =>
        set((state) => ({
          houseEvents: [
            { at: stamp(), text: "Water meter reading requested" },
            ...state.houseEvents,
          ],
        })),
      startCharge: (site) => {
        const online = chargerSites.find((s) => s.name === site)?.status === "online";
        if (!online) return "That charger is offline.";
        if (get().chargingSite) return "A session is already running.";
        if (activeHouse(get()).wallet < 10) return "Wallet is too low. Top up first.";
        set((state) => ({
          chargingSite: site,
          houseEvents: [{ at: stamp(), text: `Charging started at ${site}` }, ...state.houseEvents],
        }));
        return null;
      },
      stopCharge: () => {
        const site = get().chargingSite;
        if (!site) return null;
        const kwh = Number((8 + Math.random() * 12).toFixed(1));
        const amount = Number((kwh * 2).toFixed(2));
        const session: ChargeSession = {
          site,
          kwh,
          amount,
          at: stamp(),
          method: "mtn",
        };
        patchHouse(set, (current) => ({
          ...current,
          wallet: Number(Math.max(0, current.wallet - amount).toFixed(2)),
        }));
        set((state) => ({
          chargingSite: null,
          batteryPct: Math.min(100, state.batteryPct + Math.round(kwh * 1.2)),
          sessions: [session, ...state.sessions],
          houseEvents: [
            { at: stamp(), text: `Charging stopped at ${site} · ${kwh} kWh` },
            ...state.houseEvents,
          ],
        }));
        return session;
      },
      toggleSolarExport: () =>
        set((state) => ({
          solarExport: !state.solarExport,
          houseEvents: [
            {
              at: stamp(),
              text: state.solarExport ? "Solar export to grid — off" : "Solar export to grid — on",
            },
            ...state.houseEvents,
          ],
        })),
      updateOpsAccount: (id, patch) =>
        set((state) => ({
          opsAccounts: {
            ...state.opsAccounts,
            [id]: {
              ...(state.opsAccounts[id] ?? {}),
              ...patch,
            },
          },
          opsActivityLog: [
            {
              id: `ops-log-${Date.now()}`,
              at: stamp(),
              actor: state.session?.name || "Operator",
              action: "account_updated",
              accountId: id,
              summary: `Updated account fields for ${id}`,
            },
            ...state.opsActivityLog,
          ],
        })),
      toggleOpsAccountStatus: (id) =>
        set((state) => {
          const current = state.opsAccounts[id]?.status ?? "active";
          const next = current === "active" ? "suspended" : "active";
          return {
            opsAccounts: {
              ...state.opsAccounts,
              [id]: {
                ...(state.opsAccounts[id] ?? {}),
                status: next,
              },
            },
            opsActivityLog: [
              {
                id: `ops-log-${Date.now()}`,
                at: stamp(),
                actor: state.session?.name || "Operator",
                action: "status_changed",
                accountId: id,
                summary: `${next === "suspended" ? "Suspended" : "Activated"} account ${id}`,
              },
              ...state.opsActivityLog,
            ],
          };
        }),
      logOpsActivity: ({ actor, action, accountId, summary }) =>
        set((state) => ({
          opsActivityLog: [
            {
              id: `ops-log-${Date.now()}`,
              at: stamp(),
              actor: actor || state.session?.name || "Operator",
              action,
              accountId,
              summary,
            },
            ...state.opsActivityLog,
          ],
        })),
      logEvent: (text) =>
        set((state) => ({
          houseEvents: [{ at: stamp(), text }, ...state.houseEvents],
        })),
      findPayment: (ref) =>
        [
          ...Object.values(get().houses).flatMap((house) => house.payments),
          ...get().platformPayments,
        ].find((item) => item.ref === ref),
      allPayments: () =>
        [
          ...Object.values(get().houses).flatMap((house) => house.payments),
          ...get().platformPayments,
        ].sort((a, b) => (a.at < b.at ? 1 : -1)),
    }),
    {
      name: "ioteedom-demo-v6",
      version: 8,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<Store>;
        return {
          ...currentState,
          ...persisted,
          houses: normalizeHouses(persisted.houses ?? currentState.houses),
          opsAccounts: persisted.opsAccounts ?? currentState.opsAccounts,
          opsActivityLog: persisted.opsActivityLog ?? currentState.opsActivityLog,
          ownerInvites: persisted.ownerInvites ?? currentState.ownerInvites,
          accountModules: persisted.accountModules ?? currentState.accountModules,
          onboardedByAccount: persisted.onboardedByAccount ?? currentState.onboardedByAccount,
          activeOwnerId: persisted.activeOwnerId ?? currentState.activeOwnerId,
        };
      },
      partialize: (state) => ({
        session: state.session,
        pin: state.pin,
        onboarded: state.onboarded,
        profile: state.profile,
        enabled: state.enabled,
        houses: state.houses,
        activePropertyId: state.activePropertyId,
        platformPayments: state.platformPayments,
        devicesOn: state.devicesOn,
        acTemp: state.acTemp,
        batteryPct: state.batteryPct,
        chargingSite: state.chargingSite,
        sessions: state.sessions,
        houseEvents: state.houseEvents,
        solarExport: state.solarExport,
        opsAccounts: state.opsAccounts,
        opsActivityLog: state.opsActivityLog,
        ownerInvites: state.ownerInvites,
        accountModules: state.accountModules,
        onboardedByAccount: state.onboardedByAccount,
        activeOwnerId: state.activeOwnerId,
      }),
      onRehydrateStorage: () => () => {
        useDemoStore.getState().markHydrated();
      },
    },
  ),
);

export function useActiveHouse() {
  const houses = useDemoStore((s) => s.houses);
  const id = useDemoStore((s) => s.activePropertyId);
  const house = houses[id] ?? houses["east-legon"];
  if (house?.alerts && house.dismissedAlerts && house.usage) return house;
  return normalizeHouses(houses)[id] ?? normalizeHouses(houses)["east-legon"];
}

export function useEnabled() {
  const role = useDemoStore((s) => s.session?.role);
  const enabled = useDemoStore((s) => s.enabled);
  if (role !== "tenant") return enabled;
  return {
    ...tenantEnabled,
    ecg: enabled.ecg,
    water: enabled.water,
    meters: enabled.meters,
  };
}

export function useTenantUnit() {
  const session = useDemoStore((s) => s.session);
  const house = useActiveHouse();
  if (session?.role !== "tenant") return null;
  return house.units.find((unit) => unit.id === session.unitId) ?? null;
}
