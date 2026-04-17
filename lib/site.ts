const DEFAULT_SITE_URL = "https://artacestudio.com";

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const normalizeSiteOrigin = (value: string) => {
  const trimmed = trimTrailingSlashes(value.trim());

  try {
    const normalized = new URL(trimmed);

    if (normalized.hostname === "api.artacestudio.com") {
      normalized.hostname = "artacestudio.com";
    }

    return trimTrailingSlashes(normalized.origin);
  } catch {
    return DEFAULT_SITE_URL;
  }
};

export const getSiteOrigin = () => {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_SITE_URL;

  return normalizeSiteOrigin(raw);
};

export const buildSiteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteOrigin()}${normalizedPath}`;
};

export const toAbsoluteImageUrl = (value: string | null | undefined) => {
  if (!value) return buildSiteUrl("/artace-studio-home-page-og-image.webp");
  if (/^https?:\/\//i.test(value)) return value;
  return buildSiteUrl(value);
};
