"use client";

import StorefrontRetry from "@/components/shared/StorefrontRetry";

// WordPress temporarily unavailable (rate-limited / 5xx) — show a
// self-retrying page instead of an empty archive.
export default function BlogArchiveError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StorefrontRetry
      reset={reset}
      title="Our blog is taking a little longer to load"
      backHref="/shop"
      backLabel="Browse the shop"
    />
  );
}
