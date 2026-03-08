"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const TAB_LABELS = [
  "About the Painting",
  "Specifications",
  "Care Instructions",
  "Delivery",
  "Packaging",
  "Returns",
];

const TAB_HELPER_TEXT: Record<string, string> = {
  "About the Painting": "Story, inspiration and artistic intent",
  Specifications: "Material and technical details",
  "Care Instructions": "Keep your artwork vibrant for years",
  Delivery: "Estimated timelines by region",
  Packaging: "How we protect artwork in transit",
  Returns: "Return and exchange eligibility",
};

const WHY_ARTACE_POINTS = [
  {
    title: "Authenticity",
    text: "We stand behind the authenticity and quality of our artwork, ensuring lasting beauty and value.",
    iconSrc: "/Authenticity.svg",
  },
  {
    title: "Satisfaction Guarantee",
    text: "Enjoy peace of mind with our 15-day satisfaction guarantee and shop with confidence.",
    iconSrc: "/Satisfaction Guarantee.svg",
  },
  {
    title: "Personal Support",
    text: "We offer dedicated support to ensure a smooth and exceptional experience from start to finish.",
    iconSrc: "/Personal Support.svg",
  },
  {
    title: "Curated with Confidence",
    text: "We curate exceptional, authentic art so you can create with confidence.",
    iconSrc: "/Curated with Confidence.svg",
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
  name: "Sahil Mahalley",
  role: "Art Advisor",
  image: "/Sahil-mahalley.webp",
  headline:
    "Our free art advisory service pairs you with a knowledgeable curator who will guide you through a seamless, stress-free process to find artwork that fits your style and needs.",
  description: "Complimentary Art Advisory",
  ctaLabel: "Book a Free Call Now",
  ctaHref: "/contact-us",
};

const stripHtml = (value: string) => stripHtmlAndDecode(value);
const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

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
    alt: decodeHtmlEntities(image.alt || image.name || stripHtml(product.name)),
    name: decodeHtmlEntities(image.name || stripHtml(product.name)),
  }));

  return {
    id: product.id,
    slug: product.slug,
    permalink: product.permalink,
    name: decodeHtmlEntities(product.name),
    shortDescription: decodeHtmlEntities(product.short_description || ""),
    description: decodeHtmlEntities(product.description || ""),
    sku: decodeHtmlEntities(product.sku || ""),
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
    categories: (product.categories ?? []).map((category) => ({
      ...category,
      name: decodeHtmlEntities(category.name),
    })),
    attributes: (product.attributes ?? []).map((attribute) => ({
      id: attribute.id,
      name: decodeHtmlEntities(attribute.name),
      options:
        attribute.options && attribute.options.length > 0
          ? attribute.options.map((option) => decodeHtmlEntities(option))
          : (attribute.terms ?? []).map((term) => decodeHtmlEntities(term.name)),
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

const getOrdinalSuffix = (day: number) => {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return "st";
  if (mod10 === 2 && mod100 !== 12) return "nd";
  if (mod10 === 3 && mod100 !== 13) return "rd";
  return "th";
};

const formatDeliveryDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString("en-IN", { month: "short" });
  return `${day}${getOrdinalSuffix(day)} ${month}`;
};

const getDeliveryRangeLabel = (baseDate: Date, fromDays: number, toDays: number) => {
  const fromDate = new Date(baseDate);
  fromDate.setDate(baseDate.getDate() + fromDays);

  const toDate = new Date(baseDate);
  toDate.setDate(baseDate.getDate() + toDays);

  return `${formatDeliveryDate(fromDate)} - ${formatDeliveryDate(toDate)}`;
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
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState(TAB_LABELS[0]);

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

  const productInformationItems = useMemo(() => {
    if (!product) return [];
    const productInformationAttribute = product.attributes.find((attribute) =>
      /product information/i.test(attribute.name)
    );
    if (!productInformationAttribute || productInformationAttribute.options.length === 0) {
      return [];
    }

    return productInformationAttribute.options.flatMap((option) =>
      option
        .split(/\r?\n|\|/g)
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }, [product]);

  const specificationRows = useMemo(
    () =>
      productInformationItems.map((item, index) => {
        const separatorIndex = item.indexOf(":");
        if (separatorIndex > 0) {
          const label = item.slice(0, separatorIndex).trim();
          const value = item.slice(separatorIndex + 1).trim();
          if (label && value) {
            return { label, value };
          }
        }

        return { label: `Detail ${index + 1}`, value: item };
      }),
    [productInformationItems]
  );

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

  const discountPercentage = useMemo(() => {
    if (!product || product.regularPrice === null || product.price === null) {
      return null;
    }
    if (product.regularPrice <= product.price || product.regularPrice <= 0) {
      return null;
    }
    return Math.round(
      ((product.regularPrice - product.price) / product.regularPrice) * 100
    );
  }, [product]);

  const displayRating = product?.averageRating && product.averageRating > 0 ? product.averageRating : 4.8;
  const displayReviewCount = product?.reviewCount && product.reviewCount > 0 ? product.reviewCount : 86;
  const deliveryDate = useMemo(() => new Date(), []);
  const framedDeliveryRows = useMemo(
    () => [
      {
        title: "Indian Metros",
        copy: `Delivered within 9 to 15 days (${getDeliveryRangeLabel(deliveryDate, 9, 15)})`,
      },
      {
        title: "Indian Cities and Towns",
        copy: `Delivered within 10 to 15 days (${getDeliveryRangeLabel(deliveryDate, 10, 15)})`,
      },
      {
        title: "International (outside India)",
        copy: "Framed paintings are not deliverable outside India. Please buy art without frame.",
      },
    ],
    [deliveryDate]
  );
  const rolledDeliveryRows = useMemo(
    () => [
      {
        title: "Indian Metros",
        copy: `Delivered within 7 to 10 days (${getDeliveryRangeLabel(deliveryDate, 7, 10)})`,
      },
      {
        title: "Indian Cities and Towns",
        copy: `Delivered within 8 to 12 days (${getDeliveryRangeLabel(deliveryDate, 8, 12)})`,
      },
      {
        title: "USA/UAE/UK/Europe/Asia",
        copy: `Delivered within 9 to 12 days (${getDeliveryRangeLabel(deliveryDate, 9, 12)})`,
      },
      {
        title: "Rest of the world",
        copy: `Delivered within 12 to 15 days (${getDeliveryRangeLabel(deliveryDate, 12, 15)})`,
      },
    ],
    [deliveryDate]
  );

  useEffect(() => {
    if (!showWishlistToast) return;
    const timer = window.setTimeout(() => setShowWishlistToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showWishlistToast]);

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
        woocommerceProductId: product.id,
        title: stripHtml(product.name),
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: product.price ?? undefined,
      },
      quantity
    );
  };

  const handleAddToWishlist = () => {
    setShowWishlistToast(true);
  };

  const renderActiveTabContent = () => {
    if (!product) return null;

    if (activeInfoTab === "About the Painting") {
      if (!product.description) {
        return (
          <p className="text-[18px] leading-8 text-[#595959]">
            About the painting is currently unavailable.
          </p>
        );
      }

      return (
        <div
          className="prose prose-sm max-w-none text-[#4f4b45]"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      );
    }

    if (activeInfoTab === "Specifications") {
      return (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-inter text-[24px] font-medium text-[#313131]">
              Product Information
            </h3>
            <span className="rounded-full bg-[#f4f2ee] px-3 py-1 text-[14px] text-[#595959]">
              Made for mindful buying
            </span>
          </div>
          {specificationRows.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e4ded4]">
              <div className="grid grid-cols-[minmax(140px,0.38fr)_minmax(0,1fr)] bg-[#f8f6f2] px-4 py-3 text-[15px] font-medium text-[#313131]">
                <p>Attribute</p>
                <p>Details</p>
              </div>
              <div className="divide-y divide-[#ece7de]">
                {specificationRows.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    className="grid grid-cols-[minmax(140px,0.38fr)_minmax(0,1fr)] gap-4 px-4 py-3"
                  >
                    <p className="text-[17px] font-medium leading-7 text-[#313131]">
                      {row.label}
                    </p>
                    <p className="text-[17px] leading-7 text-[#595959]">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[18px] text-[#595959]">
              Product information is currently unavailable.
            </p>
          )}
        </>
      );
    }

    if (activeInfoTab === "Care Instructions") {
      return (
        <div className="space-y-5 text-[18px] leading-8 text-[#595959]">
          <p>
            Your artwork is made to be enjoyed and requires very little maintenance. Since paintings are displayed vertically, dust rarely settles on the surface. Simply dust the artwork gently with a dry, soft cloth once a month to keep it looking fresh.
          </p>
          <p>
            If needed, you may lightly dab the surface with a slightly damp cloth every 6 months to remove any fine dust particles.
          </p>
          <p>
            Please avoid using soap, detergents, disinfectants, or any chemicals, as they may damage the colors. Paper and fabric artworks are typically framed with protective glass, so you only need to clean the glass surface.
          </p>
          <p>
            To preserve the beauty of your artwork for years to come, keep it away from direct sunlight and avoid placing it on walls with moisture or water leakage. With just a little care, your artwork will remain vibrant and beautiful for a long time. ✨
          </p>
        </div>
      );
    }

    if (activeInfoTab === "Delivery") {
      return (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[10px] border border-[#dfdbd4] bg-[#faf9f6] p-5">
              <h3 className="font-inter text-[24px] font-medium text-[#313131]">
                Rolled Paintings
              </h3>
              <div className="mt-4 space-y-4">
                {rolledDeliveryRows.map((row) => (
                  <div key={row.title}>
                    <p className="text-[18px] font-medium leading-7 text-[#313131]">{row.title}</p>
                    <p className="text-[18px] leading-7 text-[#595959]">{row.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[#dfdbd4] bg-[#faf9f6] p-5">
              <h3 className="font-inter text-[24px] font-medium text-[#313131]">
                Framed Paintings
              </h3>
              <div className="mt-4 space-y-4">
                {framedDeliveryRows.map((row) => (
                  <div key={row.title}>
                    <p className="text-[18px] font-medium leading-7 text-[#313131]">{row.title}</p>
                    <p className="text-[18px] leading-7 text-[#595959]">{row.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[10px] border border-[#e6e1d8] bg-white p-5 text-[18px] leading-8 text-[#595959]">
            <p>
              Note: Delivery times are estimated based on our past shipments and may vary depending on the courier partner, customs procedures (for international orders), or other factors beyond our control.
            </p>
            <p className="mt-4">
              For orders shipped outside India, any applicable import duties or taxes must be paid directly to the courier partner upon delivery. These charges are not included in our prices.
            </p>
          </div>
        </>
      );
    }

    if (activeInfoTab === "Packaging") {
      return (
        <div className="space-y-5 text-[18px] leading-8 text-[#595959]">
          <p>
            Unframed artworks are shipped in rolled format in a protective tube. Framed artworks are shipped in thermocol boxes, secured with multiple layers of bubble wraps. We ensure paintings are packed with utmost care to avoid any damage during transit and delivered to you in perfect condition.
          </p>
          <p>
            International shipping: Paintings shipped internationally are rolled and shipped in a tube. The painting is not stretched and is not ready to hang. It is meant to be framed by the customer at their local frame shop.
          </p>
          <p>
            If paintings are damaged during transit, please contact our customer care within 24 hours of receiving the package. We will provide you with a solution as soon as possible.
          </p>
        </div>
      );
    }

    if (activeInfoTab === "Returns") {
      return (
        <div className="space-y-5 text-[18px] leading-8 text-[#595959]">
          <p>
            We want you to feel confident in your purchase. If needed, you may return your painting within 15 days of delivery.
          </p>
          <p>
            Please note that returns are only accepted for default-size paintings without a frame that are delivered within India. The artwork must be returned in its original packaging and in the same condition as it was received.
          </p>
          <p>
            If your painting arrives damaged, kindly contact our customer support within 24 hours of delivery, and we will assist you with a quick resolution.
          </p>
          <p>
            Returns are not applicable for custom-size artworks, framed paintings, or international orders. If you have any questions, our customer support team will be happy to help.
          </p>
        </div>
      );
    }

    return null;
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
          <p className="text-[16px] text-[#6d6962]">
            Shop / Canvas Collection / {product.categories[0]?.name ?? "Bestseller"} / {stripHtml(product.name)}
          </p>

          <div className="mt-[50px] grid gap-y-10 lg:grid-cols-[500px_minmax(0,1fr)] lg:gap-x-[60px]">
            <div>
              <div className="max-w-[500px]">
                <div className="relative overflow-hidden rounded-[12px] bg-[#e8e5df]">
                  <Image
                    src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                    alt={selectedImage?.alt || stripHtml(product.name)}
                    width={500}
                    height={500}
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="h-auto w-full object-cover"
                  />
                </div>

                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-[8px] ${
                        index === activeImageIndex
                          ? "ring-2 ring-[#3A4980]/40"
                          : ""
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <Image
                        src={image.thumbnail || image.src}
                        alt={image.alt}
                        fill
                        sizes="62px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h1 className="font-display text-[28px] leading-[1.2] text-[#24211d]">
                {product.name}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[18px] text-[#313131] underline underline-offset-2">
                  {artistName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f0e3bc] px-2 py-1 text-[14px] font-medium text-[#5f4a18]">
                  <Star className="h-3 w-3 fill-[#be8f2b] text-[#be8f2b]" />
                  {displayRating.toFixed(1)}
                </span>
                <span className="rounded-full bg-[#e6edf8] px-2 py-1 text-[14px] font-medium text-[#365683]">
                  {displayReviewCount} Reviews
                </span>
              </div>

              <div className="mt-6 font-inter">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-[28px] font-semibold leading-none text-[#292929]">
                    {formattedPrice ?? "Price on request"}
                  </span>
                  {discountPercentage !== null && formattedRegularPrice && (
                    <span className="text-[16px] leading-none text-[#494949] line-through">
                      {formattedRegularPrice}
                    </span>
                  )}
                  {discountPercentage !== null && (
                    <span className="text-[16px] font-semibold leading-none text-[#14AE5C]">
                      {discountPercentage}% off
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[16px] text-[#595959]">Inclusive of all taxes</p>
              </div>

              {product.shortDescription && (
                <p className="mt-[30px] max-w-2xl text-[18px] leading-8 text-[#313131]">
                  {stripHtml(product.shortDescription)}
                </p>
              )}

              <div className="mt-[30px]">
                <p className="text-[16px] text-[#595959]">Choose a Size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 font-inter text-[14px] font-medium transition-colors ${
                        selectedSizeValue === size
                          ? "border-[#3A4980]/20 bg-[#EDF0F8] text-[#3A4980]"
                          : "border-[#d5d5d5] bg-white text-[#595959]"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          selectedSizeValue === size
                            ? "border-[#3A4980]"
                            : "border-[#a4a4a4]"
                        }`}
                      >
                        {selectedSizeValue === size ? (
                          <span className="h-2 w-2 rounded-full bg-[#3A4980]" />
                        ) : null}
                      </span>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.sku && (
                <p className="mt-[30px] text-[16px] text-[#595959]">
                  SKU: {product.sku}
                </p>
              )}

              <div className="mt-[30px] flex flex-wrap items-center gap-3">
                <div className="flex h-[50px] items-center overflow-hidden rounded-[10px] border border-[#dcdad8] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-full w-[44px] items-center justify-center text-[#313131] transition-colors hover:bg-[#EDF0F8] hover:text-[#3A4980] active:bg-[#dfe6f7]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-[46px] text-center font-inter text-[16px] font-medium text-[#313131]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-full w-[44px] items-center justify-center text-[#313131] transition-colors hover:bg-[#EDF0F8] hover:text-[#3A4980] active:bg-[#dfe6f7]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="inline-flex items-center gap-2 rounded-[6px] bg-[#1f1f1f] px-6 py-3 text-[18px] font-normal text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#8c8578]"
                >
                  Add to Bag <Plus className="h-3.5 w-3.5" />
                </button>

                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 rounded-[6px] bg-[#FFDB4B] px-6 py-3 text-[18px] font-normal text-[#2c250f] transition-colors hover:bg-[#f2ce3f]"
                >
                  Order a Custom Size
                </Link>

                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  aria-label="Add to wishlist"
                  className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-[6px] bg-[#F3F3F3] text-[#5b5b5b] transition-colors hover:bg-[#e8e8e8]"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <details className="group mt-[24px] overflow-hidden rounded-[6px] bg-transparent">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-inter text-[18px] leading-tight text-[#3a3a3a] [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-3">
                    <Truck className="h-5 w-5 shrink-0 text-[#3a3a3a]" />
                    <span>Ships rolled. Frame it locally in your city to hang it</span>
                  </span>
                  <ChevronDown className="h-5 w-5 text-[#4f4f4f] transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-open:grid-rows-[1fr]">
                  <p className="overflow-hidden border-t border-[#ededed] px-4 py-3 text-[15px] leading-6 text-[#595959] opacity-0 transition-opacity duration-300 ease-in-out group-open:opacity-100">
                    This reduces shipping costs and prevents damage during transit. You also get to choose the frame as per your decor and taste. Visit any local frame shop for multiple framing options. We ship the artwork carefully rolled in a protective tube. A booklet with framing tips is also included.
                  </p>
                </div>
              </details>

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

          <div className="mt-9 rounded-[16px] border border-[#d8d4cd] bg-gradient-to-b from-[#fbfaf8] to-[#f5f2ec] p-4 md:p-6">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {TAB_LABELS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveInfoTab(tab)}
                  className={`rounded-[10px] border px-4 py-3 text-left transition-all ${
                    activeInfoTab === tab
                      ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                      : "border-[#d7d2c9] bg-white text-[#4f4b45] hover:border-[#1f1f1f]/30 hover:bg-[#faf9f6]"
                  }`}
                >
                  <span className="block text-[18px] font-medium leading-tight">{tab}</span>
                  <span
                    className={`mt-2 block text-[13px] leading-5 ${
                      activeInfoTab === tab ? "text-white/80" : "text-[#6a655d]"
                    }`}
                  >
                    {TAB_HELPER_TEXT[tab] ?? ""}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd7cf] bg-white px-3 py-1 text-[13px] text-[#57534b]">
                <BadgeCheck className="h-3.5 w-3.5 text-[#3a6b96]" />
                Authentic Handmade Art
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd7cf] bg-white px-3 py-1 text-[13px] text-[#57534b]">
                <Truck className="h-3.5 w-3.5 text-[#3a6b96]" />
                Safe Delivery Promise
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd7cf] bg-white px-3 py-1 text-[13px] text-[#57534b]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#3a6b96]" />
                Assured Support
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-[16px] border border-[#e1ddd5] bg-white p-5 md:p-7">
            {renderActiveTabContent()}
          </div>
        </div>
      </section>

      {showWishlistToast ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-[8px] border border-[#d9e7da] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <BadgeCheck className="h-5 w-5 text-[#14AE5C]" />
          <p className="font-inter text-[14px] text-[#313131]">Added to wishlist</p>
          <Link
            href="/wishlist"
            className="font-inter text-[14px] text-[#313131] underline underline-offset-2"
          >
            Check now
          </Link>
        </div>
      ) : null}

      <section className="px-6 py-10 md:px-12 md:py-12 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-[52px] leading-none text-[#1f1f1f]">
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
                <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#e7e3dc]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 46vw, 24vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-[14px] text-[#7a7368]">Handmade Painting</p>
                <h3 className="mt-1 font-display text-[18px] leading-[1.32] text-[#1f1f1f]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[14px] text-[#6f685f]">
                  Handmade Painting | {item.sizes} | Acrylic Colors on Canvas
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="text-center font-display text-[52px] leading-none text-[#1f1f1f]">
            Why Artace Studio
          </h2>
          <p className="mx-auto mt-4 max-w-[980px] text-center text-[18px] leading-8 text-[#595959]">
            Bringing a new piece of art into your life is a significant moment, one filled with excitement and personal expression. We believe the experience of acquiring it should be just as inspiring and effortless.
          </p>

          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {WHY_ARTACE_POINTS.map(({ title, text, iconSrc }) => (
              <div
                key={title}
                className="mx-auto flex h-full w-full max-w-[320px] flex-col items-center text-center lg:max-w-none"
              >
                <Image
                  src={iconSrc}
                  alt={title}
                  width={64}
                  height={64}
                  className="h-14 w-auto object-contain"
                />
                <h3 className="mt-5 font-display text-[25px] leading-[1.2] text-[#313131]">
                  {title}
                </h3>
                <p className="mt-2 text-[18px] leading-8 text-[#595959]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080909] px-6 py-12 text-white md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto grid max-w-[1440px] items-center gap-y-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-x-[80px]">
          <div>
            <p className="font-inter text-[18px] font-normal text-white/65">
              {toTitleCase(advisor.description)}
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-[36px] leading-[1.12] text-white">
              {advisor.headline}
            </h2>
            <Link
              href={advisor.ctaHref}
              className="mt-8 inline-flex items-center gap-2 rounded-[4px] bg-white px-5 py-3 text-[18px] font-medium text-[#141414] transition-colors hover:bg-[#f3f3f3]"
            >
              {advisor.ctaLabel}
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="justify-self-center text-center md:justify-self-end">
            <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full md:h-72 md:w-72">
              <Image
                src={advisor.image}
                alt={advisor.name}
                fill
                sizes="(max-width: 768px) 256px, 288px"
                className="object-cover"
              />
            </div>
            <p className="mt-5 text-[15px] text-white/70">
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

    </main>
  );
};

export default SingleProduct;
