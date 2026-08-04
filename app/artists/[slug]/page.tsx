import Image from "next/image";
import { notFound } from "next/navigation";
import { getArtistBySlug } from "@/lib/artists/data";
import { buildSiteUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import ArtistProductGrid, { type ArtistGridProduct } from "@/components/artists/ArtistProductGrid";

export const runtime = "edge";
export const revalidate = 120;

type ArtistPageProps = {
  params: Promise<{ slug: string }>;
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const PRODUCTS_PER_PAGE = 100;
const MAX_PAGES = 20; // safety cap — this store has well under 2000 products

type WooV3MetaDataItem = {
  key?: string;
  value?: unknown;
};

type WooV3Product = {
  id: number;
  slug: string;
  name: string;
  images?: Array<{ src?: string }>;
  price?: string;
  stock_status?: string;
  meta_data?: WooV3MetaDataItem[];
};

const getStoreApiBaseUrl = () =>
  (
    process.env.WORDPRESS_API_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    "https://api.artacestudio.com/"
  ).replace(/\/+$/, "");

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);

  const maybeBuffer = (
    globalThis as { Buffer?: { from: (v: string) => { toString: (enc: string) => string } } }
  ).Buffer;
  if (maybeBuffer) return maybeBuffer.from(raw).toString("base64");

  throw new Error("No base64 encoder available.");
};

// Which artist a product belongs to is read from WooCommerce's own "artist"
// custom field (wc/v3 meta_data) — the public wc/store/v1 API doesn't expose
// custom meta fields, so this uses the authenticated wc/v3 API instead, the
// same pattern already used server-side in app/shop/[slug]/page.tsx.
const fetchProductsPage = async (pageNumber: number): Promise<WooV3Product[]> => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return [];

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetch(
      `${getStoreApiBaseUrl()}/wp-json/wc/v3/products?per_page=${PRODUCTS_PER_PAGE}&page=${pageNumber}&status=publish`,
      {
        headers: { Authorization: `Basic ${basicToken}` },
        next: { revalidate },
      }
    );
    if (!response.ok) return [];
    return (await response.json()) as WooV3Product[];
  } catch {
    return [];
  }
};

// WooCommerce's REST API doesn't support filtering products by an arbitrary
// custom meta field's value, so the whole catalog is fetched and filtered
// here instead. Not a concern for a catalog this size (well under a
// thousand products), and this is cached for 2 minutes (revalidate above).
const fetchAllProducts = async (): Promise<WooV3Product[]> => {
  const allProducts: WooV3Product[] = [];

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber += 1) {
    const page = await fetchProductsPage(pageNumber);
    allProducts.push(...page);
    if (page.length < PRODUCTS_PER_PAGE) break;
  }

  return allProducts;
};

const getProductArtistName = (product: WooV3Product): string => {
  const artistMeta = product.meta_data?.find((meta) => meta.key === "artist");
  return typeof artistMeta?.value === "string" ? artistMeta.value.trim() : "";
};

const toArtistGridProduct = (product: WooV3Product): ArtistGridProduct | null => {
  if (product.stock_status && product.stock_status !== "instock") return null;

  const rawPrice = Number(product.price);
  const price = Number.isFinite(rawPrice) ? rawPrice : null;

  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
    price,
  };
};

export async function generateMetadata({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const artistUrl = buildSiteUrl(`/artists/${artist.slug}`);

  return {
    title: `${artist.name} | Artace Studio`,
    description: artist.tagline,
    alternates: {
      canonical: artistUrl,
    },
    openGraph: {
      title: artist.name,
      description: artist.tagline,
      url: artistUrl,
      images: [{ url: buildSiteUrl(artist.image) }],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const allProducts = await fetchAllProducts();
  const normalizedArtistName = artist.name.trim().toLowerCase();
  const artistProducts = allProducts.filter(
    (product) => getProductArtistName(product).toLowerCase() === normalizedArtistName
  );
  const products = artistProducts
    .map(toArtistGridProduct)
    .filter((product): product is ArtistGridProduct => product !== null);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
      <div className="grid gap-10 md:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] md:items-start">
        <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-full">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 240px, 320px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-display text-[32px] leading-[1.15] text-[#1f1f1f] md:text-[44px]">
            {artist.name}
          </h1>
          <p className="mt-2 text-[16px] text-[#666] md:text-[18px]">{artist.tagline}</p>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#3f3d37] md:text-[17px] md:leading-8">
            {artist.bio}
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-[24px] text-[#1f1f1f] md:text-[30px]">
          Available Paintings
        </h2>
        <div className="mt-6">
          <ArtistProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
