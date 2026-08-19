export type ServiceId =
  | "ecg"
  | "water"
  | "utilities"
  | "meters"
  | "smartHome"
  | "solar"
  | "ev";

export type PaymentMethod = "mtn" | "telecel" | "at";

export type PaymentStatus = "success" | "pending" | "failed" | "refunded";

export type PropertyId = "east-legon" | "airport";

export type EstateUnit = {
  id: string;
  name: string;
  ecgDue: number;
  waterDue: number;
};

export type BillId = "ecg" | "water" | "waste" | "internet";

export const profile = {
  name: "Ama Mensah",
  phone: "024 412 8891",
  email: "ama.mensah@email.com",
  property: "12 Boundary Rd, East Legon",
  city: "Accra",
};

export const serviceCatalog: {
  id: ServiceId;
  name: string;
  blurb: string;
  href: string;
}[] = [
  {
    id: "ecg",
    name: "ECG",
    blurb: "Pay power bills and watch prepaid credit.",
    href: "/bills",
  },
  {
    id: "water",
    name: "Water",
    blurb: "Ghana Water bills on the same account.",
    href: "/bills",
  },
  {
    id: "utilities",
    name: "Other utilities",
    blurb: "Waste, internet, and anything we add later.",
    href: "/bills",
  },
  {
    id: "meters",
    name: "Water meters",
    blurb: "Readings, usage, leak alerts.",
    href: "/meters",
  },
  {
    id: "smartHome",
    name: "Smart home",
    blurb: "Devices, sensors, and a history you can look back on.",
    href: "/smart-home",
  },
  {
    id: "solar",
    name: "Solar",
    blurb: "Production against what the house is using.",
    href: "/solar",
  },
  {
    id: "ev",
    name: "EV",
    blurb: "Vehicle, wallet, and charging history.",
    href: "/ev",
  },
];

export const defaultEnabled: Record<ServiceId, boolean> = {
  ecg: true,
  water: true,
  utilities: true,
  meters: true,
  smartHome: true,
  solar: true,
  ev: true,
};

export const paymentMethods: {
  id: PaymentMethod;
  name: string;
  short: string;
}[] = [
  { id: "mtn", name: "MTN MoMo", short: "MTN" },
  { id: "telecel", name: "Telecel Cash", short: "Telecel" },
  { id: "at", name: "AT Money", short: "AT" },
];

export const initialBills: Record<
  BillId,
  {
    id: BillId;
    label: string;
    provider: string;
    account: string;
    meter?: string;
    due: number;
    credit?: number;
    dueDate: string;
    cycle: string;
    service: ServiceId;
  }
> = {
  ecg: {
    id: "ecg",
    label: "Electricity",
    provider: "ECG",
    account: "5418 2291 03",
    meter: "GE-8842196",
    due: 486.2,
    credit: 42.1,
    dueDate: "22 Aug 2026",
    cycle: "Jul 2026",
    service: "ecg",
  },
  water: {
    id: "water",
    label: "Water",
    provider: "GWCL",
    account: "W-ACC-209441",
    meter: "WM-110384",
    due: 127.5,
    dueDate: "20 Aug 2026",
    cycle: "Jul 2026",
    service: "water",
  },
  waste: {
    id: "waste",
    label: "Waste",
    provider: "Zoomlion",
    account: "ZL-EL-4412",
    due: 45,
    dueDate: "28 Aug 2026",
    cycle: "Aug 2026",
    service: "utilities",
  },
  internet: {
    id: "internet",
    label: "Fibre",
    provider: "Telecel Home",
    account: "TH-992018",
    due: 299,
    dueDate: "15 Aug 2026",
    cycle: "Aug 2026",
    service: "utilities",
  },
};

export const seedPayments: {
  id: string;
  billId: BillId;
  label: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  at: string;
  ref: string;
}[] = [
  {
    id: "pmt_01",
    billId: "ecg",
    label: "ECG · Jun cycle",
    amount: 412.8,
    method: "mtn",
    status: "success",
    at: "12 Jul 2026, 19:14",
    ref: "SP-184201",
  },
  {
    id: "pmt_02",
    billId: "water",
    label: "GWCL · Jun cycle",
    amount: 118.0,
    method: "telecel",
    status: "success",
    at: "11 Jul 2026, 08:02",
    ref: "SP-183944",
  },
  {
    id: "pmt_03",
    billId: "internet",
    label: "Telecel Home",
    amount: 299.0,
    method: "mtn",
    status: "success",
    at: "14 Aug 2026, 07:41",
    ref: "SP-190112",
  },
  {
    id: "pmt_04",
    billId: "ecg",
    label: "ECG prepaid top-up",
    amount: 50.0,
    method: "at",
    status: "failed",
    at: "3 Aug 2026, 21:06",
    ref: "SP-189440",
  },
];

export type UsageMonth = {
  month: string;
  kwh: number;
  water: number;
  spend: number;
};

export type HouseAlert = {
  id: string;
  tone: "warn" | "info" | "ok";
  service: ServiceId;
  title: string;
  body: string;
};

export const monthlyUsage: UsageMonth[] = [
  { month: "Mar", kwh: 318, water: 14.2, spend: 410 },
  { month: "Apr", kwh: 341, water: 15.8, spend: 448 },
  { month: "May", kwh: 366, water: 16.1, spend: 502 },
  { month: "Jun", kwh: 389, water: 17.4, spend: 531 },
  { month: "Jul", kwh: 412, water: 18.6, spend: 586 },
  { month: "Aug", kwh: 278, water: 12.1, spend: 361 },
];

export const airportUsage: UsageMonth[] = [
  { month: "Mar", kwh: 1420, water: 61.4, spend: 2140 },
  { month: "Apr", kwh: 1518, water: 64.8, spend: 2288 },
  { month: "May", kwh: 1602, water: 67.1, spend: 2410 },
  { month: "Jun", kwh: 1714, water: 72.6, spend: 2588 },
  { month: "Jul", kwh: 1840, water: 78.2, spend: 2790 },
  { month: "Aug", kwh: 1124, water: 49.6, spend: 1688 },
];

export const spendMix = [
  { name: "ECG", value: 486.2, color: "var(--color-live)" },
  { name: "Water", value: 127.5, color: "var(--color-water)" },
  { name: "Fibre", value: 299, color: "var(--color-brass)" },
  { name: "Waste", value: 45, color: "var(--color-grid)" },
];

export const meterDaily = [
  { day: "12", m3: 0.48, note: null },
  { day: "13", m3: 0.52, note: null },
  { day: "14", m3: 0.44, note: null },
  { day: "15", m3: 1.92, note: "spike" as const },
  { day: "16", m3: 0.51, note: null },
  { day: "17", m3: 0.47, note: null },
  { day: "18", m3: 0.39, note: null },
];

export const meter = {
  id: "WM-110384",
  location: "Yard, east wall",
  reading: 1842.6,
  unit: "m³",
  lastSeen: "18 Aug, 06:12",
  status: "leak-watch" as const,
};

export const solarSeries = [
  { hour: "06", produce: 0.4, use: 1.1 },
  { hour: "08", produce: 2.8, use: 1.6 },
  { hour: "10", produce: 4.6, use: 2.1 },
  { hour: "12", produce: 5.1, use: 2.4 },
  { hour: "14", produce: 4.4, use: 2.8 },
  { hour: "16", produce: 2.6, use: 3.2 },
  { hour: "18", produce: 0.7, use: 3.8 },
  { hour: "20", produce: 0, use: 2.9 },
];

export const solarSite = {
  inverter: "Growatt MIN 5000",
  capacityKw: 5,
  todayKwh: 18.4,
  usedKwh: 21.2,
  batteryPct: 62,
  gridImportKwh: 2.8,
};

export const evVehicle = {
  model: "BYD Atto 3",
  plate: "GR 3842-24",
  batteryPct: 71,
  rangeKm: 248,
  wallet: 186.4,
};

export const evWeekly = [
  { week: "W10", kwh: 42, ghs: 84 },
  { week: "W11", kwh: 38, ghs: 76 },
  { week: "W12", kwh: 51, ghs: 102 },
  { week: "W13", kwh: 29, ghs: 58 },
  { week: "W14", kwh: 47, ghs: 94 },
];

export const chargerSites = [
  {
    name: "Airport City",
    status: "online" as const,
    connectors: 4,
    lastSession: "GHS 38.00 · 19 kWh",
    lng: -0.1769,
    lat: 5.6052,
  },
  {
    name: "East Legon — Shell",
    status: "online" as const,
    connectors: 2,
    lastSession: "GHS 24.50 · 12 kWh",
    lng: -0.1575,
    lat: 5.6388,
  },
  {
    name: "Accra Mall",
    status: "offline" as const,
    connectors: 2,
    lastSession: "GHS 0.00",
    lng: -0.175,
    lat: 5.6504,
  },
];

export const airportBills: typeof initialBills = {
  ecg: {
    ...initialBills.ecg,
    account: "EST-ECG-8801",
    meter: "GE-EST-4401",
    due: 1840,
    credit: 120,
    dueDate: "28 Aug 2026",
    cycle: "Jul 2026",
  },
  water: {
    ...initialBills.water,
    account: "EST-W-8801",
    meter: "WM-EST-4401",
    due: 490,
    dueDate: "18 Aug 2026",
  },
  waste: {
    ...initialBills.waste,
    account: "ZL-AR-12",
    due: 180,
  },
  internet: {
    ...initialBills.internet,
    account: "TH-EST-18",
    due: 0,
  },
};

export const airportUnits: EstateUnit[] = [
  { id: "u1", name: "Unit 1", ecgDue: 420, waterDue: 110 },
  { id: "u2", name: "Unit 2", ecgDue: 510, waterDue: 128 },
  { id: "u3", name: "Unit 3", ecgDue: 390, waterDue: 98 },
  { id: "u4", name: "Unit 4", ecgDue: 520, waterDue: 154 },
];

export const airportPayments: typeof seedPayments = [
  {
    id: "pmt_ar_01",
    billId: "ecg",
    label: "ECG · estate Jun",
    amount: 1620,
    method: "mtn",
    status: "success",
    at: "10 Jul 2026, 11:02",
    ref: "SP-201104",
  },
  {
    id: "pmt_ar_02",
    billId: "water",
    label: "GWCL · estate Jun",
    amount: 440,
    method: "telecel",
    status: "success",
    at: "10 Jul 2026, 11:08",
    ref: "SP-201188",
  },
  {
    id: "pmt_ar_03",
    billId: "ecg",
    label: "ECG prepaid top-up · Unit 2",
    amount: 80,
    method: "mtn",
    status: "failed",
    at: "16 Aug 2026, 06:41",
    ref: "SP-208440",
  },
];

export const evSessions = [
  {
    site: "Airport City",
    kwh: 19.2,
    amount: 38.4,
    at: "16 Aug, 18:22",
    method: "mtn" as PaymentMethod,
  },
  {
    site: "East Legon — Shell",
    kwh: 12.1,
    amount: 24.2,
    at: "11 Aug, 07:48",
    method: "mtn" as PaymentMethod,
  },
  {
    site: "Airport City",
    kwh: 22.0,
    amount: 44.0,
    at: "4 Aug, 19:03",
    method: "telecel" as PaymentMethod,
  },
];

export const roomsEnergy = [
  { room: "Lounge", kwh: 4.2 },
  { room: "Kitchen", kwh: 6.1 },
  { room: "Rooms", kwh: 3.4 },
  { room: "Yard", kwh: 1.1 },
];

export const temperatureLog = [
  { hour: "00", temp: 26.1, co2: 640 },
  { hour: "04", temp: 25.4, co2: 580 },
  { hour: "08", temp: 27.2, co2: 820 },
  { hour: "12", temp: 29.4, co2: 910 },
  { hour: "16", temp: 30.1, co2: 870 },
  { hour: "20", temp: 28.0, co2: 760 },
];

export const devices = [
  { id: "lock", name: "Front lock", room: "Entry", kind: "lock", on: true, detail: "Locked" },
  { id: "ac", name: "Lounge AC", room: "Lounge", kind: "climate", on: true, detail: "24°C" },
  { id: "lights", name: "Yard lights", room: "Yard", kind: "light", on: false, detail: "Off" },
  { id: "leak", name: "Leak sensor", room: "Yard", kind: "sensor", on: true, detail: "Watch" },
  { id: "air", name: "Air quality", room: "Lounge", kind: "sensor", on: true, detail: "CO₂ 760" },
  { id: "fire", name: "Fire sensor", room: "Kitchen", kind: "sensor", on: true, detail: "Clear" },
];

export const homeEvents = [
  { at: "18 Aug, 06:14", text: "Leak sensor — usage spike on WM-110384" },
  { at: "17 Aug, 21:02", text: "Front lock — locked from dashboard" },
  { at: "17 Aug, 18:40", text: "Lounge AC — set to 24°C" },
  { at: "16 Aug, 19:11", text: "CO₂ peaked at 910 ppm" },
];

export const alerts: HouseAlert[] = [
  {
    id: "a1",
    tone: "warn",
    service: "meters",
    title: "Water spike on 15 Aug",
    body: "1.92 m³ in a day — about 4× the house average. Leak sensor is on watch.",
  },
  {
    id: "a2",
    tone: "info",
    service: "ecg",
    title: "ECG due in 4 days",
    body: "Jul cycle is GH₵486.20. Prepaid credit sitting at GH₵42.10.",
  },
  {
    id: "a3",
    tone: "ok",
    service: "solar",
    title: "Solar covering midday load",
    body: "Inverter produced 18.4 kWh today. Grid import only 2.8 kWh.",
  },
];

export const airportAlerts: HouseAlert[] = [
  {
    id: "ar1",
    tone: "warn",
    service: "ecg",
    title: "Unit 4 is heaviest this cycle",
    body: "ECG GH₵520 · water GH₵154. Combined estate docket is still open.",
  },
  {
    id: "ar2",
    tone: "info",
    service: "water",
    title: "Estate water is overdue",
    body: "GWCL GH₵490 on EST-W-8801 was due 18 Aug.",
  },
  {
    id: "ar3",
    tone: "ok",
    service: "utilities",
    title: "Fibre is settled",
    body: "Telecel Home is clear. Four units still carry ECG and water.",
  },
];
