import type { Metadata } from "next";
import { buildSiteUrl } from "@/lib/site";
import CartPageClient from "./cart-client";

export const metadata: Metadata = {
  title: "Shopping Cart | Samora by Artace Studio",
  description: "Review your handcrafted Samora picks and continue to secure checkout.",
  alternates: {
    canonical: buildSiteUrl("/samora/cart"),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default CartPageClient;
