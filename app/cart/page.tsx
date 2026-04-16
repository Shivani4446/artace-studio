import type { Metadata } from "next";

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: "Shopping Cart | Art Checkout | Artace Studio",
    description: "Review your selected artworks in your cart. Continue shopping or proceed to secure checkout to complete your purchase.",
    keywords: "shopping cart, art checkout, cart review, artwork cart",
    openGraph: {
      title: "Shopping Cart | Art Checkout | Artace Studio",
      description: "Review your selected artworks in your cart.",
      url: "https://artacestudio.com/cart",
    },
    twitter: {
      card: "summary_large_image",
      title: "Shopping Cart | Artace Studio",
      description: "Review your selected artworks.",
    },
    robots: "no-index",
  });
}

import CartPageClient from "./cart-client";

export default CartPageClient;