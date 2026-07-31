import type { Metadata } from "next";
import { Suspense } from "react";
import { buildSiteUrl } from "@/lib/site";
import CheckoutSuccessPageClient from "./checkout-success-client";

export const metadata: Metadata = {
  title: "Order Confirmed | Samora by Artace Studio",
  description: "Your Samora order has been confirmed. Thank you for your purchase.",
  alternates: {
    canonical: buildSiteUrl("/samora/checkout/success"),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SamoraCheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[1200px] px-5 py-14 md:px-10 md:py-20">
          <section className="rounded-[24px] border border-[#2b2420]/10 bg-[#fbf6ef] p-6 md:p-10">
            <h1 className="font-samora-display text-[32px] leading-[1.1] text-[#2b2420] md:text-[42px]">
              Checking your payment
            </h1>
            <p className="mt-4 text-[16px] leading-[1.7] text-[#5c5344]">
              Loading your order status&hellip;
            </p>
          </section>
        </main>
      }
    >
      <CheckoutSuccessPageClient />
    </Suspense>
  );
}
