import type { Metadata } from "next";

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: "Secure Checkout | Buy Paintings | Artace Studio",
    description: "Complete your purchase securely. Buy paintings with Razorpay payment gateway. Fast and secure checkout.",
    keywords: "checkout, buy paintings, secure payment, Razorpay checkout",
    openGraph: {
      title: "Secure Checkout | Buy Paintings | Artace Studio",
      description: "Complete your purchase securely.",
      url: "https://artacestudio.com/checkout",
    },
    twitter: {
      card: "summary_large_image",
      title: "Secure Checkout | Artace Studio",
      description: "Complete your purchase securely.",
    },
    robots: "no-index",
  });
}

import CheckoutPageClient from "./checkout-client";

export default CheckoutPageClient;