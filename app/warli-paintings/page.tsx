import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Palette, Heart, Leaf, Sparkles, Globe2 } from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import AddToCartButton from "@/components/cart/AddToCartButton";

export const metadata: Metadata = {
  title: "Warli Paintings Online | Handcrafted Tribal Art | Artace Studio",
  description:
    "Discover authentic Warli paintings handcrafted by skilled artisans. Shop original Warli canvas art or commission custom pieces. Free shipping across India.",
  keywords:
    "warli paintings, tribal art, handcrafted canvas, Warli art India, custom warli paintings, Maharashtra tribal art",
  alternates: {
    canonical: "/warli-paintings",
  },
  openGraph: {
    title: "Warli Paintings Online | Handcrafted Tribal Art | Artace Studio",
    description:
      "Discover authentic Warli paintings handcrafted by skilled artisans. Shop original Warli canvas art or commission custom pieces.",
    url: "/warli-paintings",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/warli-og-image.webp"),
        width: 1200,
        height: 630,
        alt: "Handcrafted Warli paintings from Artace Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warli Paintings Online | Handcrafted Tribal Art",
    description: "Discover authentic Warli paintings handcrafted by skilled artisans.",
    images: [buildSiteUrl("/warli-og-image.webp")],
  },
};

const WARLI_CATEGORY_SLUG = "warli-paintings";
const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const STOREFRONT_REVALIDATE_SECONDS = 60;

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
};

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  prices: WooStorePrices;
};

type WarliProductCard = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  currencyCode: string;
  currencySymbol: string;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchWarliProducts = async (): Promise<WarliProductCard[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?category=${WARLI_CATEGORY_SLUG}&per_page=12`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(products)) return [];

    return products.map((product) => {
      const minorUnit = product.prices?.currency_minor_unit ?? 2;
      const numericPrice = product.prices?.price
        ? Number(product.prices.price) / 10 ** minorUnit
        : null;

      return {
        id: product.id,
        slug: product.slug,
        name: decodeHtmlEntities(product.name),
        image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
        imageAlt: decodeHtmlEntities(
          product.images?.[0]?.alt || product.images?.[0]?.name || product.name
        ),
        price: numericPrice,
        currencyCode: product.prices?.currency_code || "INR",
        currencySymbol: product.prices?.currency_symbol || "Rs. ",
      };
    });
  } catch {
    return [];
  }
};

const formatPrice = (value: number | null, currencyCode: string, currencySymbol: string) => {
  if (value === null) return "Price on Request";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const whyWarliItems = [
  {
    icon: Palette,
    title: "Handcrafted by Artisans",
    description:
      "Each piece is individually hand-painted by skilled Warli artists, preserving traditional techniques passed down through generations.",
  },
  {
    icon: Heart,
    title: "Cultural Heritage",
    description:
      "With roots dating back 2,500+ years, Warli art represents one of India&apos;s oldest tribal art forms—authentic cultural legacy in your home.",
  },
  {
    icon: Leaf,
    title: "Sustainable & Natural",
    description:
      "Traditional Warli uses natural pigments and eco-friendly practices. Modern canvas versions maintain the same earthy, sustainable approach.",
  },
  {
    icon: Sparkles,
    title: "Timeless Aesthetic",
    description:
      "The minimalist geometric language of Warli—circles, triangles, and lines—complements both modern interiors and traditional spaces.",
  },
  {
    icon: Globe2,
    title: "Unique Conversation Starter",
    description:
      "Stand out with art that tells a story. Warli paintings spark conversations about heritage, tradition, and the beauty of simplicity.",
  },
];

const WarliPage = async () => {
  const products = await fetchWarliProducts();
  const featuredProducts = products.slice(0, 4);

  const warliSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${buildSiteUrl("/warli-paintings")}#webpage`,
        url: buildSiteUrl("/warli-paintings"),
        name: "Warli Paintings | Handcrafted Tribal Art",
        description:
          "Discover authentic Warli paintings handcrafted by skilled artisans. Shop original Warli canvas art or commission custom pieces.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${buildSiteUrl("/warli-paintings")}#itemlist`,
        url: buildSiteUrl("/warli-paintings"),
        numberOfItems: products.length,
        itemListElement: featuredProducts.slice(0, 6).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSiteUrl(`/shop/${product.slug}`),
          name: product.name,
          image: toAbsoluteImageUrl(product.image),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(warliSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-[#5D4037]">
          <div className="relative h-[85vh] min-h-[580px] w-full md:h-[90vh] md:min-h-[680px]">
            <div className="absolute inset-0">
              <Image
                src="/warli-painitng-hero.webp"
                alt="Warli painting hero image"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0" />
            </div>

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-center px-6 py-16 md:px-12 md:py-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[18px] font-medium leading-[1.2] text-[#F5F5DC] md:text-[22px]">
                  Ancient Tribal Art, Timeless Beauty
                </p>
                <h1 className="mt-4 font-display text-[38px] font-semibold leading-[1.08] sm:text-[44px] md:mt-5 md:text-[52px] lg:text-[60px]">
                  Warli Paintings
                </h1>
                <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-white/85 md:text-[20px] md:leading-[1.6]">
                  Bring home the ancient art of the Warli tribe from Maharashtra.
                  Handcrafted on canvas with natural pigments, each painting tells a
                  story of nature, community, and traditions dating back 2,500 years.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#warli-collection"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#F5F5DC] px-8 py-4 text-[17px] font-medium text-[#5D4037] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    Explore Collection
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/custom-order"
                    className="inline-flex w-full items-center justify-center rounded-md border border-white/60 bg-transparent px-8 py-4 text-[17px] font-medium text-white transition-transform hover:bg-white/10 sm:w-auto md:text-[18px]"
                  >
                    Commission Custom Warli
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: About Warli Paintings */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-[80px]">
              <div className="relative order-2 lg:order-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#d6d2ca]">
                  <Image
                    src="/warli-painting-2.webp"
                    alt="Warli painting traditional art form"
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-[12px] bg-[#F5F5DC] p-5 shadow-lg md:-bottom-8 md:-left-8 md:p-6">
                  <p className="font-display text-[28px] font-semibold text-[#5D4037] md:text-[36px]">
                    2,500+
                  </p>
                  <p className="text-sm text-[#5D4037]/70 md:text-base">Years of Heritage</p>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="text-[16px] font-medium uppercase tracking-[0.1em] text-[#8B4513] md:text-[18px]">
                  About Warli Art
                </p>
                <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#313131] sm:text-[36px] md:mt-4 md:text-[42px]">
                  One of India's Oldest Tribal Art Forms
                </h2>
                <div className="mt-6 space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-8 md:text-[18px] md:leading-[1.65]">
                  <p>
                    Warli painting is a traditional mural art form practiced by the Warli
                    tribe of Maharashtra, India. Dating back over 2,500 years, these
                    paintings were traditionally created on mud walls using a white
                    pigment made from rice flour paste.
                  </p>
                  <p>
                    The distinctive style features geometric shapes—circles, triangles,
                    and lines—that represent nature, animals, and daily life. Unlike
                    other Indian art forms, Warli focuses on simplicity and the harmony
                    between humans and their environment.
                  </p>
                  <p>
                    Today, Warli art has evolved onto canvas while maintaining its
                    authenticity. At Artace Studio, we work with skilled Warli artists
                    who continue this rich tradition, bringing ancient tribal heritage
                    into modern homes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Why Warli Art */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[16px] font-medium uppercase tracking-[0.1em] text-[#8B4513] md:text-[18px]">
                Why Choose Warli Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#313131] sm:text-[38px] md:mt-4 md:text-[48px]">
                The Timeless Appeal of Tribal Heritage
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-[#5b5b5b] md:mt-6 md:text-[18px]">
                Warli art isn&apos;t just decoration—it&apos;s a connection to ancient traditions
                and a statement of mindful, meaningful aesthetics.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 md:mt-14">
              {whyWarliItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`why-warli-${index}`}
                    className="group rounded-[16px] border border-black/8 bg-white p-6 transition-shadow hover:shadow-lg md:p-8"
                  >
                    <div className="mb-5 inline-flex rounded-[12px] bg-[#F5F5DC] p-3 md:mb-6">
                      <Icon className="h-6 w-6 text-[#8B4513]" />
                    </div>
                    <h3 className="font-display text-[20px] font-semibold leading-[1.2] text-[#313131] md:text-[24px]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[16px]">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Featured Collection */}
        <section id="warli-collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[16px] font-medium uppercase tracking-[0.1em] text-[#8B4513] md:text-[18px]">
                  Featured Collection
                </p>
                <h2 className="mt-2 font-display text-[32px] font-semibold leading-[1.1] text-[#313131] sm:text-[38px] md:mt-3 md:text-[48px]">
                  Shop Warli Paintings
                </h2>
                <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                  Hand-painted by skilled Warli artists, ready to transform your space.
                </p>
              </div>

              <Link
                href={`/collections/${WARLI_CATEGORY_SLUG}`}
                className="inline-flex items-center gap-3 self-start border-b border-[#313131] pb-1 text-[16px] uppercase tracking-[0.06em] text-[#313131] transition-colors hover:text-[#8B4513] md:text-[18px]"
              >
                View All
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
                {featuredProducts.map((product) => (
                  <article key={product.id} className="group relative flex flex-col">
                    <Link
                      href={`/shop/${product.slug}`}
                      aria-label={`View ${product.name}`}
                      className="absolute inset-0 z-10"
                    />

                    <div className="relative z-0">
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
                        <Image
                          src={product.image || FALLBACK_PRODUCT_IMAGE}
                          alt={product.imageAlt || product.name}
                          fill
                          sizes="(max-width: 767px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-display text-[15px] leading-snug text-[#2c2c2c] sm:text-[18px] md:text-[20px]">
                          {product.name}
                        </h3>
                        <p className="text-[14px] text-[#5b5b5b] sm:text-[15px] md:text-[16px]">
                          {formatPrice(product.price, product.currencyCode, product.currencySymbol)}
                        </p>
                      </div>
                    </div>

                    <div className="pointer-events-auto relative z-20 mt-4 translate-y-0 opacity-100 transition-all duration-300 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      <AddToCartButton
                        id={product.id}
                        woocommerceProductId={product.id}
                        title={product.name}
                        image={product.image || FALLBACK_PRODUCT_IMAGE}
                        subtitle="Handmade Warli Painting"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No Warli paintings available at the moment. Check back soon or
                  <Link href="/custom-order" className="text-[#8B4513] underline">
                    {" "}
                    commission a custom piece
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: CTA - Shop Warli Art */}
        <section className="bg-[#8B4513] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <h2 className="font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Bring Ancient Art Into Your Home
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/80 md:mt-5 md:text-[18px]">
                  Explore our curated collection of authentic Warli paintings, each
                  handcrafted to bring warmth and heritage to your space.
                </p>
              </div>

              <Link
                href={`/collections/${WARLI_CATEGORY_SLUG}`}
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#8B4513] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
              >
                Browse All Warli Art
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 6: CTA - Custom Warli Commissions */}
        <section className="bg-[#5D4037] py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-[80px]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#4a3728]">
                <Image
                  src="/warli-painting-1.webp"
                  alt="Custom Warli painting commission"
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037]/60 via-transparent to-transparent" />
              </div>

              <div className="text-white">
                <p className="text-[16px] font-medium uppercase tracking-[0.1em] text-[#F5F5DC] md:text-[18px]">
                  Custom Commissions
                </p>
                <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Own a One-of-a-Kind Warli Masterpiece
                </h2>
                <p className="mt-5 text-[16px] leading-[1.65] text-white/80 md:mt-6 md:text-[18px]">
                  Work directly with our Warli artists to create a custom piece tailored
                  to your vision. Whether you want a specific size, theme, or color
                  palette—we&apos;ll bring your vision to life.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="/custom-order"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#F5F5DC] px-8 py-4 text-[17px] font-medium text-[#5D4037] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    Start Your Commission
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/contact-us"
                    className="inline-flex w-full items-center justify-center rounded-md border border-white/60 bg-transparent px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto md:text-[18px]"
                  >
                    Speak With an Advisor
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-[14px] text-white/70 md:mt-10 md:text-[15px]">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F5F5DC]" />
                    Direct artist collaboration
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F5F5DC]" />
                    Photo updates during creation
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F5F5DC]" />
                    Secure worldwide shipping
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {[
                { label: "Handcrafted by", value: "Warli Artists" },
                { label: "Heritage", value: "2,500+ Years" },
                { label: "Custom Options", value: "Available" },
                { label: "Shipping", value: "Across India" },
              ].map((stat, index) => (
                <div
                  key={`stat-${index}`}
                  className="text-center"
                >
                  <p className="font-display text-[24px] font-semibold text-[#8B4513] md:text-[32px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[14px] text-[#5b5b5b] md:text-[16px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default WarliPage;