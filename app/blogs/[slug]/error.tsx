"use client";

import StorefrontRetry from "@/components/shared/StorefrontRetry";

// WordPress temporarily unavailable (rate-limited / 5xx) — show a
// self-retrying page instead of a false 404. See getPost.
export default function BlogPostError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StorefrontRetry
      reset={reset}
      title="This article is taking a little longer to load"
      backHref="/blogs"
      backLabel="Browse all blogs"
    />
  );
}
