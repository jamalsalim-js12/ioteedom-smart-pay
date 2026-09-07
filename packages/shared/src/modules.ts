export const MODULE_IDS = [
  "ecg",
  "water",
  "utilities",
  "meters",
  "smart_home",
  "solar",
  "ev",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export type ModuleCatalogEntry = {
  id: ModuleId;
  name: string;
  blurb: string;
  href: string;
  v1: boolean;
};

export const MODULE_CATALOG: readonly ModuleCatalogEntry[] = [
  {
    id: "ecg",
    name: "ECG",
    blurb: "Each party pays their own ECG on their dashboard.",
    href: "/bills",
    v1: true,
  },
  {
    id: "water",
    name: "Water",
    blurb: "Tenant pays the owner from usage. Owner remits to Ghana Water.",
    href: "/bills",
    v1: true,
  },
  {
    id: "utilities",
    name: "Other utilities",
    blurb: "Room to add more billers without a new product.",
    href: "/bills",
    v1: true,
  },
  {
    id: "meters",
    name: "Water meters",
    blurb: "Readings become the tenant water bill. Leak alerts sit here too.",
    href: "/meters",
    v1: false,
  },
  {
    id: "smart_home",
    name: "Smart home",
    blurb: "Devices, sensors, and a history you can look back on.",
    href: "/smart-home",
    v1: false,
  },
  {
    id: "solar",
    name: "Solar",
    blurb: "Production against what the house is using.",
    href: "/solar",
    v1: false,
  },
  {
    id: "ev",
    name: "EV",
    blurb: "Vehicle on the account, charging history, wallet. App later.",
    href: "/ev",
    v1: false,
  },
];

export function isModuleId(value: string): value is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(value);
}

export function blankModules(enabled: boolean): Record<ModuleId, boolean> {
  return {
    ecg: enabled,
    water: enabled,
    utilities: enabled,
    meters: enabled,
    smart_home: enabled,
    solar: enabled,
    ev: enabled,
  };
}

export function namedModules(flags: Record<ModuleId, boolean>): string[] {
  return MODULE_CATALOG.filter((item) => flags[item.id]).map((item) => item.name);
}
