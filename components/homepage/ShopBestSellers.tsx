import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { ArrowRight } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { decodeHtmlEntities } from "@/utils/text";

// Font Configuration
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const FEATURED_PRODUCTS_LIMIT = 4;

type WooStorePrices = {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
};

type WooStoreImage = {
  id: number;
  src: string;
  alt?: string;
  thumbnail?: string;
};

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
};

type WooStoreAttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

type WooStoreAttribute = {
  id: number;
  name: string;
  terms?: WooStoreAttributeTerm[];
  options?: string[];
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  attributes?: WooStoreAttribute[];
  prices: WooStorePrices;
};

type FeaturedProductCard = {
  id: number;
  slug: string;
  title: string;
  sizesLabel: string;
  image: string;
  alt: string;
  categoryLabel: string;
  subtitle: string;
  price: number | null;
};

const parseMinorUnitPrice = (
  rawValue: string | undefined,
  minorUnit: number
): number | null => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
};

const getAttributeOptions = (attribute: WooStoreAttribute) => {
  const optionsFromList = attribute.options ?? [];
  const optionsFromTerms = (attribute.terms ?? []).map((term) => term.name);
  return Array.from(
    new Set(
      [...optionsFromList, ...optionsFromTerms]
        .map((value) => decodeHtmlEntities(value).trim())
        .filter(Boolean)
    )
  );
};

const getSizesLabel = (attributes: WooStoreAttribute[] | undefined) => {
  const sizeOptions = (attributes ?? [])
    .filter((attribute) => /size|dimension/i.test(attribute.name))
    .flatMap(getAttributeOptions);

  const uniqueSizeOptions = Array.from(new Set(sizeOptions));
  if (uniqueSizeOptions.length === 0) return "Custom Sizes";
  return `${uniqueSizeOptions.length} Size${uniqueSizeOptions.length === 1 ? "" : "s"}`;
};

const normalizeFeaturedProducts = (
  products: WooStoreProduct[]
): FeaturedProductCard[] => {
  return products.slice(0, FEATURED_PRODUCTS_LIMIT).map((product) => {
    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const primaryImage = product.images?.[0];
    const imageUrl = primaryImage?.src || FALLBACK_PRODUCT_IMAGE;
    const title = decodeHtmlEntities(product.name);
    const categoryLabel = decodeHtmlEntities(
      product.categories?.[0]?.name || "Handmade Painting"
    );
    const sizesLabel = getSizesLabel(product.attributes);
    const subtitle = `Handmade Painting | ${sizesLabel} | Acrylic Colors on Canvas`;

    return {
      id: product.id,
      slug: product.slug,
      title,
      sizesLabel,
      image: imageUrl,
      alt: decodeHtmlEntities(primaryImage?.alt || title),
      categoryLabel,
      subtitle,
      price: parseMinorUnitPrice(product.prices?.price, minorUnit),
    };
  });
};

const getFeaturedProducts = async (): Promise<FeaturedProductCard[]> => {
  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
    const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${normalizedBaseUrl}/wp-json/wc/store/v1/products?featured=true&per_page=${FEATURED_PRODUCTS_LIMIT}`,
      {
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(payload)) return [];

    return normalizeFeaturedProducts(payload);
  } catch {
    return [];
  }
};

const ShopBestsellers = async () => {
  const products = await getFeaturedProducts();

  return (
    <section
      className={`bg-[#FAF9F6] py-14 md:py-20 ${playfair.variable} ${inter.variable}`}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-center md:justify-between">
          <h2 className="font-playfair text-3xl text-[#2C2C2C] uppercase tracking-wide md:text-5xl">
            Shop Bestsellers
          </h2>

          <Link
            href="/shop"
            className="group flex items-center gap-2 font-inter text-[#4A4846] text-sm font-medium border-b border-[#4A4846] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            SHOP ALL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-12">
          {products.length === 0 ? (
            <p className="font-inter col-span-full text-sm text-[#666666]">
              No featured products available right now.
            </p>
          ) : (
            products.map((product) => (
              <article key={product.id} className="group relative flex flex-col">
                <Link
                  href={`/shop/${product.slug}`}
                  aria-label={`Open ${product.title}`}
                  className="absolute inset-0 z-10"
                />

                <div className="relative z-0">
                  {/* Image Container */}
                  <div className="relative mb-3 w-full aspect-square overflow-hidden rounded-[10px] bg-gray-200 sm:mb-4 sm:rounded-[12px]">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col gap-1">
                    <p className="font-inter text-[12px] text-[#666666] sm:text-[14px]">
                      {product.categoryLabel}
                    </p>
                    <h3 className="font-playfair text-[15px] leading-snug text-[#2C2C2C] sm:text-[18px]">
                      {product.title}
                    </h3>
                    <p className="line-clamp-2 font-inter text-[12px] text-[#666666] sm:text-[14px]">
                      {product.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pointer-events-auto relative z-20 mt-3 translate-y-0 opacity-100 transition-all duration-300 sm:mt-4 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <AddToCartButton
                    id={product.id}
                    woocommerceProductId={product.id}
                    title={product.title}
                    image={product.image}
                    subtitle={product.subtitle}
                    className="origin-top-left scale-[0.88] self-start sm:scale-100"
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopBestsellers;
