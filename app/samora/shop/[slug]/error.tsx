"use client";

import StorefrontRetry from "@/components/shared/StorefrontRetry";

// WooCommerce temporarily unavailable (rate-limited / 5xx) — show a
// self-retrying page instead of a false 404. See getSingleSamoraProduct.
export default function SamoraProductError({ reset }: { error: Error; reset: () => void }) {
  return <StorefrontRetry reset={reset} backHref="/samora/shop" backLabel="Browse Samora" />;
}
