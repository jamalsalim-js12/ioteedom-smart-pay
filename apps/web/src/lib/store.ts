"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type BillId,
  type PaymentMethod,
  type PaymentStatus,
  type PropertyId,
  type ServiceId,
  airportBills,
  airportPayments,
  airportUnits,
  airportAlerts,
  airportUsage,
  alerts,
  chargerSites,
  evSessions,
  evVehicle,
  homeEvents,
  initialBills,
  monthlyUsage,
  seedPayments,
  type EstateUnit,
  type HouseAlert,
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
};

export type Role = "household" | "ops";

export type Session = {
  name: string;
  phone: string;
  email: string;
  role: Role;
};

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
};

export type BillState = (typeof initialBills)[BillId];

export type HouseState = {
  id: PropertyId;
  label: string;
  address: string;
  kind: "home" | "estate";
  lastSeen: string;
  units: EstateUnit[];
  bills: Record<BillId, BillState>;
  payments: Payment[];
  wallet: number;
  usage: UsageMonth[];
  alerts: HouseAlert[];
  leakResolved: boolean;
  dismissedAlerts: string[];
};

export function openAmount(house: HouseState) {
  return (Object.values(house.bills) as BillState[]).reduce(
    (sum, bill) => sum + bill.due,
    0,
  );
}

export const DEMO_PHONE = "0244128891";
export const DEMO_PIN = "2468";
export const OPS_PHONE = "0201112233";
export const OPS_PIN = "1357";

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
  }[],
  propertyId: PropertyId,
  bills: Record<BillId, BillState>,
): Payment[] {
  return list.map((item) => ({
    ...item,
    propertyId,
    account: bills[item.billId]?.account,
  }));
}

function seedHouses(): Record<PropertyId, HouseState> {
  return {
    "east-legon": {
      id: "east-legon",
      label: "East Legon",
      address: "12 Boundary Rd, East Legon",
      kind: "home",
      lastSeen: "18 Aug, 21:14",
      units: [],
      bills: structuredClone(initialBills),
      payments: withProperty(seedPayments, "east-legon", structuredClone(initialBills)),
      wallet: evVehicle.wallet,
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
      lastSeen: "18 Aug, 09:02",
      units: structuredClone(airportUnits),
      bills: structuredClone(airportBills),
      payments: withProperty(airportPayments, "airport", structuredClone(airportBills)),
      wallet: 420,
      usage: structuredClone(airportUsage),
      alerts: structuredClone(airportAlerts),
      leakResolved: true,
      dismissedAlerts: [],
    },
  };
}

function withHouseDefaults(
  house: Partial<HouseState> | undefined,
  seed: HouseState,
): HouseState {
  return {
    ...seed,
    ...house,
    units: house?.units ?? seed.units,
    bills: house?.bills ?? seed.bills,
    payments: house?.payments ?? seed.payments,
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
    enabled: Record<ServiceId, boolean>;
    ecgAccount?: string;
    waterAccount?: string;
  }) => void;
  updateProfile: (input: Profile) => void;
  toggleService: (id: ServiceId) => void;
  toggleDevice: (id: string) => void;
  setAcTemp: (temp: number) => void;
  payBill: (billId: BillId, amount: number, method: PaymentMethod) => Payment;
  payAllDue: (method: PaymentMethod) => Payment[];
  payUnit: (unitId: string, method: PaymentMethod) => Payment;
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
  enabled: { ...allOff },
  houses: seedHouses(),
  activePropertyId: "east-legon" as PropertyId,
  platformPayments: structuredClone(seedPlatformPayments) as Payment[],
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
};

function activeHouse(state: { houses: Record<PropertyId, HouseState>; activePropertyId: PropertyId }) {
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
        const clean = digits(phone);
        const ops = clean === digits(OPS_PHONE) && pin === OPS_PIN;
        const demo = clean === digits(DEMO_PHONE) && pin === DEMO_PIN;
        const mine =
          digits(get().profile.phone || get().session?.phone || "") === clean &&
          pin === get().pin &&
          get().session?.role !== "ops";

        if (!ops && !demo && !mine) return "Phone or PIN does not match.";

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

        if (demo && (!get().session || get().session?.role === "ops")) {
          const house = get().houses[get().activePropertyId];
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
              property: get().onboarded
                ? get().profile.property || house.address
                : get().profile.property,
              city: get().profile.city || "Accra",
            },
            pin: DEMO_PIN,
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
          platformPayments: structuredClone(seedPlatformPayments) as Payment[],
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
          const household = state.session?.role !== "ops";
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
      completeOnboarding: ({
        property,
        city,
        enabled,
        ecgAccount,
        waterAccount,
      }) =>
        set((state) => {
          const east = state.houses["east-legon"];
          return {
            onboarded: true,
            enabled,
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
      toggleService: (id) =>
        set((state) => ({
          enabled: { ...state.enabled, [id]: !state.enabled[id] },
        })),
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
            ? [
                { at: stamp(), text: labels[id][next ? 1 : 0] },
                ...state.houseEvents,
              ]
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
        const payment: Payment = {
          id: `pmt_${Date.now()}_${billId}`,
          billId,
          label: `${bill.provider} · ${bill.cycle}`,
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          account: bill.account,
          propertyId: house.id,
          propertyLabel: house.label,
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
          payments: [payment, ...current.payments],
        }));
        set({ receipt: payment });
        return payment;
      },
      payAllDue: (method) => {
        const { enabled, payBill } = get();
        const house = activeHouse(get());
        const paid = (Object.values(house.bills) as BillState[])
          .filter((bill) => enabled[bill.service] && bill.due > 0)
          .map((bill) => payBill(bill.id, bill.due, method));
        if (house.kind === "estate") {
          patchHouse(set, (current) => ({
            ...current,
            units: current.units.map((unit) => ({
              ...unit,
              ecgDue: 0,
              waterDue: 0,
            })),
          }));
        }
        return paid;
      },
      payUnit: (unitId, method) => {
        const house = activeHouse(get());
        const unit = house.units.find((item) => item.id === unitId);
        if (!unit) {
          throw new Error("Unit not found");
        }
        const amount = Number((unit.ecgDue + unit.waterDue).toFixed(2));
        const payment: Payment = {
          id: `pmt_${Date.now()}_${unitId}`,
          billId: "ecg",
          label: `${unit.name} · ECG + water`,
          amount,
          method,
          status: "success",
          at: stamp(),
          ref: makeRef(),
          account: house.bills.ecg.account,
          propertyId: house.id,
          propertyLabel: house.label,
        };
        patchHouse(set, (current) => ({
          ...current,
          units: current.units.map((item) =>
            item.id === unitId ? { ...item, ecgDue: 0, waterDue: 0 } : item,
          ),
          bills: {
            ...current.bills,
            ecg: {
              ...current.bills.ecg,
              due: Math.max(0, Number((current.bills.ecg.due - unit.ecgDue).toFixed(2))),
            },
            water: {
              ...current.bills.water,
              due: Math.max(0, Number((current.bills.water.due - unit.waterDue).toFixed(2))),
            },
          },
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
          if (!payment || payment.status !== "failed") continue;
          const next: Payment = {
            ...payment,
            status: "success",
            at: stamp(),
            ref: makeRef(),
          };
          found = next;
          const topUp = /top-?up/i.test(payment.label);
          let bills = house.bills;
          let wallet = house.wallet;
          if (payment.billId === "wallet") {
            wallet = Number((house.wallet + payment.amount).toFixed(2));
          } else if (topUp && payment.billId === "ecg") {
            bills = {
              ...house.bills,
              ecg: {
                ...house.bills.ecg,
                credit: Number(
                  ((house.bills.ecg.credit ?? 0) + payment.amount).toFixed(2),
                ),
              },
            };
          } else {
            const bill = house.bills[payment.billId];
            bills = {
              ...house.bills,
              [payment.billId]: {
                ...bill,
                due: Math.max(0, Number((bill.due - payment.amount).toFixed(2))),
              },
            };
          }
          houses[key] = {
            ...house,
            bills,
            wallet,
            payments: house.payments.map((item) => (item.id === id ? next : item)),
          };
        }
        if (found) {
          set({ houses, receipt: found });
          return found;
        }
        const platform = get().platformPayments;
        const extra = platform.find((item) => item.id === id);
        if (!extra || extra.status !== "failed") return null;
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
          if (!payment || payment.status !== "success") continue;
          const next: Payment = { ...payment, status: "refunded" };
          found = next;
          const topUp = /top-?up/i.test(payment.label);
          const bills = { ...house.bills };
          let wallet = house.wallet;
          if (payment.billId === "wallet") {
            wallet = Number(Math.max(0, house.wallet - payment.amount).toFixed(2));
          } else if (topUp && payment.billId === "ecg") {
            bills.ecg = {
              ...bills.ecg,
              credit: Number(
                Math.max(0, (bills.ecg.credit ?? 0) - payment.amount).toFixed(2),
              ),
            };
          } else {
            const bill = bills[payment.billId];
            bills[payment.billId] = {
              ...bill,
              due: Number((bill.due + payment.amount).toFixed(2)),
            };
          }
          houses[key] = {
            ...house,
            bills,
            wallet,
            payments: house.payments.map((item) => (item.id === id ? next : item)),
          };
        }
        if (found) {
          set({ houses });
          return found;
        }
        const platform = get().platformPayments;
        const extra = platform.find((item) => item.id === id);
        if (!extra || extra.status !== "success") return null;
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
          houseEvents: [
            { at: stamp(), text: `Charging started at ${site}` },
            ...state.houseEvents,
          ],
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
              text: state.solarExport
                ? "Solar export to grid — off"
                : "Solar export to grid — on",
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
        })),
      toggleOpsAccountStatus: (id) =>
        set((state) => {
          const current = state.opsAccounts[id]?.status ?? "active";
          return {
            opsAccounts: {
              ...state.opsAccounts,
              [id]: {
                ...(state.opsAccounts[id] ?? {}),
                status: current === "active" ? "suspended" : "active",
              },
            },
          };
        }),
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
      name: "ioteedom-demo-v4",
      version: 5,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<Store>;
        return {
          ...currentState,
          ...persisted,
          houses: normalizeHouses(persisted.houses ?? currentState.houses),
          opsAccounts: persisted.opsAccounts ?? currentState.opsAccounts,
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
