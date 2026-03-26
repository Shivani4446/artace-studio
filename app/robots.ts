import type { MetadataRoute } from "next";

const DEFAULT_BASE_URL = "https://your-domain.com";
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
];
const EXPLICIT_ALLOWED_BOTS = ["Google-Extended", "GPTBot", "ClaudeBot"] as const;

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const getBaseUrl = () => {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_BASE_URL;

  return trimTrailingSlashes(raw.trim());
};

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
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
