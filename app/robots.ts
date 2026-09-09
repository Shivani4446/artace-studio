import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";

const DISALLOWED_PATHS: string[] = [
  "/account",
  "/cart",
  "/checkout",
  "/dashboard",
  "/api",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/wishlist",
  "/samora/wishlist",
  "/samora/cart",
  "/samora/checkout",
  "/samora/track-order",
];
const EXPLICIT_ALLOWED_BOTS = [
  "Googlebot",
  "Bingbot",
  "PerplexityBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot",
  "AhrefsBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...EXPLICIT_ALLOWED_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
