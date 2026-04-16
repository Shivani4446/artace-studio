import type { Metadata } from "next";
import { Suspense } from "react";

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: "Order Confirmed | Artace Studio",
    description: "Your order has been confirmed. Thank you for purchasing Artace Studio paintings. Order details sent to email.",
    keywords: "order confirmed, purchase complete, order success",
    openGraph: {
      title: "Order Confirmed | Artace Studio",
      description: "Thank you for your purchase!",
      url: "https://artacestudio.com/checkout/success",
    },
    twitter: {
      card: "summary_large_image",
      title: "Order Confirmed | Artace Studio",
      description: "Thank you for your purchase!",
    },
    robots: "no-index",
  });
}

import CheckoutSuccessPageClient from "./checkout-success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100svh] bg-[#fcfaf7] px-4 py-6 sm:px-6 sm:py-8 lg:px-[50px]">
          <section className="mx-auto w-full max-w-[1100px] rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_22px_60px_rgba(0,0,0,0.06)] md:p-10">
            <h1 className="font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[44px]">
              Checking your payment
            </h1>
            <p className="mt-4 text-[16px] leading-[1.75] text-[#5b5b5b] md:text-[18px]">
              Loading your order status…
            </p>
          </section>
        </main>
      }
    >
      <CheckoutSuccessPageClient />
    </Suspense>
  );
}