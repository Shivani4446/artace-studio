export type PortraitType = "single" | "couple" | "family" | "baby";

export const PORTRAIT_TYPES: { value: PortraitType; label: string; basePrice: number }[] = [
  { value: "single", label: "Single Portrait", basePrice: 4500 },
  { value: "couple", label: "Couple Portrait", basePrice: 5500 },
  { value: "family", label: "Family Portrait", basePrice: 6800 },
  { value: "baby", label: "Baby Portrait", basePrice: 4000 },
];

const BASE_PRICE_BY_TYPE: Record<PortraitType, number> = {
  single: 4500,
  couple: 5500,
  family: 6800,
  baby: 4000,
};

// The 12" x 12" reference size the base prices above are quoted at.
export const BASE_AREA_SQIN = 12 * 12;

export const MIN_DIMENSION_INCHES = 4;
export const MAX_DIMENSION_INCHES = 72;
export const DEPOSIT_RATE = 0.1;

// Created once via the WooCommerce Admin API — see
// docs/superpowers/plans/2026-08-11-custom-portraits.md, Task 2. A draft, hidden, virtual,
// tax-free product whose catalog price ("1") is never actually charged: every order overrides it
// with the calculated deposit via the subtotal/total line-item override below (the same mechanism
// already proven for Prints). Draft status (not "publish") because this store's Store API does not
// honor catalog_visibility: "hidden" — draft was verified live to be the setting that actually
// excludes it from the public catalog, search, and direct-by-id fetch, while still working fine for
// server-side order creation via the Admin API (the only way this product is ever used).
// Also used to exclude Custom Portraits orders from the main Artace Rewards crediting flow — see
// lib/api-route-handlers/checkout/verify/route.ts.
export const CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 4317;

export const isPortraitType = (value: unknown): value is PortraitType =>
  value === "single" || value === "couple" || value === "family" || value === "baby";

export type PortraitEstimate = {
  estimatedPrice: number;
  depositAmount: number;
};

export const calculatePortraitEstimate = (input: {
  portraitType: unknown;
  widthInches: unknown;
  heightInches: unknown;
}): PortraitEstimate | null => {
  if (!isPortraitType(input.portraitType)) return null;

  const width = Number(input.widthInches);
  const height = Number(input.heightInches);

  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width < MIN_DIMENSION_INCHES || width > MAX_DIMENSION_INCHES) return null;
  if (height < MIN_DIMENSION_INCHES || height > MAX_DIMENSION_INCHES) return null;

  const basePrice = BASE_PRICE_BY_TYPE[input.portraitType];
  const area = width * height;
  const estimatedPrice = Math.round((basePrice * area) / BASE_AREA_SQIN);
  const depositAmount = Math.round(estimatedPrice * DEPOSIT_RATE);

  return { estimatedPrice, depositAmount };
};
