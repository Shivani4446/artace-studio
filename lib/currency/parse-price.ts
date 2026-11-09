// lib/currency/parse-price.ts

/**
 * Converts a raw WooCommerce price string (always an integer amount in the
 * currency's *minor* unit — paise for INR, cents for USD) into a major-unit
 * number, e.g. "15000000" with minorUnit 2 -> 150000.
 *
 * This is the single source of truth for that conversion. It previously lived
 * as eight identical copy-pasted local helpers across app/ and
 * lib/api-route-handlers/, one of which (lib/schema/offer.ts) was never
 * actually applying the divisor and so published 100x-inflated Offer prices
 * in JSON-LD. Never re-derive this inline again.
 *
 * Returns null for a missing, empty, or non-numeric input — callers must
 * treat null as "price unknown", never as zero-and-therefore-free.
 *
 * Pure, framework-agnostic — safe to call from Server and Client Components.
 */
export function parsePrice(rawValue: string | undefined | null, minorUnit = 2): number | null {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
}
