// lib/currency/rates.ts
import type { CurrencyCode, ExchangeRates } from "./types";

const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/INR";
const RATES_REVALIDATE_SECONDS = 21600; // 6 hours; the API itself updates once daily

type ExchangeRateApiResponse = {
  result?: string;
  rates?: Record<string, number>;
};

const REQUIRED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
];

// Returns null on any failure (network error, bad response, missing currency
// in the payload) — callers must treat null as "no rates available" and fall
// back to displaying INR untouched. Never fabricate approximate rates.
//
// Note: within the 6-hour revalidate window, Next.js's fetch Data Cache
// serves the cached response without hitting the network at all, and on a
// failed background revalidation it keeps serving the last good cached
// value — so this only returns null on a cold start with no cache yet, or a
// sustained multi-hour outage.
export async function getExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL, {
      next: { revalidate: RATES_REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as ExchangeRateApiResponse;
    if (payload.result !== "success" || !payload.rates) return null;

    const rates: Partial<Record<CurrencyCode, number>> = { INR: 1 };
    for (const code of REQUIRED_CURRENCIES) {
      if (code === "INR") continue;
      const rate = payload.rates[code];
      if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return null;
      rates[code] = rate;
    }

    return {
      base: "INR",
      rates: rates as Record<CurrencyCode, number>,
      fetchedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
