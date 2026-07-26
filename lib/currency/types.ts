// lib/currency/types.ts

export type CurrencyCode = "INR" | "USD" | "AED" | "AUD" | "CAD" | "GBP" | "EUR" | "NZD";

export type ExchangeRates = {
  base: "INR";
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
};
