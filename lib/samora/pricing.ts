// Samora-specific checkout pricing rules — pure constants/functions only, so
// this file is safe to import from client components too. Server-only data
// fetching lives in lib/samora/pricing.server.ts.

export const SAMORA_GIFT_FEE_PER_ITEM_INR = 50;
export const SAMORA_FREE_SHIPPING_THRESHOLD_INR = 2000;

// Fallback used only when a cart line item is missing a real WooCommerce
// weight (should be rare — every Samora product carries a weight).
export const SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS = 300;

// Used only if a live Delhivery rate call fails at the moment of checkout —
// keeps the order from silently under-charging (or blocking) on a transient
// API hiccup. Real orders should almost always get the live-quoted rate.
export const SAMORA_SHIPPING_FALLBACK_INR = 89;

export const calculateGiftFee = (itemCount: number, isGift: boolean): number =>
  isGift ? SAMORA_GIFT_FEE_PER_ITEM_INR * Math.max(0, itemCount) : 0;

export const isEligibleForFreeShipping = (subtotalInr: number): boolean =>
  subtotalInr >= SAMORA_FREE_SHIPPING_THRESHOLD_INR;

// Coupons that only apply to Samora orders — enforced in code (not just a
// WooCommerce product/category restriction) so a mixed Artace+Samora cart
// can't get the Samora discount on the Artace items, and the code can't be
// used from Artace's own checkout at all.
export const SAMORA_EXCLUSIVE_COUPON_CODES = new Set(["rakhi10"]);

export const isSamoraExclusiveCoupon = (code: string): boolean =>
  SAMORA_EXCLUSIVE_COUPON_CODES.has(code.trim().toLowerCase());
