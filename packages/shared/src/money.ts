export const CURRENCY = "GHS" as const;

export type Currency = typeof CURRENCY;

/** Integer pesewas. Never store GHS as a float. */
export type Pesewas = bigint;

const CEDIS_PATTERN = /^-?(\d+)(?:\.(\d{1,2}))?$/;

export function pesewasFromCedisString(value: string): Pesewas {
  const trimmed = value.trim();
  const match = trimmed.match(CEDIS_PATTERN);
  if (!match) {
    throw new Error(`Invalid GHS amount: ${value}`);
  }
  const negative = trimmed.startsWith("-");
  const cedis = BigInt(match[1]);
  const frac = (match[2] ?? "").padEnd(2, "0");
  const pesewas = cedis * 100n + BigInt(frac);
  return negative ? -pesewas : pesewas;
}

export function formatGhs(pesewas: Pesewas): string {
  const negative = pesewas < 0n;
  const abs = negative ? -pesewas : pesewas;
  const cedis = abs / 100n;
  const minor = abs % 100n;
  const body = `GH₵${cedis.toString()}.${minor.toString().padStart(2, "0")}`;
  return negative ? `-${body}` : body;
}

export function addPesewas(left: Pesewas, right: Pesewas): Pesewas {
  return left + right;
}
