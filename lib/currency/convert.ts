// lib/currency/convert.ts
import type { CurrencyCode, ExchangeRates } from "./types";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
  AUD: "A$",
  CAD: "C$",
  GBP: "£",
};

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  AED: "en-AE",
  AUD: "en-AU",
  CAD: "en-CA",
  GBP: "en-GB",
};

const formatInInr = (amountInInr: number): string =>
  `${CURRENCY_SYMBOLS.INR}${Math.round(amountInInr).toLocaleString(CURRENCY_LOCALES.INR)}`;

// Pure, framework-agnostic — safe to call from both Server and Client
// Components. Always rounds to the nearest whole unit (no decimals), per
// the existing site-wide price-formatting convention.
export function formatConvertedPrice(
  amountInInr: number,
  currency: CurrencyCode,
  rates: ExchangeRates | null
): string {
  if (currency === "INR" || !rates) {
    return formatInInr(amountInInr);
  }

  const rate = rates.rates[currency];
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    return formatInInr(amountInInr);
  }

  const convertedAmount = amountInInr * rate;
  return `${CURRENCY_SYMBOLS[currency]}${Math.round(convertedAmount).toLocaleString(
    CURRENCY_LOCALES[currency]
  )}`;
}
