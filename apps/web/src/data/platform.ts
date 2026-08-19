import type { BillId, PaymentMethod, PaymentStatus } from "@/data/demo";

export type PlatformIncident = {
  id: string;
  tone: "warn" | "info" | "ok";
  kind: "leak" | "charger" | "payment" | "credit";
  title: string;
  body: string;
  account: string;
  href: string;
  at: string;
};

export type PlatformAccount = {
  id: string;
  name: string;
  phone: string;
  kind: "home" | "estate";
  property: string;
  city: string;
  lastSeen: string;
  open: number;
  units?: number;
  modules: string[];
  note: string;
};

export type PlatformPayment = {
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
  propertyLabel: string;
};

export type PlatformCharger = {
  name: string;
  area: string;
  status: "online" | "offline";
  connectors: number;
  sessionsToday: number;
  collectedToday: number;
  lastSession: string;
  lng: number;
  lat: number;
};

export const platformAccounts: PlatformAccount[] = [
  {
    id: "cantonments",
    name: "Kwame Boateng",
    phone: "024 771 0042",
    kind: "home",
    property: "14 Fifth Ave, Cantonments",
    city: "Accra",
    lastSeen: "18 Aug, 20:41",
    open: 312.4,
    modules: ["ECG", "Water"],
    note: "Postpaid ECG. No leak flags this cycle.",
  },
  {
    id: "labone",
    name: "Abena Owusu",
    phone: "027 330 9188",
    kind: "home",
    property: "7 Osu Badu St, Labone",
    city: "Accra",
    lastSeen: "18 Aug, 16:02",
    open: 0,
    modules: ["ECG", "Water", "EV"],
    note: "Cycle is clear. EV wallet last topped up this evening.",
  },
  {
    id: "spintex-court",
    name: "Spintex Court Ltd",
    phone: "030 276 4410",
    kind: "estate",
    property: "Spintex Court, 12 units",
    city: "Accra",
    lastSeen: "18 Aug, 11:18",
    open: 4210,
    units: 12,
    modules: ["ECG", "Water", "Waste"],
    note: "Combined estate docket. Unit 4 is the heaviest ECG this cycle.",
  },
  {
    id: "tema",
    name: "Nii Armah",
    phone: "026 104 8890",
    kind: "home",
    property: "C25, Community 25, Tema",
    city: "Tema",
    lastSeen: "17 Aug, 22:09",
    open: 88.5,
    modules: ["ECG", "Water"],
    note: "Small water remainder. Meter last seen yesterday.",
  },
  {
    id: "osu",
    name: "Efua Mensimah",
    phone: "024 908 2211",
    kind: "home",
    property: "Oxford St, Osu",
    city: "Accra",
    lastSeen: "18 Aug, 19:55",
    open: 640.0,
    modules: ["ECG", "Water"],
    note: "Prepaid top-up failed on AT Money tonight. ECG still open.",
  },
  {
    id: "madina",
    name: "Yaw Sarpong",
    phone: "020 445 7781",
    kind: "home",
    property: "Atomic Rd, Madina",
    city: "Accra",
    lastSeen: "16 Aug, 08:14",
    open: 195.2,
    modules: ["ECG", "Water"],
    note: "GWCL Jul still pending on the rail.",
  },
];

export const platformPayments: PlatformPayment[] = [
  {
    id: "plt_01",
    billId: "ecg",
    label: "ECG · Jul cycle",
    amount: 268.4,
    method: "mtn",
    status: "success",
    at: "18 Aug 2026, 07:12",
    ref: "SP-221041",
    account: "CANT-ECG-14",
    propertyId: "cantonments",
    propertyLabel: "Cantonments",
  },
  {
    id: "plt_02",
    billId: "water",
    label: "GWCL · Jul cycle",
    amount: 94.0,
    method: "telecel",
    status: "success",
    at: "18 Aug 2026, 07:18",
    ref: "SP-221088",
    account: "CANT-W-14",
    propertyId: "cantonments",
    propertyLabel: "Cantonments",
  },
  {
    id: "plt_03",
    billId: "ecg",
    label: "ECG · estate Jul",
    amount: 3180,
    method: "mtn",
    status: "success",
    at: "17 Aug 2026, 10:02",
    ref: "SP-220410",
    account: "SPX-ECG-12",
    propertyId: "spintex-court",
    propertyLabel: "Spintex Court",
  },
  {
    id: "plt_04",
    billId: "ecg",
    label: "ECG prepaid top-up",
    amount: 50,
    method: "at",
    status: "failed",
    at: "18 Aug 2026, 21:06",
    ref: "SP-221440",
    account: "OSU-ECG-09",
    propertyId: "osu",
    propertyLabel: "Osu",
  },
  {
    id: "plt_05",
    billId: "wallet",
    label: "EV charge wallet",
    amount: 80,
    method: "mtn",
    status: "success",
    at: "18 Aug 2026, 18:22",
    ref: "SP-221902",
    propertyId: "labone",
    propertyLabel: "Labone",
  },
  {
    id: "plt_06",
    billId: "water",
    label: "GWCL · Jul cycle",
    amount: 142,
    method: "mtn",
    status: "pending",
    at: "18 Aug 2026, 22:01",
    ref: "SP-221991",
    account: "MAD-W-02",
    propertyId: "madina",
    propertyLabel: "Madina",
  },
  {
    id: "plt_07",
    billId: "ecg",
    label: "ECG · Jul cycle",
    amount: 410.2,
    method: "telecel",
    status: "success",
    at: "15 Aug 2026, 09:44",
    ref: "SP-218204",
    account: "TEMA-ECG-25",
    propertyId: "tema",
    propertyLabel: "Tema C25",
  },
];

export const platformChargers: PlatformCharger[] = [
  {
    name: "Airport City",
    area: "Airport",
    status: "online",
    connectors: 4,
    sessionsToday: 11,
    collectedToday: 214.8,
    lastSession: "18 Aug, 21:04",
    lng: -0.1769,
    lat: 5.6052,
  },
  {
    name: "East Legon — Shell",
    area: "East Legon",
    status: "online",
    connectors: 2,
    sessionsToday: 6,
    collectedToday: 98.4,
    lastSession: "18 Aug, 19:41",
    lng: -0.1575,
    lat: 5.6388,
  },
  {
    name: "Accra Mall",
    area: "Tetteh Quarshie",
    status: "offline",
    connectors: 2,
    sessionsToday: 0,
    collectedToday: 0,
    lastSession: "16 Aug, 14:12",
    lng: -0.175,
    lat: 5.6504,
  },
  {
    name: "Osu Oxford",
    area: "Osu",
    status: "online",
    connectors: 2,
    sessionsToday: 8,
    collectedToday: 156.0,
    lastSession: "18 Aug, 20:18",
    lng: -0.182,
    lat: 5.556,
  },
  {
    name: "Spintex Road",
    area: "Spintex",
    status: "online",
    connectors: 4,
    sessionsToday: 9,
    collectedToday: 188.2,
    lastSession: "18 Aug, 21:31",
    lng: -0.127,
    lat: 5.637,
  },
];

export const platformIncidents: PlatformIncident[] = [
  {
    id: "inc_mall",
    tone: "warn",
    kind: "charger",
    title: "Accra Mall charger offline",
    body: "Both connectors dark since 16 Aug. No sessions today.",
    account: "EV network",
    href: "/admin/chargers/accra-mall",
    at: "16 Aug, 14:12",
  },
  {
    id: "inc_osu",
    tone: "warn",
    kind: "payment",
    title: "Failed ECG top-up · Osu",
    body: "Efua Mensimah, GH₵50 via AT Money. Ref SP-221440.",
    account: "Efua Mensimah",
    href: "/admin/payments/plt_04",
    at: "18 Aug, 21:06",
  },
  {
    id: "inc_spintex",
    tone: "info",
    kind: "credit",
    title: "Spintex Court still open",
    body: "12 units, GH₵4,210 on the combined docket.",
    account: "Spintex Court Ltd",
    href: "/admin/accounts/spintex-court",
    at: "18 Aug, 11:18",
  },
  {
    id: "inc_madina",
    tone: "info",
    kind: "payment",
    title: "Madina water still pending",
    body: "GWCL GH₵142 sitting on the rail since 22:01.",
    account: "Yaw Sarpong",
    href: "/admin/payments/plt_06",
    at: "18 Aug, 22:01",
  },
];
