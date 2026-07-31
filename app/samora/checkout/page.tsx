import type { Metadata } from "next";
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

export default CheckoutPageClient;
