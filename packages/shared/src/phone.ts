const GHANA_COUNTRY = "233";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Store as 233XXXXXXXXX. Accepts local 0XXXXXXXXX or already-normalized. */
export function normalizeGhPhone(value: string): string | null {
  const digits = digitsOnly(value);
  if (digits.startsWith(GHANA_COUNTRY) && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `${GHANA_COUNTRY}${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `${GHANA_COUNTRY}${digits}`;
  }
  return null;
}

export function isPin(value: string): boolean {
  return /^\d{4,6}$/.test(value);
}
