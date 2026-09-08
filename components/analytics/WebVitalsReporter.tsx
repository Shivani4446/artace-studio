"use client";

import { useReportWebVitals } from "next/web-vitals";
import { pushToDataLayer } from "@/utils/gtm";

/**
 * Pushes each Core Web Vitals metric (LCP, CLS, INP, FCP, TTFB) into the
 * existing GTM dataLayer as a custom event — no new analytics account or
 * script needed, since GTM/GA4 are already configured (see app/layout.tsx).
 * A GTM trigger/tag can be added on the "web_vitals" event name to forward
 * these into GA4 as real events whenever that's wired up on the GTM side;
 * until then this at least means the data is being captured, not lost.
 */
const WebVitalsReporter = () => {
  useReportWebVitals((metric) => {
    pushToDataLayer({
      event: "web_vitals",
      metric_name: metric.name,
      metric_value: metric.name === "CLS" ? metric.value * 1000 : Math.round(metric.value),
      metric_delta: metric.name === "CLS" ? metric.delta * 1000 : Math.round(metric.delta),
      metric_id: metric.id,
      metric_rating: metric.rating,
    });
  });

  return null;
};

export default WebVitalsReporter;
