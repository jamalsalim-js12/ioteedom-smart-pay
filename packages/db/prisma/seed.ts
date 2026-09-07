import { ulid } from "ulid";
import { createPrismaClient } from "../dist/index.js";

const prisma = createPrismaClient();

const PLACEHOLDER_PIN = "INVITE_PIN_NOT_HASHED_YET";

const MODULES = ["ecg", "water", "utilities", "meters", "smart_home", "solar", "ev"] as const;

async function main() {
  const staff = await prisma.staffUser.upsert({
    where: { phone: "233200000001" },
    update: {},
    create: {
      id: ulid(),
      phone: "233200000001",
      phoneDisplay: "020 000 0001",
      email: "ops@ioteedom.local",
      name: "IoTeedom Superadmin",
      pinHash: PLACEHOLDER_PIN,
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

  await upsertProperty({
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
  });
  await upsertOwner({
    phone: "233302000100",
    phoneDisplay: "030 200 0100",
    name: "Airport Residential Ltd",
    accountId: estateAccount.id,
  });
}

async function upsertAccount(input: { name: string; kind: "home" | "estate"; staffId: string }) {
  const existing = await prisma.account.findFirst({
    where: { name: input.name, kind: input.kind },
  });
  if (existing) return existing;
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
}) {
  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: {},
    create: {
      id: ulid(),
      phone: input.phone,
      phoneDisplay: input.phoneDisplay,
      name: input.name,
      pinHash: PLACEHOLDER_PIN,
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
