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

export const PIN_LENGTH = 4;
export const PIN_PATTERN = /^\d{4}$/;

export function isPin(value: string): boolean {
  return PIN_PATTERN.test(value);
}

/** Display as `024 412 8891`. Accepts local or 233-prefixed input. */
export function formatGhPhoneDisplay(value: string): string {
  const digits = digitsOnly(value);
  const local = (
    digits.startsWith(GHANA_COUNTRY) ? `0${digits.slice(GHANA_COUNTRY.length)}` : digits
  ).slice(0, 10);
  const parts = [local.slice(0, 3), local.slice(3, 6), local.slice(6, 10)].filter(Boolean);
  return parts.join(" ");
}
