"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Fires a best-effort, non-blocking beacon whenever a page loads with a
// ?ref= param — records a click against that affiliate. Uses `keepalive`
// so the request survives immediate navigation, same mechanism as
// navigator.sendBeacon. Never blocks rendering and never surfaces errors —
// this is pure telemetry, not something a visitor should ever notice.
const AffiliateClickTrackerInner = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    if (!referralCode) return;

    try {
      fetch("/api/affiliate-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode, landingPath: pathname || "/" }),
        keepalive: true,
      }).catch(() => {
        // Best-effort only.
      });
    } catch {
      // Best-effort only.
    }
    // Only re-fire when the ref code or path actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("ref"), pathname]);

  return null;
};

export default AffiliateClickTrackerInner;
