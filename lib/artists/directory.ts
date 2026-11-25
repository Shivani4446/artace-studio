import React from "react";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";
import { ARTISTS, type Artist as LegacyArtist } from "./data";
import { ARTIST_DASHBOARD_URL } from "./dashboard";

/**
 * One merged artist directory, built from three sources (most authoritative
 * first):
 *
 * 1. The artist portal's public API (dashboard.artacestudio.com
 *    /api/public/artists) — curator-approved profiles: photo, bio, city…
 * 2. WordPress's `artist` product taxonomy — the portal creates a term for
 *    every approved artist and assigns each published painting to it. A term
 *    with at least one product makes the artist appear here even before
 *    their portal profile is approved.
 * 3. The hand-written profiles in ./data.ts — the original studio artists,
 *    whose products are linked through the older "artist" meta text field.
 *
 * All fetches go through Next's data cache (5 min) so this adds no per-visit
 * load on WordPress or the portal.
 */

const DIRECTORY_REVALIDATE_SECONDS = 300;
const DEFAULT_TAGLINE = "Original, hand-painted works available on Artace Studio.";
const DEFAULT_RECOGNITION = "Featured Artist — Artace Studio";
// Taxonomy terms that are not a person (the studio's own house label).
const NON_ARTIST_TERM_SLUGS = new Set(["artace-studio"]);

export type ArtistProfile = {
  slug: string;
  name: string;
  /** null when no photo has been approved yet — render a monogram. */
  image: string | null;
  tagline: string;
  bio: string;
  recognition: string;
  location?: string;
  /** WordPress `artist` taxonomy term id, when the artist has one. */
  termId?: number;
  /** Value of the legacy per-product "artist" meta field, for older artists. */
  legacyMetaName?: string;
};

type DashboardArtistSummary = {
  slug: string;
  name: string;
  shortBio: string;
  city: string;
  state: string;
  mediums: string[];
  photoUrl: string | null;
};

type DashboardArtist = DashboardArtistSummary & {
  longBio?: string;
  statement?: string;
  seo?: { title: string; description: string };
};

type WpArtistTerm = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  /** Photo set on the artist's WordPress profile — exposed by the
   * artace-artist-photo mu-plugin; undefined until that plugin is installed. */
  artace_photo?: string | null;
};

const getWordPressBaseUrl = () =>
  (
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    "https://api.artacestudio.com/"
  ).replace(/\/+$/, "");

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetchWithRetry(url, {
      next: { revalidate: DIRECTORY_REVALIDATE_SECONDS, tags: ["artists"] },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const fetchDashboardArtists = async (): Promise<DashboardArtistSummary[]> => {
  const payload = await fetchJson<{ artists?: DashboardArtistSummary[] }>(
    `${ARTIST_DASHBOARD_URL}/api/public/artists`
  );
  return Array.isArray(payload?.artists) ? payload.artists : [];
};

const fetchDashboardArtist = async (slug: string): Promise<DashboardArtist | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const payload = await fetchJson<{ artist?: DashboardArtist }>(
    `${ARTIST_DASHBOARD_URL}/api/public/artists/${slug}`
  );
  return payload?.artist ?? null;
};

const fetchArtistTerms = async (): Promise<WpArtistTerm[]> => {
  const payload = await fetchJson<WpArtistTerm[]>(
    `${getWordPressBaseUrl()}/wp-json/wp/v2/artist?per_page=100&_fields=id,name,slug,description,count,artace_photo`
  );
  return Array.isArray(payload) ? payload : [];
};

const fromLegacy = (artist: LegacyArtist): ArtistProfile => ({
  slug: artist.slug,
  name: artist.name,
  image: artist.image,
  tagline: artist.tagline,
  bio: artist.bio,
  recognition: artist.recognition,
  legacyMetaName: artist.name,
});

const formatLocation = (city?: string, state?: string) =>
  [city, state].map((part) => part?.trim()).filter(Boolean).join(", ") || undefined;

const firstSentence = (text: string) => {
  const match = text.match(/^(.{20,160}?[.!?])(\s|$)/);
  return match ? match[1] : text.slice(0, 160);
};

const mergeDashboardProfile = (
  base: ArtistProfile | undefined,
  dashboard: DashboardArtistSummary
): ArtistProfile => {
  const shortBio = dashboard.shortBio?.trim();
  return {
    ...base,
    slug: dashboard.slug,
    name: dashboard.name || base?.name || dashboard.slug,
    image: safePhotoUrl(dashboard.photoUrl) || base?.image || null,
    tagline: shortBio ? firstSentence(shortBio) : base?.tagline || DEFAULT_TAGLINE,
    bio: shortBio || base?.bio || "",
    recognition: base?.recognition || DEFAULT_RECOGNITION,
    location: formatLocation(dashboard.city, dashboard.state) ?? base?.location,
  };
};

const termToProfile = (term: WpArtistTerm): ArtistProfile => {
  const description = stripHtmlAndDecode(term.description || "").trim();
  return {
    slug: term.slug,
    name: decodeHtmlEntities(term.name),
    image: safePhotoUrl(term.artace_photo),
    tagline: description ? firstSentence(description) : DEFAULT_TAGLINE,
    bio: description,
    recognition: DEFAULT_RECOGNITION,
    termId: term.id,
  };
};

const normalizeName = (name: string) => name.trim().toLowerCase();

// next/image throws on hosts missing from next.config.ts images.remotePatterns,
// which would crash the whole page — drop photos hosted anywhere else.
const ALLOWED_PHOTO_HOSTS = new Set([
  "artacestudio.com",
  "api.artacestudio.com",
  "i0.wp.com",
  "i1.wp.com",
  "i2.wp.com",
]);
const safePhotoUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_PHOTO_HOSTS.has(parsed.hostname) ? url : null;
  } catch {
    return null;
  }
};

export const getAllArtists = React.cache(async (): Promise<ArtistProfile[]> => {
  const [dashboardArtists, terms] = await Promise.all([
    fetchDashboardArtists(),
    fetchArtistTerms(),
  ]);

  const bySlug = new Map<string, ArtistProfile>();
  for (const legacy of ARTISTS) bySlug.set(legacy.slug, fromLegacy(legacy));

  // Terms: attach term ids to known artists; add new artists only once they
  // have at least one published painting (skips empty/placeholder terms like
  // "Artace Studio").
  const legacyByName = new Map(ARTISTS.map((a) => [normalizeName(a.name), a.slug]));
  for (const term of terms) {
    if (NON_ARTIST_TERM_SLUGS.has(term.slug)) continue;
    const existingSlug = bySlug.has(term.slug)
      ? term.slug
      : legacyByName.get(normalizeName(decodeHtmlEntities(term.name)));
    if (existingSlug) {
      const existing = bySlug.get(existingSlug)!;
      bySlug.set(existingSlug, {
        ...existing,
        termId: term.id,
        // A photo set in WordPress replaces the bundled placeholder image.
        image: safePhotoUrl(term.artace_photo) || existing.image,
      });
    } else if ((term.count ?? 0) > 0) {
      bySlug.set(term.slug, termToProfile(term));
    }
  }

  for (const dashboard of dashboardArtists) {
    if (!dashboard?.slug) continue;
    bySlug.set(dashboard.slug, mergeDashboardProfile(bySlug.get(dashboard.slug), dashboard));
  }

  // Original studio artists first (stable homepage order), then everyone
  // else alphabetically.
  const legacySlugs = ARTISTS.map((a) => a.slug);
  return Array.from(bySlug.values()).sort((a, b) => {
    const ai = legacySlugs.indexOf(a.slug);
    const bi = legacySlugs.indexOf(b.slug);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    return a.name.localeCompare(b.name);
  });
});

/** Full profile for the artist page — includes the portal's long bio. */
export const getArtistBySlug = React.cache(
  async (slug: string): Promise<ArtistProfile | undefined> => {
    const artists = await getAllArtists();
    const artist = artists.find((a) => a.slug === slug);
    if (!artist) return undefined;

    const detail = await fetchDashboardArtist(slug);
    if (!detail) return artist;

    const longBio = [detail.longBio, detail.statement]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join("\n\n");
    return { ...artist, bio: longBio || artist.bio };
  }
);

/**
 * The artist for one product: its `artist` taxonomy term first (set by the
 * portal), then the legacy "artist" meta text (older products).
 */
export const getArtistForProduct = async (
  productId: number,
  legacyMetaName?: string
): Promise<ArtistProfile | undefined> => {
  const [artists, terms] = await Promise.all([
    getAllArtists(),
    fetchJson<WpArtistTerm[]>(
      `${getWordPressBaseUrl()}/wp-json/wp/v2/artist?post=${productId}&_fields=id,name,slug,artace_photo`
    ),
  ]);

  const term = Array.isArray(terms)
    ? terms.find((t) => !NON_ARTIST_TERM_SLUGS.has(t.slug))
    : undefined;
  if (term) {
    const match =
      artists.find((a) => a.termId === term.id) ?? artists.find((a) => a.slug === term.slug);
    // A term with no directory entry yet (e.g. count not refreshed) still
    // gets a basic profile so the product shows its artist.
    return match ?? termToProfile(term);
  }

  if (legacyMetaName) {
    const normalized = normalizeName(legacyMetaName);
    return artists.find(
      (a) => a.legacyMetaName && normalizeName(a.legacyMetaName) === normalized
    );
  }

  return undefined;
};

// ---------------------------------------------------------------- products

export type ArtistProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number | null;
};

type StoreProduct = {
  id: number;
  slug: string;
  name: string;
  is_in_stock?: boolean;
  images?: Array<{ src?: string }>;
  prices?: { price?: string; currency_minor_unit?: number };
};

type V3Product = {
  id: number;
  meta_data?: Array<{ key?: string; value?: unknown }>;
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const ARTIST_PRODUCTS_LIMIT = 100;

const toBasicAuthToken = (username: string, password: string) => btoa(`${username}:${password}`);

const toArtistProduct = (product: StoreProduct): ArtistProduct | null => {
  if (product.is_in_stock === false) return null;
  const minor = product.prices?.currency_minor_unit ?? 2;
  const raw = Number(product.prices?.price);
  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
    price: Number.isFinite(raw) ? raw / 10 ** minor : null,
  };
};

// Product ids for an artist via the `artist` taxonomy (public wp/v2, one
// cheap, cacheable request).
const fetchTermProductIds = async (termId: number): Promise<number[]> => {
  const payload = await fetchJson<Array<{ id: number }>>(
    `${getWordPressBaseUrl()}/wp-json/wp/v2/product?artist=${termId}&per_page=${ARTIST_PRODUCTS_LIMIT}&_fields=id&status=publish`
  );
  return Array.isArray(payload) ? payload.map((p) => p.id).filter(Number.isInteger) : [];
};

// Legacy artists' products are linked only by the "artist" meta text field,
// which no public API can filter on, so this pages through wc/v3 with
// `_fields` trimmed to id + meta. Only runs for the original studio artists.
// TODO: once those products are assigned to `artist` terms in WordPress, this
// can be deleted.
const fetchLegacyMetaProductIds = async (legacyMetaName: string): Promise<number[]> => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return [];

  const normalized = normalizeName(legacyMetaName);
  const ids: number[] = [];
  const perPage = 100;
  for (let page = 1; page <= 20; page += 1) {
    let batch: V3Product[] = [];
    try {
      const response = await fetchWithRetry(
        `${getWordPressBaseUrl()}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}&status=publish&_fields=id,meta_data`,
        {
          headers: { Authorization: `Basic ${toBasicAuthToken(consumerKey, consumerSecret)}` },
          next: { revalidate: DIRECTORY_REVALIDATE_SECONDS, tags: ["artists"] },
        }
      );
      if (!response.ok) break;
      const payload = (await response.json()) as V3Product[];
      batch = Array.isArray(payload) ? payload : [];
    } catch {
      break;
    }
    for (const product of batch) {
      const meta = product.meta_data?.find((m) => m.key === "artist");
      if (typeof meta?.value === "string" && normalizeName(meta.value) === normalized) {
        ids.push(product.id);
      }
    }
    if (batch.length < perPage) break;
  }
  return ids;
};

export const getArtistProducts = async (artist: ArtistProfile): Promise<ArtistProduct[]> => {
  const [termIds, legacyIds] = await Promise.all([
    artist.termId ? fetchTermProductIds(artist.termId) : Promise.resolve([]),
    artist.legacyMetaName ? fetchLegacyMetaProductIds(artist.legacyMetaName) : Promise.resolve([]),
  ]);
  const ids = Array.from(new Set([...termIds, ...legacyIds])).slice(0, ARTIST_PRODUCTS_LIMIT);
  if (ids.length === 0) return [];

  const products = await fetchJson<StoreProduct[]>(
    `${getWordPressBaseUrl()}/wp-json/wc/store/v1/products?include=${ids.join(",")}&per_page=${ids.length}&orderby=date&order=desc`
  );
  return (Array.isArray(products) ? products : [])
    .map(toArtistProduct)
    .filter((p): p is ArtistProduct => p !== null);
};
