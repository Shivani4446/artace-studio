import type { Metadata } from "next";
import { Suspense } from "react";
import { buildSiteUrl } from "@/lib/site";
import CheckoutPageClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Secure Checkout | Samora by Artace Studio",
  description: "Complete your Samora purchase securely with Razorpay.",
  alternates: {
    canonical: buildSiteUrl("/samora/checkout"),
  },
  robots: {
    index: false,
    follow: true,
  },
};

// Wrapped in Suspense because checkout-client now reads ?coupon= via
// useSearchParams() (the hamper builder's handoff) — Next requires this.
const SamoraCheckoutPage = () => (
  <Suspense fallback={null}>
    <CheckoutPageClient />
  </Suspense>
);

export default SamoraCheckoutPage;
