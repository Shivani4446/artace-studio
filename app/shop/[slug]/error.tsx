"use client";

import StorefrontRetry from "@/components/shared/StorefrontRetry";

// WooCommerce temporarily unavailable (rate-limited / 5xx) — show a
// self-retrying page instead of a false 404. See getSingleProduct.
export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return <StorefrontRetry reset={reset} />;
}
