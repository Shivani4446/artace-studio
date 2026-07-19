// lib/currency/cookie.ts
import type { CurrencyCode } from "./types";

export const CURRENCY_COOKIE_NAME = "artace-currency";

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
];

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export function parseCurrencyCode(
  value: string | undefined | null
): CurrencyCode {
  if (value && (SUPPORTED_CURRENCIES as string[]).includes(value)) {
    return value as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}
