import type { MetadataRoute } from "next";

const DEFAULT_BASE_URL = "https://www.artacestudio.com";
const DEFAULT_WP_JSON_PREFIX = "/wp-json";
const REVALIDATE_SECONDS = 60 * 60; // 1 hour

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const normalizeBaseUrl = (value: string) => {
  const trimmed = trimTrailingSlashes(value.trim());

  try {
    const normalized = new URL(trimmed);

    if (normalized.hostname === "api.artacestudio.com") {
      normalized.hostname = "www.artacestudio.com";
    }

    if (normalized.hostname === "artacestudio.com") {
      normalized.hostname = "www.artacestudio.com";
    }

    return trimTrailingSlashes(normalized.origin);
  } catch {
    return trimmed;
  }
};

const getBaseUrl = () => {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_BASE_URL;

  return normalizeBaseUrl(raw);
};

const getWooApiOrigin = () => {
  const raw =
    process.env.WOOCOMMERCE_REST_URL ||
    process.env.WORDPRESS_API_URL ||
    process.env.WORDPRESS_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_BASE_URL;

  return trimTrailingSlashes(raw.trim());
};

const getWpJsonPrefix = () => {
  const raw = (process.env.WOOCOMMERCE_WP_JSON_PREFIX || DEFAULT_WP_JSON_PREFIX).trim();
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return trimTrailingSlashes(normalized);
};

const toBase64 = (value: string) => {
  if (typeof btoa === "function") return btoa(value);

  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string, enc?: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(value, "utf8").toString("base64");

  throw new Error("No base64 encoder available.");
};

const getWooAuthHeaders = () => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const headers: Record<string, string> = {};
  if (!consumerKey || !consumerSecret) return headers;

  headers.Authorization = `Basic ${toBase64(`${consumerKey}:${consumerSecret}`)}`;
  return headers;
};

async function fetchWooJson<T>(path: string, params: Record<string, string | number>) {
  try {
    const url = new URL(`${getWooApiOrigin()}${getWpJsonPrefix()}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString(), {
      headers: getWooAuthHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getAllProducts() {
  const products: Array<{ slug?: string; date_modified?: string; date_modified_gmt?: string }> = [];
  const perPage = 100;

  let page = 1;
  while (true) {
    const data = await fetchWooJson<unknown>(`/wc/v3/products`, {
      per_page: perPage,
      page,
      orderby: "date",
      order: "desc",
      status: "publish",
    });

    if (!Array.isArray(data) || data.length === 0) break;

    products.push(
      ...(data as Array<{ slug?: string; date_modified?: string; date_modified_gmt?: string }>)
    );

    if (data.length < perPage) break;
    page += 1;
  }

  return products;
}

async function getAllCategories() {
  const data = await fetchWooJson<unknown>(`/wc/v3/products/categories`, { per_page: 100 });
  if (!Array.isArray(data)) return [];
  return data as Array<{ slug?: string; date_modified?: string; date_modified_gmt?: string }>;
}

const safeDate = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/exhibition`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/corporate-bulk-orders`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...products
      .map((product): MetadataRoute.Sitemap[number] | null => {
        const slug = (product.slug || "").trim();
        if (!slug) return null;
        return {
          url: `${baseUrl}/shop/${encodeURIComponent(slug)}`,
          lastModified: safeDate(product.date_modified_gmt) || safeDate(product.date_modified),
          changeFrequency: "daily" as const,
          priority: 0.8,
        };
      })
      .filter((entry): entry is MetadataRoute.Sitemap[number] => entry !== null),
    ...categories
      .map((category): MetadataRoute.Sitemap[number] | null => {
        const slug = (category.slug || "").trim();
        if (!slug) return null;
        return {
          url: `${baseUrl}/collections/${encodeURIComponent(slug)}`,
          lastModified:
            safeDate(category.date_modified_gmt) || safeDate(category.date_modified) || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      })
      .filter((entry): entry is MetadataRoute.Sitemap[number] => entry !== null),
  ];
}
