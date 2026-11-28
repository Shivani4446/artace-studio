"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Shown when WooCommerce is temporarily unavailable (rate-limited / 5xx)
// while loading a product. Previously that case fell through to a 404, which
// tells visitors — and Google — that the painting no longer exists. This page
// instead retries automatically after a short pause.
const AUTO_RETRY_SECONDS = 8;
const MAX_AUTO_RETRIES = 2;
const RETRY_COUNT_KEY = "artace_product_error_retries";

export default function StorefrontRetry({
  reset,
  backHref = "/shop",
  backLabel = "Browse the shop",
  title = "This painting is taking a little longer to load",
}: {
  reset: () => void;
  backHref?: string;
  backLabel?: string;
  title?: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETRY_SECONDS);
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    let attempts = 0;
    try {
      // Stored as "<count>:<timestamp>"; the count only applies to a burst
      // of failures within the last minute, so later outages retry again.
      const [count, at] = (sessionStorage.getItem(RETRY_COUNT_KEY) || "0:0").split(":");
      attempts = Date.now() - Number(at) < 60_000 ? Number(count) || 0 : 0;
    } catch {
      // Storage unavailable — fall back to a single automatic retry.
    }
    if (attempts >= MAX_AUTO_RETRIES) {
      setAutoRetry(false);
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          try {
            sessionStorage.setItem(RETRY_COUNT_KEY, `${attempts + 1}:${Date.now()}`);
          } catch {
            // ignore
          }
          // A full reload re-requests the server component; reset() alone
          // only re-renders the client boundary.
          window.location.reload();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const retryNow = () => {
    try {
      sessionStorage.removeItem(RETRY_COUNT_KEY);
    } catch {
      // ignore
    }
    reset();
    window.location.reload();
  };

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d1f]">
        One moment
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-neutral-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
        Our gallery is busy right now.{" "}
        {autoRetry
          ? `We'll try again automatically in ${secondsLeft}s.`
          : "Please try again in a moment."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={retryNow}
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Try again now
        </button>
        <Link
          href={backHref}
          className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
        >
          {backLabel}
        </Link>
      </div>
    </section>
  );
}
