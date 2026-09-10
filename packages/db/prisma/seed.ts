import { argon2id, hash } from "argon2";
import { ulid } from "ulid";
import { createPrismaClient } from "../dist/index.js";

const prisma = createPrismaClient();

/** Matches the prototype owner PIN so KON-14 can wire the same numbers. */
const SEED_OWNER_PIN = "2468";
const SEED_STAFF_PIN = "1357";

const MODULES = ["ecg", "water", "utilities", "meters", "smart_home", "solar", "ev"] as const;

async function main() {
  const pinHash = await hash(SEED_OWNER_PIN, { type: argon2id });
  const staffPinHash = await hash(SEED_STAFF_PIN, { type: argon2id });

  const staff = await prisma.staffUser.upsert({
    where: { phone: "233200000001" },
    update: {
      pinHash: staffPinHash,
      mustChangePin: true,
      pinFailedCount: 0,
      pinLockedUntil: null,
    },
    create: {
      id: ulid(),
      phone: "233200000001",
      phoneDisplay: "020 000 0001",
      email: "ops@ioteedom.local",
      name: "IoTeedom Superadmin",
      pinHash: staffPinHash,
      mustChangePin: true,
      role: "superadmin",
    },
  });

  const homeAccount = await upsertAccount({
    name: "Ama Mensah",
    kind: "home",
    staffId: staff.id,
  });
  const estateAccount = await upsertAccount({
    name: "Airport Residential Ltd",
    kind: "estate",
    staffId: staff.id,
  });

  await seedModules(homeAccount.id, staff.id);
  await seedModules(estateAccount.id, staff.id);

  const homeProperty = await upsertProperty({
    accountId: homeAccount.id,
    label: "East Legon",
    address: "12 Boundary Rd, East Legon",
    city: "Accra",
    kind: "home",
  });

  const estateProperty = await upsertProperty({
    accountId: estateAccount.id,
    label: "Airport Residential",
    address: "8 Eighth Ave, Airport Residential",
    city: "Accra",
    kind: "estate",
    waterTariffPesewasPerM3: 850n,
  });

  if ((await prisma.unit.count({ where: { propertyId: estateProperty.id } })) === 0) {
    await prisma.unit.createMany({
      data: [
        { id: ulid(), propertyId: estateProperty.id, name: "Unit 1", sortOrder: 1 },
        { id: ulid(), propertyId: estateProperty.id, name: "Unit 2", sortOrder: 2 },
      ],
    });
  }

  await upsertOwner({
    phone: "233244128891",
    phoneDisplay: "024 412 8891",
    name: "Ama Mensah",
    accountId: homeAccount.id,
    pinHash,
    email: "ama.mensah@email.com",
  });
  await upsertOwner({
    phone: "233302000100",
    phoneDisplay: "030 200 0100",
    name: "Airport Residential Ltd",
    accountId: estateAccount.id,
    pinHash,
    email: "airport@ioteedom.local",
  });

  const estateUnits = await prisma.unit.findMany({
    where: { propertyId: estateProperty.id },
    orderBy: { sortOrder: "asc" },
  });
  const unit1 = estateUnits[0];
  const unit2 = estateUnits[1];
  if (!unit1 || !unit2) {
    throw new Error("Estate seed needs Unit 1 and Unit 2");
  }

  const efua = await upsertTenant({
    phone: "233245551001",
    phoneDisplay: "024 555 1001",
    name: "Efua Sarpong",
    pinHash,
    email: "efua.sarpong@email.com",
  });
  const kojo = await upsertTenant({
    phone: "233245551002",
    phoneDisplay: "024 555 1002",
    name: "Kojo Boateng",
    pinHash,
    email: "kojo.boateng@email.com",
  });
  const occupancy1 = await upsertOccupancy({ unitId: unit1.id, userId: efua.id });
  const occupancy2 = await upsertOccupancy({ unitId: unit2.id, userId: kojo.id });

  await seedHomeBills({
    accountId: homeAccount.id,
    propertyId: homeProperty.id,
  });
  await seedEstateBills({
    accountId: estateAccount.id,
    propertyId: estateProperty.id,
    unit1,
    unit2,
    occupancy1Id: occupancy1.id,
    occupancy2Id: occupancy2.id,
  });
}

async function upsertAccount(input: { name: string; kind: "home" | "estate"; staffId: string }) {
  const existing = await prisma.account.findFirst({
    where: { name: input.name, kind: input.kind },
  });
  if (existing) {
    return prisma.account.update({
      where: { id: existing.id },
      data: { status: "invited", onboardedAt: null },
    });
  }
  return prisma.account.create({
    data: {
      id: ulid(),
      name: input.name,
      kind: input.kind,
      status: "invited",
      createdByStaffId: input.staffId,
    },
  });
}

async function upsertProperty(input: {
  accountId: string;
  label: string;
  address: string;
  city: string;
  kind: "home" | "estate";
  waterTariffPesewasPerM3?: bigint;
}) {
  const existing = await prisma.property.findFirst({
    where: { accountId: input.accountId, label: input.label },
  });
  if (existing) return existing;
  return prisma.property.create({
    data: {
      id: ulid(),
      accountId: input.accountId,
      label: input.label,
      address: input.address,
      city: input.city,
      kind: input.kind,
      waterTariffPesewasPerM3: input.waterTariffPesewasPerM3,
    },
  });
}

async function upsertOwner(input: {
  phone: string;
  phoneDisplay: string;
  name: string;
  accountId: string;
  pinHash: string;
  email: string;
}) {
  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: {
      pinHash: input.pinHash,
      email: input.email,
      mustChangePin: true,
      pinFailedCount: 0,
      pinLockedUntil: null,
    },
    create: {
      id: ulid(),
      phone: input.phone,
      phoneDisplay: input.phoneDisplay,
      email: input.email,
      name: input.name,
      pinHash: input.pinHash,
      mustChangePin: true,
    },
  });
  await prisma.membership.upsert({
    where: {
      userId_accountId: { userId: user.id, accountId: input.accountId },
    },
    update: {},
    create: {
      id: ulid(),
      userId: user.id,
      accountId: input.accountId,
      role: "owner",
    },
  });
}

async function upsertTenant(input: {
  phone: string;
  phoneDisplay: string;
  name: string;
  pinHash: string;
  email: string;
}) {
  return prisma.user.upsert({
    where: { phone: input.phone },
    update: {
      pinHash: input.pinHash,
      email: input.email,
      mustChangePin: true,
      pinFailedCount: 0,
      pinLockedUntil: null,
    },
    create: {
      id: ulid(),
      phone: input.phone,
      phoneDisplay: input.phoneDisplay,
      email: input.email,
      name: input.name,
      pinHash: input.pinHash,
      mustChangePin: true,
    },
  });
}

async function upsertOccupancy(input: { unitId: string; userId: string }) {
  const existing = await prisma.occupancy.findFirst({
    where: { unitId: input.unitId, endedAt: null },
  });
  if (existing) {
    if (existing.userId === input.userId) return existing;
    return prisma.occupancy.update({
      where: { id: existing.id },
      data: { userId: input.userId },
    });
  }
  return prisma.occupancy.create({
    data: {
      id: ulid(),
      unitId: input.unitId,
      userId: input.userId,
      startedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  });
}

async function upsertUtilityAccount(input: {
  propertyId: string;
  unitId?: string | null;
  service: "ecg" | "water";
  biller: string;
  accountNumber: string;
  meterNumber?: string;
  mode: "prepaid" | "postpaid" | "unknown";
}) {
  const existing = await prisma.utilityAccount.findFirst({
    where: {
      propertyId: input.propertyId,
      service: input.service,
      unitId: input.unitId ?? null,
    },
  });
  const data = {
    biller: input.biller,
    accountNumber: input.accountNumber,
    meterNumber: input.meterNumber ?? null,
    mode: input.mode,
  };
  if (existing) {
    return prisma.utilityAccount.update({ where: { id: existing.id }, data });
  }
  return prisma.utilityAccount.create({
    data: {
      id: ulid(),
      propertyId: input.propertyId,
      unitId: input.unitId ?? null,
      service: input.service,
      ...data,
    },
  });
}

async function upsertBill(input: {
  type: "ecg_postpaid" | "water_tenant" | "water_gwcl";
  rail: "direct" | "collect" | "remit";
  accountId: string;
  propertyId: string;
  unitId?: string | null;
  occupancyId?: string | null;
  utilityAccountId?: string | null;
  cycle: string;
  dueAt?: Date;
  amountDuePesewas: bigint;
  amountOriginalPesewas: bigint;
  payeeType: "ecg" | "gwcl" | "owner";
  payeeLabel: string;
  status?: "open" | "paid";
  usageM3?: string;
}) {
  const existing = await prisma.bill.findFirst({
    where: {
      accountId: input.accountId,
      type: input.type,
      cycle: input.cycle,
      unitId: input.unitId ?? null,
    },
  });
  const data = {
    rail: input.rail,
    occupancyId: input.occupancyId ?? null,
    utilityAccountId: input.utilityAccountId ?? null,
    dueAt: input.dueAt ?? null,
    amountDuePesewas: input.amountDuePesewas,
    amountOriginalPesewas: input.amountOriginalPesewas,
    payeeType: input.payeeType,
    payeeLabel: input.payeeLabel,
    status: input.status ?? "open",
    usageM3: input.usageM3 ?? null,
  };
  if (existing) {
    return prisma.bill.update({ where: { id: existing.id }, data });
  }
  return prisma.bill.create({
    data: {
      id: ulid(),
      type: input.type,
      accountId: input.accountId,
      propertyId: input.propertyId,
      unitId: input.unitId ?? null,
      cycle: input.cycle,
      ...data,
    },
  });
}

async function seedHomeBills(input: { accountId: string; propertyId: string }) {
  const ecg = await upsertUtilityAccount({
    propertyId: input.propertyId,
    service: "ecg",
    biller: "ECG",
    accountNumber: "5418229103",
    meterNumber: "GE-8842196",
    mode: "postpaid",
  });
  const gwcl = await upsertUtilityAccount({
    propertyId: input.propertyId,
    service: "water",
    biller: "GWCL",
    accountNumber: "W-ACC-209441",
    meterNumber: "WM-110384",
    mode: "postpaid",
  });
  await upsertBill({
    type: "ecg_postpaid",
    rail: "direct",
    accountId: input.accountId,
    propertyId: input.propertyId,
    utilityAccountId: ecg.id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-22"),
    amountDuePesewas: 48620n,
    amountOriginalPesewas: 48620n,
    payeeType: "ecg",
    payeeLabel: "ECG",
  });
  await upsertBill({
    type: "water_gwcl",
    rail: "direct",
    accountId: input.accountId,
    propertyId: input.propertyId,
    utilityAccountId: gwcl.id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-20"),
    amountDuePesewas: 12750n,
    amountOriginalPesewas: 12750n,
    payeeType: "gwcl",
    payeeLabel: "Ghana Water",
  });
}

async function seedEstateBills(input: {
  accountId: string;
  propertyId: string;
  unit1: { id: string };
  unit2: { id: string };
  occupancy1Id: string;
  occupancy2Id: string;
}) {
  const ownerEcg = await upsertUtilityAccount({
    propertyId: input.propertyId,
    service: "ecg",
    biller: "ECG",
    accountNumber: "EST-ECG-8801",
    meterNumber: "GE-EST-4401",
    mode: "postpaid",
  });
  const gwcl = await upsertUtilityAccount({
    propertyId: input.propertyId,
    service: "water",
    biller: "GWCL",
    accountNumber: "EST-W-8801",
    meterNumber: "WM-EST-4401",
    mode: "postpaid",
  });
  const unit1Ecg = await upsertUtilityAccount({
    propertyId: input.propertyId,
    unitId: input.unit1.id,
    service: "ecg",
    biller: "ECG",
    accountNumber: "EST-ECG-U1",
    meterNumber: "GE-EST-U1",
    mode: "postpaid",
  });
  const unit2Ecg = await upsertUtilityAccount({
    propertyId: input.propertyId,
    unitId: input.unit2.id,
    service: "ecg",
    biller: "ECG",
    accountNumber: "EST-ECG-U2",
    meterNumber: "GE-EST-U2",
    mode: "postpaid",
  });

  await upsertBill({
    type: "ecg_postpaid",
    rail: "direct",
    accountId: input.accountId,
    propertyId: input.propertyId,
    utilityAccountId: ownerEcg.id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-28"),
    amountDuePesewas: 0n,
    amountOriginalPesewas: 0n,
    payeeType: "ecg",
    payeeLabel: "ECG",
  });
  await upsertBill({
    type: "ecg_postpaid",
    rail: "direct",
    accountId: input.accountId,
    propertyId: input.propertyId,
    unitId: input.unit1.id,
    occupancyId: input.occupancy1Id,
    utilityAccountId: unit1Ecg.id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-28"),
    amountDuePesewas: 42000n,
    amountOriginalPesewas: 42000n,
    payeeType: "ecg",
    payeeLabel: "ECG",
  });
  await upsertBill({
    type: "ecg_postpaid",
    rail: "direct",
    accountId: input.accountId,
    propertyId: input.propertyId,
    unitId: input.unit2.id,
    occupancyId: input.occupancy2Id,
    utilityAccountId: unit2Ecg.id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-28"),
    amountDuePesewas: 51000n,
    amountOriginalPesewas: 51000n,
    payeeType: "ecg",
    payeeLabel: "ECG",
  });
  await upsertBill({
    type: "water_tenant",
    rail: "collect",
    accountId: input.accountId,
    propertyId: input.propertyId,
    unitId: input.unit1.id,
    occupancyId: input.occupancy1Id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-18"),
    amountDuePesewas: 0n,
    amountOriginalPesewas: 11000n,
    payeeType: "owner",
    payeeLabel: "Airport Residential Ltd",
    status: "paid",
    usageM3: "16.200",
  });
  await upsertBill({
    type: "water_tenant",
    rail: "collect",
    accountId: input.accountId,
    propertyId: input.propertyId,
    unitId: input.unit2.id,
    occupancyId: input.occupancy2Id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-18"),
    amountDuePesewas: 12800n,
    amountOriginalPesewas: 12800n,
    payeeType: "owner",
    payeeLabel: "Airport Residential Ltd",
    usageM3: "18.800",
  });
  await upsertBill({
    type: "water_gwcl",
    rail: "remit",
    accountId: input.accountId,
    propertyId: input.propertyId,
    utilityAccountId: gwcl.id,
    cycle: "2026-07",
    dueAt: new Date("2026-08-18"),
    amountDuePesewas: 49000n,
    amountOriginalPesewas: 49000n,
    payeeType: "gwcl",
    payeeLabel: "Ghana Water",
  });
}

async function seedModules(accountId: string, staffId: string) {
  for (const module of MODULES) {
    await prisma.accountModule.upsert({
      where: { accountId_module: { accountId, module } },
      update: {},
      create: {
        accountId,
        module,
        enabled: module === "ecg" || module === "water",
        setByStaffId: staffId,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
