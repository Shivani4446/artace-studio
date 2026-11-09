// lib/atelier/index.ts
import type { WooStoreProduct } from "@/lib/schema/types";

/**
 * The Atelier — Artace Studio's one-of-one, fully hand-painted collection
 * priced above INR 1,00,000. Direct purchase is the primary path; an enquiry
 * flow is the secondary fallback for sold pieces and for buyers who want to
 * discuss a commission.
 */
export const ATELIER_CATEGORY_SLUG = "atelier";

/** Floor for the collection, in major units (rupees). */
export const ATELIER_PRICE_FLOOR_INR = 100000;

/**
 * Placement is still open — see the plan. This is a single value so copy, SEO
 * and the collection hero can be re-pointed without touching logic.
 */
export const ATELIER_SUBJECT = "Handpainted originals";

/**
 * The Atelier CATEGORY is the single source of truth for membership.
 *
 * Deliberately not also mirrored to a tag: category+tag membership would be
 * two fields that can silently drift apart, and the failure mode (a one-of-one
 * original quietly treated as a regular stocked product) is expensive.
 * Per-product mechanics that need to vary independently — one-of-one, prints
 * disabled, custom sizing disabled — are read from explicit product meta
 * instead, in lib/atelier/meta.ts.
 */
export const isAtelierProduct = (
  product: Pick<WooStoreProduct, "categories"> | null | undefined
): boolean =>
  (product?.categories ?? []).some(
    (category) => (category?.slug || "").trim().toLowerCase() === ATELIER_CATEGORY_SLUG
  );
