"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HandHelping,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const TAB_LABELS = [
  "About the Painting",
  "Specifications",
  "Care Instructions",
  "Delivery",
  "Packaging",
  "Returns",
];

const WHY_ARTACE_POINTS = [
  {
    title: "Authenticity",
    text: "We stand behind the authenticity and quality of our artwork, ensuring lasting beauty and value.",
    Icon: BadgeCheck,
  },
  {
    title: "Satisfaction Guarantee",
    text: "Enjoy peace of mind with our 15-day satisfaction guarantee and shop with confidence.",
    Icon: ShieldCheck,
  },
  {
    title: "Personal Support",
    text: "We offer dedicated support to ensure a smooth and exceptional experience from start to finish.",
    Icon: HandHelping,
  },
  {
    title: "Curated with Confidence",
    text: "We curate exceptional, authentic art so you can create with confidence.",
    Icon: Star,
  },
];

type WooCommerceStorePrices = {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
};

type WooCommerceStoreImage = {
  id: number;
  src: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
};

type WooCommerceStoreCategory = {
  id: number;
  name: string;
  slug: string;
};

type WooCommerceStoreAttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

type WooCommerceStoreAttribute = {
  id: number;
  name: string;
  terms?: WooCommerceStoreAttributeTerm[];
  options?: string[];
};

export type WooCommerceStoreProduct = {
  id: number;
  slug: string;
  permalink: string;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  on_sale: boolean;
  average_rating: string;
  review_count: number;
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
  stock_quantity: number | null;
  images: WooCommerceStoreImage[];
  categories: WooCommerceStoreCategory[];
  attributes: WooCommerceStoreAttribute[];
  prices: WooCommerceStorePrices;
};

type SingleProductImage = {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
  name: string;
};

type SingleProductCategory = {
  id: number;
  name: string;
  slug: string;
};

type SingleProductAttribute = {
  id: number;
  name: string;
  options: string[];
};

export type SingleProductData = {
  id: number;
  slug: string;
  permalink: string;
  name: string;
  shortDescription: string;
  description: string;
  sku: string;
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  averageRating: number;
  reviewCount: number;
  stockStatus: string;
  stockQuantity: number | null;
  inStock: boolean;
  currencyCode: string;
  currencySymbol: string;
  images: SingleProductImage[];
  categories: SingleProductCategory[];
  attributes: SingleProductAttribute[];
};

type RelatedProductCard = {
  id: number | string;
  title: string;
  sizes: string;
  image: string;
  href?: string;
};

type ReadMoreCard = {
  id: number | string;
  category: string;
  title: string;
  image: string;
  href?: string;
};

type AdvisorBlock = {
  name: string;
  role: string;
  image: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type SingleProductProps = {
  initialProduct?: WooCommerceStoreProduct | SingleProductData | null;
  relatedProducts?: RelatedProductCard[];
  readMorePosts?: ReadMoreCard[];
  advisor?: AdvisorBlock;
  artistName?: string;
  className?: string;
};

const DEFAULT_RELATED_PRODUCTS: RelatedProductCard[] = [
  {
    id: 1,
    title: "Moments of Inner Peace",
    sizes: "4 Sizes",
    image: "/product-1.webp",
    href: "#",
  },
  {
    id: 2,
    title: "Land, Light & Life",
    sizes: "5 Sizes",
    image: "/product-2.webp",
    href: "#",
  },
  {
    id: 3,
    title: "Energies of Color & Space",
    sizes: "2 Sizes",
    image: "/product-3.webp",
    href: "#",
  },
  {
    id: 4,
    title: "Sacred Art of Ganesh",
    sizes: "3 Sizes",
    image: "/product-4.webp",
    href: "#",
  },
];

const DEFAULT_READ_MORE_POSTS: ReadMoreCard[] = [
  {
    id: 1,
    category: "General",
    title: "La Strada dell'Agricoltore con Pecora in Via del Casino Slots",
    image: "/journal-img.webp",
    href: "#",
  },
  {
    id: 2,
    category: "Artist Story",
    title: "La Strada dell'Agricoltore con Pecora in Via del Casino Slots",
    image: "/legacy-img.webp",
    href: "#",
  },
  {
    id: 3,
    category: "Behind The Canvas",
    title: "La Strada dell'Agricoltore con Pecora in Via del Casino Slots",
    image: "/who-are-we.webp",
    href: "#",
  },
];

const DEFAULT_ADVISOR: AdvisorBlock = {
  name: "Soni Mahato",
  role: "Art Advisor",
  image: "/Artist-1.webp",
  headline:
    "Our free art advisory service pairs you with a knowledgeable curator who will guide you through a seamless, stress-free process to find artwork that fits your style and needs.",
  description: "Complimentary Art Advisory",
  ctaLabel: "Book a Free Call Now",
  ctaHref: "/contact-us",
};

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "").trim();

const parseMinorUnitPrice = (
  rawValue: string | undefined,
  minorUnit: number
): number | null => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
};

const isStoreApiProduct = (
  product: WooCommerceStoreProduct | SingleProductData | null | undefined
): product is WooCommerceStoreProduct => {
  if (!product) return false;
  return "prices" in product && "short_description" in product;
};

const normalizeWooCommerceStoreProduct = (
  product: WooCommerceStoreProduct
): SingleProductData => {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const normalizedImages = (product.images ?? []).map((image) => ({
    id: image.id,
    src: image.src || FALLBACK_PRODUCT_IMAGE,
    thumbnail: image.thumbnail || image.src || FALLBACK_PRODUCT_IMAGE,
    alt: image.alt || image.name || stripHtml(product.name),
    name: image.name || stripHtml(product.name),
  }));

  return {
    id: product.id,
    slug: product.slug,
    permalink: product.permalink,
    name: product.name,
    shortDescription: product.short_description || "",
    description: product.description || "",
    sku: product.sku || "",
    price: parseMinorUnitPrice(product.prices?.price, minorUnit),
    regularPrice: parseMinorUnitPrice(product.prices?.regular_price, minorUnit),
    salePrice: parseMinorUnitPrice(product.prices?.sale_price, minorUnit),
    onSale: Boolean(product.on_sale),
    averageRating: Number(product.average_rating || 0),
    reviewCount: Number(product.review_count || 0),
    stockStatus: product.stock_status || "instock",
    stockQuantity:
      typeof product.stock_quantity === "number" ? product.stock_quantity : null,
    inStock: product.stock_status !== "outofstock",
    currencyCode: product.prices?.currency_code || "INR",
    currencySymbol: product.prices?.currency_symbol || "Rs. ",
    images:
      normalizedImages.length > 0
        ? normalizedImages
        : [
            {
              id: -1,
              src: FALLBACK_PRODUCT_IMAGE,
              thumbnail: FALLBACK_PRODUCT_IMAGE,
              alt: stripHtml(product.name),
              name: stripHtml(product.name),
            },
          ],
    categories: product.categories ?? [],
    attributes: (product.attributes ?? []).map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      options:
        attribute.options && attribute.options.length > 0
          ? attribute.options
          : (attribute.terms ?? []).map((term) => term.name),
    })),
  };
};

const normalizeSingleProductData = (
  product: WooCommerceStoreProduct | SingleProductData | null | undefined
): SingleProductData | null => {
  if (!product) return null;
  if (isStoreApiProduct(product)) {
    return normalizeWooCommerceStoreProduct(product);
  }
  return product;
};

const formatPrice = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  if (value === null) return null;
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

const SingleProduct = ({
  initialProduct = null,
  relatedProducts = DEFAULT_RELATED_PRODUCTS,
  readMorePosts = DEFAULT_READ_MORE_POSTS,
  advisor = DEFAULT_ADVISOR,
  artistName = "Artace Studio",
  className = "",
}: SingleProductProps) => {
  const { addItem } = useCart();
  const product = useMemo(
    () => normalizeSingleProductData(initialProduct),
    [initialProduct]
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  const sizeOptions = useMemo(() => {
    if (!product) return ["16x20", "20x30", "30x40"];
    const sizeAttribute = product.attributes.find((attribute) =>
      /size/i.test(attribute.name)
    );
    if (sizeAttribute && sizeAttribute.options.length > 0) {
      return sizeAttribute.options;
    }
    return ["16x20", "20x30", "30x40"];
  }, [product]);

  const selectedSizeValue =
    selectedSize && sizeOptions.includes(selectedSize)
      ? selectedSize
      : (sizeOptions[0] ?? "");

  const selectedImage = useMemo(() => {
    if (!product) return null;
    return (
      product.images[activeImageIndex] ?? {
        id: -1,
        src: FALLBACK_PRODUCT_IMAGE,
        thumbnail: FALLBACK_PRODUCT_IMAGE,
        alt: stripHtml(product.name),
        name: stripHtml(product.name),
      }
    );
  }, [activeImageIndex, product]);

  const formattedPrice = useMemo(() => {
    if (!product) return null;
    return formatPrice(product.price, product.currencyCode, product.currencySymbol);
  }, [product]);

  const formattedRegularPrice = useMemo(() => {
    if (!product) return null;
    return formatPrice(
      product.regularPrice,
      product.currencyCode,
      product.currencySymbol
    );
  }, [product]);

  const displayRating = product?.averageRating && product.averageRating > 0 ? product.averageRating : 4.8;
  const displayReviewCount = product?.reviewCount && product.reviewCount > 0 ? product.reviewCount : 86;

  const handleAddToCart = () => {
    if (!product || !selectedImage || !product.inStock) return;

    const subtitleParts: string[] = [];
    if (selectedSizeValue) subtitleParts.push(selectedSizeValue);
    if (product.categories.length > 0) {
      subtitleParts.push(product.categories[0].name);
    }

    addItem(
      {
        id: `${product.id}-${selectedSizeValue || "default"}`,
        title: stripHtml(product.name),
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: product.price ?? undefined,
      },
      quantity
    );
  };

  if (!product) {
    return (
      <section className={`bg-[#f4f2ee] px-6 py-16 md:px-12 lg:px-24 ${className}`}>
        <div className="mx-auto max-w-[960px] border border-[#1f1f1f]/10 bg-white px-8 py-12 text-center">
          <h2 className="font-display text-4xl text-[#222]">Product Unavailable</h2>
          <p className="mt-4 text-[#666]">We could not find this product right now.</p>
          <Link
            href="/"
            className="mt-8 inline-flex border border-[#222] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#222] transition-colors hover:bg-[#222] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className={`bg-[#f4f2ee] text-[#1f1f1f] ${className}`}>
      <section className="px-6 py-8 md:px-12 md:py-10 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-[11px] text-[#6d6962]">
            Shop / Canvas Collection / {product.categories[0]?.name ?? "Bestseller"} / {stripHtml(product.name)}
          </p>

          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
            <div>
              <div className="grid gap-4 md:grid-cols-[48px_minmax(0,1fr)]">
                <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden border ${
                        index === activeImageIndex
                          ? "border-[#1f1f1f]"
                          : "border-[#1f1f1f]/20"
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <Image
                        src={image.thumbnail || image.src}
                        alt={image.alt}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="order-1 relative aspect-square overflow-hidden rounded-[6px] bg-[#e8e5df] md:order-2">
                  <Image
                    src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                    alt={selectedImage?.alt || stripHtml(product.name)}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 620px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-6 text-[12px] text-[#4e4a44]">
                <button type="button" className="inline-flex items-center gap-1.5 hover:text-black">
                  <Heart className="h-3.5 w-3.5" /> Add to Wish List
                </button>
                <button type="button" className="inline-flex items-center gap-1.5 hover:text-black">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <Link href="/contact-us" className="inline-flex items-center gap-1.5 hover:text-black">
                  <HandHelping className="h-3.5 w-3.5" /> Need Help?
                </Link>
              </div>
            </div>

            <div>
              <h1 className="font-display text-[38px] leading-[1.16] text-[#24211d] md:text-[46px]">
                {product.name}
              </h1>
              <p className="mt-2 text-[13px] text-[#6d6962]">By {artistName}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f0e3bc] px-2 py-1 text-[#5f4a18]">
                  <Star className="h-3 w-3 fill-[#be8f2b] text-[#be8f2b]" />
                  {displayRating.toFixed(1)}
                </span>
                <span className="rounded-full bg-[#e6edf8] px-2 py-1 text-[#365683]">
                  {displayReviewCount} Reviews
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {product.onSale && formattedRegularPrice && (
                  <span className="font-display text-[44px] leading-none text-[#6c655a] line-through">
                    {formattedRegularPrice}
                  </span>
                )}
                <span className="font-display text-[48px] leading-none text-[#1f1f1f]">
                  {formattedPrice ?? "Price on request"}
                </span>
              </div>

              {product.shortDescription && (
                <p className="mt-4 max-w-2xl text-[14px] leading-6 text-[#4f4b45]">
                  {stripHtml(product.shortDescription)}
                </p>
              )}

              <div className="mt-6">
                <p className="text-[12px] text-[#4f4b45]">Choose a Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.04em] ${
                        selectedSizeValue === size
                          ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                          : "border-[#1f1f1f]/20 bg-white text-[#4f4b45]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.sku && (
                <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-[#6d6962]">
                  SKU: {product.sku}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-[#1f1f1f]/20 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="px-3 py-2 hover:bg-[#f0ede8]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="px-3 py-2 hover:bg-[#f0ede8]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[#1f1f1f] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#8c8578]"
                >
                  Add to Cart <Plus className="h-3.5 w-3.5" />
                </button>

                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[#dfc765] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2c250f] transition-colors hover:bg-[#d2b952]"
                >
                  Order a Custom Size
                </Link>
              </div>

              <div className="mt-6 overflow-hidden rounded-[6px] border border-[#1f1f1f]/10 bg-white">
                <div className="flex items-start gap-3 border-b border-[#1f1f1f]/10 px-4 py-3">
                  <Truck className="mt-0.5 h-4 w-4 text-[#c1432f]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f2b25]">Free Delivery</p>
                    <p className="text-[11px] text-[#6d6962]">Enjoy our Pan-India door-step delivery with safety.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3">
                  <RotateCcw className="mt-0.5 h-4 w-4 text-[#c1432f]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#2f2b25]">Return Delivery</p>
                    <p className="text-[11px] text-[#6d6962]">Free 15-day Money Back + Returns.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#1f1f1f]/10 pt-6 sm:grid-cols-4">
                <div className="text-center">
                  <BadgeCheck className="mx-auto h-4 w-4 text-[#3a6b96]" />
                  <p className="mt-2 text-[11px] text-[#5c574f]">Premium Cotton Canvas</p>
                </div>
                <div className="text-center">
                  <ShieldCheck className="mx-auto h-4 w-4 text-[#4c8e58]" />
                  <p className="mt-2 text-[11px] text-[#5c574f]">100% Handmade</p>
                </div>
                <div className="text-center">
                  <Star className="mx-auto h-4 w-4 text-[#d4a43d]" />
                  <p className="mt-2 text-[11px] text-[#5c574f]">Museum Grade</p>
                </div>
                <div className="text-center">
                  <ShieldCheck className="mx-auto h-4 w-4 text-[#cf7f33]" />
                  <p className="mt-2 text-[11px] text-[#5c574f]">Authenticity Certificate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 border-y border-[#1f1f1f]/10 py-3">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#4f4b45]">
              {TAB_LABELS.map((tab) => (
                <button key={tab} type="button" className="hover:text-black">
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12 md:py-12 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-[50px] leading-none text-[#1f1f1f] md:text-[60px]">
              Shop More Like This
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border-b border-[#1f1f1f] pb-1 text-[12px] uppercase tracking-[0.08em]"
            >
              Shop All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={item.href || "#"} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e3dc]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 46vw, 24vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-display text-[19px] leading-6 text-[#1f1f1f]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[12px] text-[#6d6962]">{item.sizes}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 text-center md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto max-w-[1080px]">
          <h2 className="font-display text-[52px] leading-none text-[#1f1f1f] md:text-[62px]">
            Why Artace Studio
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-[14px] leading-6 text-[#58544d]">
            Bringing a new piece of art into your life is a significant moment, one filled with excitement and personal expression. We believe the experience of acquiring it should be just as inspiring and effortless.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {WHY_ARTACE_POINTS.map(({ title, text, Icon }) => (
              <div key={title}>
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f1f]/15 bg-white">
                  <Icon className="h-4 w-4 text-[#2e2a25]" />
                </span>
                <h3 className="mt-4 font-display text-[30px] leading-8 text-[#1f1f1f] md:text-[34px]">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[#5f5a52]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080909] px-6 py-12 text-white md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <p className="text-[12px] uppercase tracking-[0.08em] text-white/65">
              {advisor.description}
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-[44px] leading-[1.12] text-white md:text-[54px]">
              {advisor.headline}
            </h2>
            <Link
              href={advisor.ctaHref}
              className="mt-8 inline-flex items-center rounded-[4px] bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#141414] transition-colors hover:bg-[#f3f3f3]"
            >
              {advisor.ctaLabel}
            </Link>
          </div>

          <div className="justify-self-center text-center md:justify-self-end">
            <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full md:h-64 md:w-64">
              <Image
                src={advisor.image}
                alt={advisor.name}
                fill
                sizes="256px"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-[13px] text-white/70">
              {advisor.name}, {advisor.role}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-[50px] leading-none text-[#1f1f1f] md:text-[58px]">
              Read More about Art
            </h2>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 border-b border-[#1f1f1f] pb-1 text-[12px] uppercase tracking-[0.08em]"
            >
              See All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {readMorePosts.map((post) => (
              <Link key={post.id} href={post.href || "#"} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#e7e3dc]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-[#7a7368]">
                  {post.category}
                </p>
                <h3 className="mt-2 font-display text-[28px] leading-[1.18] text-[#1f1f1f]">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {product.description && (
        <section className="px-6 pb-16 md:px-12 lg:px-24">
          <div className="mx-auto max-w-[1440px] border-t border-[#1f1f1f]/10 pt-10">
            <h2 className="font-display text-[48px] leading-none text-[#1f1f1f] md:text-[58px]">
              Product Details
            </h2>
            <div
              className="prose prose-sm mt-6 max-w-none text-[#4f4b45]"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </section>
      )}
    </main>
  );
};

export default SingleProduct;
