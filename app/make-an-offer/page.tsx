import type { Metadata } from "next";
import Link from "next/link";
import MakeAnOfferForm from "@/components/photography/MakeAnOfferForm";
import { decodeHtmlEntities } from "@/utils/text";

export const runtime = "edge";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

type MakeAnOfferPageProps = {
  searchParams: Promise<{ product?: string }>;
};

type WooStoreProductDetail = {
  id: number;
  slug: string;
  name: string;
  images?: Array<{ src?: string; alt?: string }>;
  prices: { price: string; currency_minor_unit: number; currency_symbol: string };
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchProductBySlug = async (slug: string): Promise<WooStoreProductDetail | null> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}&per_page=1`,
      { cache: "no-store" }
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as WooStoreProductDetail[];
    return Array.isArray(payload) ? payload[0] ?? null : null;
  } catch {
    return null;
  }
};

export const metadata: Metadata = {
  title: "Make an Offer | Artace Studio",
  description: "Submit your offer on an original photography print from Artace Studio.",
};

const MakeAnOfferPage = async ({ searchParams }: MakeAnOfferPageProps) => {
  const { product: slug } = await searchParams;
  const product = slug ? await fetchProductBySlug(slug) : null;

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[28px] text-[#1f1f1f]">
          We couldn&apos;t find that piece
        </h1>
        <p className="mt-3 text-[#5b5b5b]">
          The photograph you&apos;re looking for may no longer be available.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[#1f1f1f] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
        >
          Browse the Shop
        </Link>
      </main>
    );
  }

  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const rawPrice = Number(product.prices?.price);
  const price = Number.isFinite(rawPrice) ? rawPrice / 10 ** minorUnit : null;
  const image = product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE;
  const name = decodeHtmlEntities(product.name);

  return (
    <MakeAnOfferForm
      productId={product.id}
      productSlug={product.slug}
      productName={name}
      productImage={image}
      currencySymbol={product.prices?.currency_symbol || "₹"}
      listedPrice={price}
    />
  );
};

export default MakeAnOfferPage;
