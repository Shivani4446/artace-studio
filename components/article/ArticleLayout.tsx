import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TocItem } from "@/utils/article";
import ArticleTocHighlighter from "./ArticleTocHighlighter";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { decodeHtmlEntities } from "@/utils/text";

type Props = {
  eyebrow?: string;
  title?: string;
  titleHtml?: string;
  intro?: string;
  introHtml?: string;
  lastUpdated?: string;
  readTimeMinutes?: number;
  toc: TocItem[];
  contentHtml: string;
  author?: {
    name?: string;
    description?: string;
    avatar_urls?: Record<string, string>;
  } | null;
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://artacestudio.com";
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
    const imageUrl = primaryImage?.src || "/images/product-ship.png";
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
    const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");

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

const ArticleLayout = async ({
  eyebrow,
  title,
  titleHtml,
  intro,
  introHtml,
  lastUpdated,
  readTimeMinutes,
  toc,
  contentHtml,
  author,
}: Props) => {
  const products = await getFeaturedProducts();

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-6 pb-6 pt-12 md:px-10 md:pb-10 md:pt-16 lg:px-14 lg:pb-12 lg:pt-20">
      <div className="md:grid md:grid-cols-[248px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
        <div className="hidden md:block" />

        <header className="max-w-[760px]">
          {eyebrow && (
            <p className="font-inter text-[14px] leading-[1.5] tracking-[0.01em] text-[#65635d] md:text-[15px]">
              {eyebrow}
            </p>
          )}

          {titleHtml ? (
            <h1
              className="mt-3 font-display text-[52px] leading-[1.04] tracking-[-0.015em] text-[#1c1d1f]"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          ) : (
            <h1 className="mt-3 font-display text-[52px] leading-[1.04] tracking-[-0.015em] text-[#1c1d1f]">
              {title}
            </h1>
          )}

          {introHtml ? (
            <div
              className="article-intro mt-8 max-w-[690px]"
              dangerouslySetInnerHTML={{ __html: introHtml }}
            />
          ) : intro ? (
            <div className="article-intro mt-8 max-w-[690px]">
              <p>{intro}</p>
            </div>
          ) : null}

          {(lastUpdated || readTimeMinutes) && (
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#6b6962] md:text-[15px]">
              {lastUpdated && <span>Last Updated: {lastUpdated}</span>}
              {lastUpdated && readTimeMinutes ? (
                <span className="text-[#96948f]">&middot;</span>
              ) : null}
              {readTimeMinutes ? <span>{readTimeMinutes} min read</span> : null}
            </div>
          )}
        </header>
      </div>

      <div className="mt-16 md:mt-20 md:grid md:grid-cols-[248px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
        {toc.length > 0 ? (
          <ArticleTocHighlighter toc={toc} />
        ) : (
          <div className="hidden md:block" />
        )}

        <article
          className="article-content max-w-[760px] first-h2-aligned"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </section>

    {/* Author Section */}
    {author && (
      <div className="md:grid md:grid-cols-[248px_minmax(0,1fr)] pb-10 md:gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="hidden md:block" />
        <div className="max-w-[760px]">
          <div className="bg-[#FAF9F6] rounded-2xl p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-5">
              {author.avatar_urls?.["96"] && (
                <img
                  src={author.avatar_urls["96"]}
                  alt={author.name || "Author"}
                  className="w-14 h-14 rounded-full object-cover"
                />
              )}

              <div>
                <p className="font-display text-[22px] text-[#1c1d1f]">
                  {author.name || "Artace Studio Team"}
                </p>
                <p className="text-[15px] text-[#65635d]">
                  {author.description || "Contributor at Artace Studio"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Featured Products Section */}
    <section className="bg-[#0F0F0F] py-16 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="font-playfair text-[40px] md:text-[52px] text-white">
            Shop Authentic Handmade Paintings
          </h2>

          <Link
            href="/shop"
            className="group flex items-center gap-3 font-inter text-white text-lg font-medium hover:text-gray-300 transition-colors"
          >
            Explore all
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.length === 0 ? (
            <p className="font-inter col-span-full text-sm text-[#999999] text-center">
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
                  <div className="relative mb-4 w-full aspect-square overflow-hidden rounded-[12px] bg-gray-800">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="font-inter text-[14px] text-[#999999]">
                      {product.categoryLabel}
                    </p>
                    <h3 className="font-playfair text-[18px] text-white leading-snug">
                      {product.title}
                    </h3>
                    <p className="font-inter text-[14px] text-[#999999]">
                      {product.subtitle}
                    </p>
                    {product.price && (
                      <p className="font-inter text-[16px] text-white mt-2">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative z-20 mt-4 translate-y-1 opacity-0 transition-all duration-300 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto">
                  <AddToCartButton
                    id={product.id}
                    title={product.title}
                    image={product.image}
                    subtitle={product.subtitle}
                    price={product.price ?? undefined}
                    className="self-start"
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  </>);
};

export default ArticleLayout;
