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
  X,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
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
  variations?: Variation[];
  faqs?: FAQItem[];
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

export type Variation = {
  id: number;
  attributes: { name: string; value: string }[];
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
};

export type FAQItem = {
  question: string;
  answer: string;
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
  variations?: Variation[];
  faqs?: FAQItem[];
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
  ctaHref: "https://cal.com/artace-studio",
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
    variations: (product.variations ?? []).map((variation) => ({
      id: variation.id,
      attributes: variation.attributes.map((attr) => ({
        name: decodeHtmlEntities(attr.name),
        value: decodeHtmlEntities(attr.value),
      })),
      price: variation.price,
      regularPrice: variation.regularPrice,
      salePrice: variation.salePrice,
      onSale: variation.onSale,
      inStock: variation.inStock,
    })),
    faqs: product.faqs ?? [],
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

const parseSizeDimensions = (value: string) => {
  const numericValues = value.match(/\d+(?:\.\d+)?/g);
  if (!numericValues || numericValues.length < 2) return null;

  const width = Number(numericValues[0]);
  const height = Number(numericValues[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) {
    return null;
  }

  return { width, height };
};

const inferSizeUnit = (value: string) => {
  if (/cm|centimeter|centimetre/i.test(value)) return "cm";
  return "in";
};

const formatDimensionValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  const rounded = Number(value.toFixed(3));
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
};

const normalizeDimensionInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");
  if (firstDotIndex === -1) return cleaned;

  return (
    cleaned.slice(0, firstDotIndex + 1) +
    cleaned.slice(firstDotIndex + 1).replace(/\./g, "")
  );
};

const ProductFAQs = ({ faqs }: { faqs: FAQItem[] }) => {
  if (faqs.length === 0) return null;

  return (
    <section className="rounded-[16px] border border-[#ded8ce] bg-gradient-to-b from-[#fcfbf8] to-white p-5 shadow-[0_18px_40px_rgba(31,31,31,0.04)] md:p-8">
      <div className="max-w-[780px]">
        <p className="font-inter text-[12px] uppercase tracking-[0.12em] text-[#6a655d] md:text-[13px]">
          Common Questions
        </p>
        <h2 className="mt-3 font-display text-[28px] leading-[1.08] text-[#1f1f1f] md:text-[40px]">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-[#5d5850] md:text-[18px] md:leading-8">
          Everything collectors usually want to know before browsing more pieces
          from this collection.
        </p>
      </div>

      <div className="mt-6 space-y-3 md:mt-8">
        {faqs.map((faq, index) => (
          <details
            key={`${faq.question}-${index}`}
            className="group overflow-hidden rounded-[12px] border border-[#e4ded4] bg-white"
          >
            <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-[15px] font-medium leading-6 text-[#313131] [&::-webkit-details-marker]:hidden md:min-h-[56px] md:px-5 md:text-[18px] md:leading-7">
              <span>{faq.question}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#595959] transition-transform group-open:rotate-180 md:h-5 md:w-5" />
            </summary>
            <div className="border-t border-[#ece7de] px-4 py-4 text-[14px] leading-6 text-[#595959] md:px-5 md:text-[16px] md:leading-7">
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
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
  const { addItem: addWishlistItem, isInWishlist } = useWishlist();
  const product = useMemo(
    () => normalizeSingleProductData(initialProduct),
    [initialProduct]
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [toastState, setToastState] = useState<{
    message: string;
    linkHref?: string;
    linkLabel?: string;
  } | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState(TAB_LABELS[0]);
  const [isCustomSizeModalOpen, setIsCustomSizeModalOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const sizeOptions = useMemo(() => {
    if (!product) return ["16x20", "20x30", "30x40"];
    const sizeAttribute = product.attributes.find((attribute) =>
      /size|dimension/i.test(attribute.name)
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

  const aboutPaintingHtml = useMemo(() => {
    if (!product?.description) return "";

    return product.description
      .replace(
        /<div[^>]*class="[^"]*tinv-wraper[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
        ""
      )
      .replace(
        /<a[^>]*class="[^"]*tinvwl_add_to_wishlist_button[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
        ""
      )
      .replace(
        /<div[^>]*class="[^"]*tinv-wishlist-clear[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
        ""
      )
      .replace(
        /<div[^>]*class="[^"]*tinvwl-tooltip[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
        ""
      )
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .trim();
  }, [product]);

  const aboutPaintingHighlights = useMemo(() => {
    if (!product) return [];

    const highlights: string[] = [];

    if (artistName) {
      highlights.push(`Artist: ${artistName}`);
    }

    if (product.categories[0]?.name) {
      highlights.push(`Category: ${product.categories[0].name}`);
    }

    const mediumAttribute = product.attributes.find((attribute) =>
      /medium|material|color base|colors?/i.test(attribute.name)
    );
    if (mediumAttribute?.options?.[0]) {
      highlights.push(`${mediumAttribute.name}: ${mediumAttribute.options[0]}`);
    }

    if (sizeOptions[0]) {
      highlights.push(`Size: ${sizeOptions[0]}`);
    }

    return highlights.slice(0, 4);
  }, [artistName, product, sizeOptions]);

  const selectedSizeValue =
    selectedSize && sizeOptions.includes(selectedSize)
      ? selectedSize
      : (sizeOptions[0] ?? "");

  const currentVariation = useMemo(() => {
    if (!product?.variations || product.variations.length === 0) return null;
    const sizeValue = selectedSizeValue;
    if (!sizeValue) return null;
    
    // First try to find a variation where the size attribute name matches and value matches
    const variationBySizeAttribute = product.variations.find((variation) =>
      variation.attributes.some(
        (attr) =>
          /size|dimension/i.test(attr.name) && attr.value.toLowerCase() === sizeValue.toLowerCase()
      )
    );
    
    if (variationBySizeAttribute) return variationBySizeAttribute;
    
    // If not found, try to find a variation where ANY attribute value matches the selected size
    // This handles cases where the attribute name might be different (e.g., "pa_size", "Size", etc.)
    const variationByValue = product.variations.find((variation) =>
      variation.attributes.some(
        (attr) => attr.value.toLowerCase() === sizeValue.toLowerCase()
      )
    );
    
    return variationByValue ?? null;
  }, [product, selectedSizeValue]);

  const currentPrice = currentVariation?.price ?? product?.price ?? null;
  const currentRegularPrice = currentVariation?.regularPrice ?? product?.regularPrice ?? null;

  const wishlistItemId = product
    ? `${product.id}-${selectedSizeValue || "default"}`
    : "";
  const isCurrentSelectionWishlisted = wishlistItemId
    ? isInWishlist(wishlistItemId)
    : false;

  const baseSizeDimensions = useMemo(() => {
    const parsedFromSelected = parseSizeDimensions(selectedSizeValue);
    if (parsedFromSelected) return parsedFromSelected;

    const parsedFromFirstOption = parseSizeDimensions(sizeOptions[0] ?? "");
    if (parsedFromFirstOption) return parsedFromFirstOption;

    return { width: 24, height: 36 };
  }, [selectedSizeValue, sizeOptions]);

  const customSizeUnit = useMemo(
    () => inferSizeUnit(selectedSizeValue || sizeOptions[0] || ""),
    [selectedSizeValue, sizeOptions]
  );

  const baseSizeRatio = useMemo(() => {
    if (!baseSizeDimensions) return 1;
    return baseSizeDimensions.width / baseSizeDimensions.height;
  }, [baseSizeDimensions]);

  const baseSizeArea = useMemo(() => {
    return baseSizeDimensions.width * baseSizeDimensions.height;
  }, [baseSizeDimensions]);

  const customWidthNumber = useMemo(() => Number(customWidth), [customWidth]);
  const customHeightNumber = useMemo(() => Number(customHeight), [customHeight]);
  const minimumCustomDimension = useMemo(
    () => (customSizeUnit === "cm" ? 30.48 : 12),
    [customSizeUnit]
  );
  const customSizeInputIsValid = useMemo(() => {
    if (!Number.isFinite(customWidthNumber) || !Number.isFinite(customHeightNumber)) {
      return false;
    }

    return (
      customWidthNumber >= minimumCustomDimension &&
      customHeightNumber >= minimumCustomDimension
    );
  }, [customHeightNumber, customWidthNumber, minimumCustomDimension]);
  const customWidthDisplay =
    customWidth || formatDimensionValue(baseSizeDimensions.width);
  const customHeightDisplay =
    customHeight || formatDimensionValue(baseSizeDimensions.height);

  const customCalculatedPrice = useMemo(() => {
    if (!product || currentPrice === null || !baseSizeArea || baseSizeArea <= 0) {
      return null;
    }
    if (!Number.isFinite(customWidthNumber) || !Number.isFinite(customHeightNumber)) {
      return null;
    }
    if (customWidthNumber <= 0 || customHeightNumber <= 0) return null;

    const customArea = customWidthNumber * customHeightNumber;
    return currentPrice * (customArea / baseSizeArea);
  }, [baseSizeArea, customHeightNumber, customWidthNumber, product, currentPrice]);

  const formattedCustomCalculatedPrice = useMemo(() => {
    if (!product) return null;
    return formatPrice(
      customCalculatedPrice,
      product.currencyCode,
      product.currencySymbol
    );
  }, [customCalculatedPrice, product]);

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
    return formatPrice(currentPrice, product.currencyCode, product.currencySymbol);
  }, [product, currentPrice]);

  const formattedRegularPrice = useMemo(() => {
    if (!product) return null;
    return formatPrice(
      currentRegularPrice,
      product.currencyCode,
      product.currencySymbol
    );
  }, [product, currentRegularPrice]);

  const discountPercentage = useMemo(() => {
    if (!product || currentRegularPrice === null || currentPrice === null) {
      return null;
    }
    if (currentRegularPrice <= currentPrice || currentRegularPrice <= 0) {
      return null;
    }
    return Math.round(
      ((currentRegularPrice - currentPrice) / currentRegularPrice) * 100
    );
  }, [product, currentPrice, currentRegularPrice]);

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
    if (!toastState) return;
    const timer = window.setTimeout(() => setToastState(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastState]);

  useEffect(() => {
    if (!isCustomSizeModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCustomSizeModalOpen]);

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
        price: currentPrice ?? undefined,
      },
      quantity
    );

    setToastState({
      message: "Added to bag",
      linkHref: "/cart",
      linkLabel: "View bag",
    });
  };

  const handleAddToWishlist = () => {
    if (!product || !selectedImage) return;

    const itemId = `${product.id}-${selectedSizeValue || "default"}`;
    const alreadyInWishlist = isInWishlist(itemId);

    if (!alreadyInWishlist) {
      const subtitleParts: string[] = [];
      if (selectedSizeValue) subtitleParts.push(selectedSizeValue);
      if (product.categories.length > 0) {
        subtitleParts.push(product.categories[0].name);
      }

      addWishlistItem({
        id: itemId,
        woocommerceProductId: product.id,
        title: stripHtml(product.name),
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: currentPrice ?? undefined,
        href: `/shop/${product.slug}`,
      });
    }

    setToastState({
      message: alreadyInWishlist ? "Already in wishlist" : "Added to wishlist",
      linkHref: "/wishlist",
      linkLabel: "Check now",
    });
  };

  const openCustomSizeModal = () => {
    const scaleFactor = Math.max(
      1,
      minimumCustomDimension / baseSizeDimensions.width,
      minimumCustomDimension / baseSizeDimensions.height
    );
    const initialWidth = baseSizeDimensions.width * scaleFactor;
    const initialHeight = baseSizeDimensions.height * scaleFactor;

    setCustomWidth(formatDimensionValue(initialWidth));
    setCustomHeight(formatDimensionValue(initialHeight));
    setIsCustomSizeModalOpen(true);
  };

  const handleCustomWidthChange = (rawValue: string) => {
    const sanitizedValue = normalizeDimensionInput(rawValue);
    setCustomWidth(sanitizedValue);

    const numericWidth = Number(sanitizedValue);
    if (!sanitizedValue || !Number.isFinite(numericWidth) || numericWidth <= 0) return;

    const computedHeight = numericWidth / baseSizeRatio;
    setCustomHeight(formatDimensionValue(computedHeight));
  };

  const handleCustomHeightChange = (rawValue: string) => {
    const sanitizedValue = normalizeDimensionInput(rawValue);
    setCustomHeight(sanitizedValue);

    const numericHeight = Number(sanitizedValue);
    if (!sanitizedValue || !Number.isFinite(numericHeight) || numericHeight <= 0) return;

    const computedWidth = numericHeight * baseSizeRatio;
    setCustomWidth(formatDimensionValue(computedWidth));
  };

  const enforceMinimumCustomDimension = (source: "width" | "height") => {
    const widthValue = Number(customWidth);
    const heightValue = Number(customHeight);
    if (!Number.isFinite(widthValue) || !Number.isFinite(heightValue)) return;

    let nextWidth = widthValue;
    let nextHeight = heightValue;

    if (source === "width") {
      nextWidth = Math.max(widthValue, minimumCustomDimension);
      nextHeight = nextWidth / baseSizeRatio;
      if (nextHeight < minimumCustomDimension) {
        nextHeight = minimumCustomDimension;
        nextWidth = nextHeight * baseSizeRatio;
      }
    } else {
      nextHeight = Math.max(heightValue, minimumCustomDimension);
      nextWidth = nextHeight * baseSizeRatio;
      if (nextWidth < minimumCustomDimension) {
        nextWidth = minimumCustomDimension;
        nextHeight = nextWidth / baseSizeRatio;
      }
    }

    setCustomWidth(formatDimensionValue(nextWidth));
    setCustomHeight(formatDimensionValue(nextHeight));
  };

  const handleAddCustomSizeToCart = () => {
    if (!product || !selectedImage || !product.inStock) return;

    const widthValue = Number(customWidth);
    const heightValue = Number(customHeight);
    if (!Number.isFinite(widthValue) || !Number.isFinite(heightValue)) return;
    if (widthValue <= 0 || heightValue <= 0) return;
    if (
      widthValue < minimumCustomDimension ||
      heightValue < minimumCustomDimension
    ) {
      return;
    }

    const subtitleParts: string[] = [];
    subtitleParts.push(
      `Custom: ${formatDimensionValue(widthValue)} x ${formatDimensionValue(heightValue)} ${customSizeUnit}`
    );
    if (product.categories.length > 0) {
      subtitleParts.push(product.categories[0].name);
    }

    addItem(
      {
        id: `${product.id}-custom-${formatDimensionValue(widthValue)}x${formatDimensionValue(heightValue)}-${customSizeUnit}`,
        woocommerceProductId: product.id,
        title: `${stripHtml(product.name)} (Custom Size)`,
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: customCalculatedPrice ?? currentPrice ?? undefined,
      },
      1
    );

    setToastState({
      message: "Added to bag",
      linkHref: "/cart",
      linkLabel: "View bag",
    });
    setIsCustomSizeModalOpen(false);
  };

  const renderActiveTabContent = () => {
    if (!product) return null;

    if (activeInfoTab === "About the Painting") {
      if (!aboutPaintingHtml) {
        return (
          <p className="text-[15px] leading-7 text-[#595959] md:text-[18px] md:leading-8">
            About the painting is currently unavailable.
          </p>
        );
      }

      return (
        <div className="space-y-6">
          <div className="rounded-[12px] border border-[#e4ded4] bg-[#faf8f4] p-4 md:p-6">
            <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
              About The Painting
            </p>
            <h3 className="mt-2 font-display text-[24px] leading-[1.2] text-[#313131] md:text-[32px]">
              {stripHtml(product.name)}
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-[#595959] md:text-[17px]">
              Discover the inspiration, process, and visual story behind this
              artwork.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-[12px] border border-[#e4ded4] bg-white p-4 md:p-6">
              <div
                className="prose max-w-none text-[#4f4b45] prose-p:my-0 prose-p:mb-5 prose-p:text-[15px] prose-p:leading-7 prose-p:text-[#595959] md:prose-p:text-[18px] md:prose-p:leading-8 prose-headings:font-display prose-headings:text-[#313131] prose-h2:text-[24px] md:prose-h2:text-[30px] prose-h3:text-[20px] md:prose-h3:text-[24px] prose-strong:text-[#313131] prose-ul:my-4 prose-li:text-[15px] prose-li:leading-7 prose-li:text-[#595959] md:prose-li:text-[18px] md:prose-li:leading-8"
                dangerouslySetInnerHTML={{ __html: aboutPaintingHtml }}
              />
            </article>

            <aside className="rounded-[12px] border border-[#e4ded4] bg-[#fcfbf8] p-4 md:p-5">
              <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
                Quick Highlights
              </p>
              <ul className="mt-4 space-y-3">
                {aboutPaintingHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#313131]" />
                    <span className="text-[14px] leading-6 text-[#595959] md:text-[16px] md:leading-7">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[14px] leading-6 text-[#6a655d] md:text-[15px] md:leading-7">
                Every piece is handcrafted and carefully quality-checked before
                dispatch.
              </p>
            </aside>
          </div>
        </div>
      );
    }

    if (activeInfoTab === "Specifications") {
      return (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-inter text-[20px] font-medium text-[#313131] md:text-[24px]">
              Product Information
            </h3>
            <span className="rounded-full bg-[#f4f2ee] px-3 py-1 text-[12px] text-[#595959] md:text-[14px]">
              Made for mindful buying
            </span>
          </div>
          {specificationRows.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e4ded4]">
              <div className="grid grid-cols-[minmax(110px,0.42fr)_minmax(0,1fr)] bg-[#f8f6f2] px-3 py-3 text-[13px] font-medium text-[#313131] md:grid-cols-[minmax(140px,0.38fr)_minmax(0,1fr)] md:px-4 md:text-[15px]">
                <p>Attribute</p>
                <p>Details</p>
              </div>
              <div className="divide-y divide-[#ece7de]">
                {specificationRows.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    className="grid grid-cols-[minmax(110px,0.42fr)_minmax(0,1fr)] gap-3 px-3 py-3 md:grid-cols-[minmax(140px,0.38fr)_minmax(0,1fr)] md:gap-4 md:px-4"
                  >
                    <p className="text-[14px] font-medium leading-6 text-[#313131] md:text-[17px] md:leading-7">
                      {row.label}
                    </p>
                    <p className="text-[14px] leading-6 text-[#595959] md:text-[17px] md:leading-7">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[15px] text-[#595959] md:text-[18px]">
              Product information is currently unavailable.
            </p>
          )}
        </>
      );
    }

    if (activeInfoTab === "Care Instructions") {
      return (
        <div className="space-y-4 text-[15px] leading-7 text-[#595959] md:space-y-5 md:text-[18px] md:leading-8">
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
            <div className="rounded-[10px] border border-[#dfdbd4] bg-[#faf9f6] p-4 md:p-5">
              <h3 className="font-inter text-[20px] font-medium text-[#313131] md:text-[24px]">
                Rolled Paintings
              </h3>
              <div className="mt-4 space-y-4">
                {rolledDeliveryRows.map((row) => (
                  <div key={row.title}>
                    <p className="text-[15px] font-medium leading-6 text-[#313131] md:text-[18px] md:leading-7">
                      {row.title}
                    </p>
                    <p className="text-[15px] leading-6 text-[#595959] md:text-[18px] md:leading-7">
                      {row.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[#dfdbd4] bg-[#faf9f6] p-4 md:p-5">
              <h3 className="font-inter text-[20px] font-medium text-[#313131] md:text-[24px]">
                Framed Paintings
              </h3>
              <div className="mt-4 space-y-4">
                {framedDeliveryRows.map((row) => (
                  <div key={row.title}>
                    <p className="text-[15px] font-medium leading-6 text-[#313131] md:text-[18px] md:leading-7">
                      {row.title}
                    </p>
                    <p className="text-[15px] leading-6 text-[#595959] md:text-[18px] md:leading-7">
                      {row.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[10px] border border-[#e6e1d8] bg-white p-4 text-[15px] leading-7 text-[#595959] md:p-5 md:text-[18px] md:leading-8">
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
        <div className="space-y-4 text-[15px] leading-7 text-[#595959] md:space-y-5 md:text-[18px] md:leading-8">
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
        <div className="space-y-4 text-[15px] leading-7 text-[#595959] md:space-y-5 md:text-[18px] md:leading-8">
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
      <section className={`bg-[#f4f2ee] px-4 py-12 sm:px-6 md:px-12 lg:px-24 ${className}`}>
        <div className="mx-auto max-w-[960px] border border-[#1f1f1f]/10 bg-white px-5 py-8 text-center sm:px-8 sm:py-12">
          <h2 className="font-display text-[30px] text-[#222] sm:text-4xl">Product Unavailable</h2>
          <p className="mt-4 text-[#666]">We could not find this product right now.</p>
          <Link
            href="/"
            className="mt-8 inline-flex w-full justify-center border border-[#222] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#222] transition-colors hover:bg-[#222] hover:text-white sm:w-auto"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className={`bg-[#f4f2ee] text-[#1f1f1f] ${className}`}>
      <section className="px-4 py-6 sm:px-6 md:px-12 md:py-10 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-[13px] leading-6 text-[#6d6962] sm:text-[16px] sm:leading-normal">
            Shop / Canvas Collection / {product.categories[0]?.name ?? "Bestseller"} / {stripHtml(product.name)}
          </p>

          <div className="mt-8 grid gap-y-8 md:mt-[50px] md:gap-y-10 lg:grid-cols-[500px_minmax(0,1fr)] lg:gap-x-[60px]">
            <div>
              <div className="mx-auto max-w-[500px] lg:mx-0">
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

                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
              <h1 className="font-display text-[24px] leading-[1.22] text-[#24211d] md:text-[28px] md:leading-[1.2]">
                {product.name}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[16px] text-[#313131] underline underline-offset-2 md:text-[18px]">
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
                  <span className="text-[24px] font-semibold leading-none text-[#292929] md:text-[28px]">
                    {formattedPrice ?? "Price on request"}
                  </span>
                  {discountPercentage !== null && formattedRegularPrice && (
                    <span className="text-[14px] leading-none text-[#494949] line-through md:text-[16px]">
                      {formattedRegularPrice}
                    </span>
                  )}
                  {discountPercentage !== null && (
                    <span className="text-[14px] font-semibold leading-none text-[#14AE5C] md:text-[16px]">
                      {discountPercentage}% off
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] text-[#595959] md:text-[16px]">Inclusive of all taxes</p>
              </div>

              {product.shortDescription && (
                <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#313131] md:mt-[30px] md:text-[18px] md:leading-8">
                  {stripHtml(product.shortDescription)}
                </p>
              )}

              <div className="mt-6 md:mt-[30px]">
                <p className="text-[14px] text-[#595959] md:text-[16px]">Choose a Size</p>
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
                <p className="mt-6 text-[14px] text-[#595959] md:mt-[30px] md:text-[16px]">
                  SKU: {product.sku}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-stretch gap-2.5 sm:gap-3 md:mt-[30px]">
                <div className="order-1 flex h-[46px] items-center overflow-hidden rounded-[10px] border border-[#dcdad8] bg-white md:order-none md:h-[50px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-full w-[40px] items-center justify-center text-[#313131] transition-colors hover:bg-[#EDF0F8] hover:text-[#3A4980] active:bg-[#dfe6f7] md:w-[44px]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-[42px] text-center font-inter text-[15px] font-medium text-[#313131] md:w-[46px] md:text-[16px]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-full w-[40px] items-center justify-center text-[#313131] transition-colors hover:bg-[#EDF0F8] hover:text-[#3A4980] active:bg-[#dfe6f7] md:w-[44px]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className="order-3 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#1f1f1f] px-4 py-3 text-[16px] font-normal text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#8c8578] md:order-none md:w-auto md:px-6 md:text-[18px]"
                >
                  Add to Bag
                  <Image
                    src="/add-icon.svg"
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </button>

                <button
                  type="button"
                  onClick={openCustomSizeModal}
                  className="order-4 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#FFDB4B] px-4 py-3 text-[16px] font-normal text-[#2c250f] transition-colors hover:bg-[#f2ce3f] md:order-none md:w-auto md:px-6 md:text-[18px]"
                >
                  Order a Custom Size
                  <Image
                    src="/custom-order-icon.svg"
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </button>

                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  aria-label="Add to wishlist"
                  className={`order-2 inline-flex h-[46px] w-[46px] items-center justify-center rounded-[6px] transition-colors md:order-none md:h-[50px] md:w-[50px] ${
                    isCurrentSelectionWishlisted
                      ? "bg-[#EDF0F8] text-[#3A4980] hover:bg-[#e1e6f4]"
                      : "bg-[#F3F3F3] text-[#5b5b5b] hover:bg-[#e8e8e8]"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isCurrentSelectionWishlisted ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

              <details className="group mt-5 overflow-hidden rounded-[6px] bg-transparent md:mt-[24px]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 font-inter text-[15px] leading-6 text-[#3a3a3a] [&::-webkit-details-marker]:hidden md:px-4 md:text-[18px] md:leading-tight">
                  <span className="inline-flex items-center gap-3">
                    <Truck className="h-4 w-4 shrink-0 text-[#3a3a3a] md:h-5 md:w-5" />
                    <span>Ships rolled. Frame it locally in your city to hang it</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#4f4f4f] transition-transform group-open:rotate-180 md:h-5 md:w-5" />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-open:grid-rows-[1fr]">
                  <p className="overflow-hidden border-t border-[#ededed] px-3 py-3 text-[14px] leading-6 text-[#595959] opacity-0 transition-opacity duration-300 ease-in-out group-open:opacity-100 md:px-4 md:text-[15px]">
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

          <div className="mt-7 hidden rounded-[16px] border border-[#d8d4cd] bg-gradient-to-b from-[#fbfaf8] to-[#f5f2ec] p-3 md:mt-9 md:block md:p-6">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:gap-2 md:overflow-visible md:px-0 md:pb-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {TAB_LABELS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveInfoTab(tab)}
                  className={`min-w-[210px] rounded-[10px] border px-4 py-3 text-left transition-all md:min-w-0 ${
                    activeInfoTab === tab
                      ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                      : "border-[#d7d2c9] bg-white text-[#4f4b45] hover:border-[#1f1f1f]/30 hover:bg-[#faf9f6]"
                  }`}
                >
                  <span className="block text-[16px] font-medium leading-tight md:text-[18px]">{tab}</span>
                  <span
                    className={`mt-2 block text-[12px] leading-5 md:text-[13px] ${
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

          <div className="mt-5 space-y-2 md:hidden">
            {TAB_LABELS.map((tab) => {
              const isActive = activeInfoTab === tab;

              return (
                <div
                  key={tab}
                  className="overflow-hidden rounded-[12px] border border-[#ddd8cf] bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setActiveInfoTab(tab)}
                    aria-expanded={isActive}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="font-inter text-[16px] font-medium text-[#2f2b26]">
                      {tab}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#57534b] transition-transform ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-[#eee9df] p-3">
                        {isActive ? renderActiveTabContent() : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 hidden rounded-[16px] border border-[#e1ddd5] bg-white p-4 md:block md:p-7">
            {renderActiveTabContent()}
          </div>
        </div>
      </section>

      {toastState ? (
        <div className="fixed bottom-4 left-3 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] items-start gap-2.5 rounded-[10px] border border-[#d9e7da] bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[420px] sm:items-center sm:gap-3 sm:px-4 sm:py-3">
          <BadgeCheck className="h-4 w-4 shrink-0 text-[#14AE5C] sm:h-5 sm:w-5" />
          <p className="font-inter text-[13px] text-[#313131] sm:text-[14px]">{toastState.message}</p>
          {toastState.linkHref && toastState.linkLabel ? (
            <Link
              href={toastState.linkHref}
              className="ml-auto whitespace-nowrap font-inter text-[13px] text-[#313131] underline underline-offset-2 sm:ml-0 sm:text-[14px]"
            >
              {toastState.linkLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      {isCustomSizeModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:p-4 md:items-center md:p-6">
          <button
            type="button"
            aria-label="Close custom size modal"
            onClick={() => setIsCustomSizeModalOpen(false)}
            className="absolute inset-0 bg-black/55"
          />

          <div className="relative z-[71] w-full max-w-[1080px] overflow-hidden rounded-t-[16px] bg-white shadow-[0_22px_48px_rgba(0,0,0,0.28)] sm:rounded-[14px]">
            <div className="grid max-h-[92dvh] overflow-y-auto lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)]">
              <div className="p-4 sm:p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => setIsCustomSizeModalOpen(false)}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3f3] text-[#313131] hover:bg-[#e7e7e7] sm:right-4 sm:top-4"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
                  Custom Size Calculator
                </p>
                <h3 className="mt-2 font-display text-[28px] leading-[1.18] text-[#24211d] md:text-[34px]">
                  Order a Custom Size
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#595959] md:text-[17px]">
                  Enter either width or height. The other dimension is
                  automatically calculated using the original artwork ratio.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[14px] font-medium text-[#313131]">
                      Width ({customSizeUnit})
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customWidth}
                      onChange={(event) => handleCustomWidthChange(event.target.value)}
                      onBlur={() => enforceMinimumCustomDimension("width")}
                      className="w-full rounded-[10px] border border-[#d7d2c9] px-3 py-3 text-[16px] text-[#24211d] outline-none transition-colors focus:border-[#3A4980] md:text-[18px]"
                      placeholder="Enter width"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[14px] font-medium text-[#313131]">
                      Height ({customSizeUnit})
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customHeight}
                      onChange={(event) => handleCustomHeightChange(event.target.value)}
                      onBlur={() => enforceMinimumCustomDimension("height")}
                      className="w-full rounded-[10px] border border-[#d7d2c9] px-3 py-3 text-[16px] text-[#24211d] outline-none transition-colors focus:border-[#3A4980] md:text-[18px]"
                      placeholder="Enter height"
                    />
                  </label>
                </div>

                <p className="mt-3 text-[14px] text-[#6a655d]">
                  Base ratio: {baseSizeDimensions ? `${formatDimensionValue(baseSizeDimensions.width)}:${formatDimensionValue(baseSizeDimensions.height)}` : "Original ratio"}
                </p>
                <p className="mt-1 text-[14px] text-[#6a655d]">
                  Minimum allowed dimension is 1 foot ({formatDimensionValue(minimumCustomDimension)} {customSizeUnit}).
                </p>
                {!customSizeInputIsValid && customWidth && customHeight ? (
                  <p className="mt-2 text-[14px] text-[#b24534]">
                    Both width and height must be at least 1 foot.
                  </p>
                ) : null}

                <div className="mt-6 rounded-[12px] border border-[#e3ddd3] bg-[#faf8f4] p-4">
                  <p className="text-[14px] text-[#6a655d]">Estimated Price</p>
                  <p className="mt-1 font-display text-[28px] leading-none text-[#292929] md:text-[34px]">
                    {formattedCustomCalculatedPrice ?? "Price on request"}
                  </p>
                  <p className="mt-2 text-[14px] text-[#595959]">
                    Price updates instantly from your custom dimensions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomSizeToCart}
                  disabled={
                    !product.inStock ||
                    !customWidth ||
                    !customHeight ||
                    !customSizeInputIsValid
                  }
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#1f1f1f] px-6 py-3 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#8c8578] md:w-auto md:text-[18px]"
                >
                  Add to Bag
                  <Image
                    src="/add-icon.svg"
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </button>
              </div>

              <div className="relative hidden min-h-[360px] bg-[#f3f0ea] p-6 md:block md:p-8">
                <div className="relative flex h-full min-h-[320px] items-center justify-center rounded-[12px] border border-[#ddd7cc] bg-[#ece7de] p-8">
                  <div className="relative w-[68%] rounded-[4px] border-[8px] border-[#f8f4ec] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      <Image
                        src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                        alt={selectedImage?.alt || stripHtml(product.name)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 70vw, 30vw"
                      />
                    </div>

                    <div className="pointer-events-none absolute -bottom-11 left-0 right-0 mx-auto w-[92%]">
                      <div className="relative border-t-2 border-[#2c2c2c]">
                        <span className="absolute -left-1 -top-[6px] h-3 w-[2px] bg-[#2c2c2c]" />
                        <span className="absolute -right-1 -top-[6px] h-3 w-[2px] bg-[#2c2c2c]" />
                        <span className="block pt-2 text-center font-inter text-[14px] font-medium text-[#2c2c2c]">
                          Width: {customWidthDisplay} {customSizeUnit}
                        </span>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute -left-12 top-0 bottom-0 my-auto h-[92%]">
                      <div className="relative h-full border-l-2 border-[#2c2c2c]">
                        <span className="absolute -left-[6px] -top-1 w-3 h-[2px] bg-[#2c2c2c]" />
                        <span className="absolute -left-[6px] -bottom-1 w-3 h-[2px] bg-[#2c2c2c]" />
                        <span className="absolute left-[-34px] top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap font-inter text-[14px] font-medium text-[#2c2c2c]">
                          Height: {customHeightDisplay} {customSizeUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-12 text-center text-[14px] text-[#4f4b45]">
                  Dimension markings update live with your custom inputs.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {product.faqs && product.faqs.length > 0 ? (
        <section className="px-4 pt-4 sm:px-6 md:px-12 md:pt-6 lg:px-24">
          <div className="mx-auto max-w-[1440px]">
            <ProductFAQs faqs={product.faqs} />
          </div>
        </section>
      ) : null}

      <section className="px-4 py-10 sm:px-6 md:px-12 md:py-12 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-8">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[52px] md:leading-none">
              Shop More Like This
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border-b border-[#1f1f1f] pb-1 text-[11px] uppercase tracking-[0.08em] md:text-[12px]"
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
                <p className="mt-3 text-[12px] text-[#7a7368] md:text-[14px]">Handmade Painting</p>
                <h3 className="mt-1 font-display text-[15px] leading-[1.32] text-[#1f1f1f] md:text-[18px]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[12px] text-[#6f685f] md:text-[14px]">
                  Handmade Painting | {item.sizes} | Acrylic Colors on Canvas
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-center md:text-[52px] md:leading-none">
            Why Artace Studio
          </h2>
          <p className="mt-4 max-w-[980px] text-[15px] leading-7 text-[#595959] md:mx-auto md:text-center md:text-[18px] md:leading-8">
            Bringing a new piece of art into your life is a significant moment, one filled with excitement and personal expression. We believe the experience of acquiring it should be just as inspiring and effortless.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-12 md:gap-x-10 md:gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {WHY_ARTACE_POINTS.map(({ title, text, iconSrc }) => (
              <div
                key={title}
                className="flex h-full w-full flex-col items-start text-left md:mx-auto md:max-w-[320px] md:items-center md:text-center lg:max-w-none"
              >
                <Image
                  src={iconSrc}
                  alt={title}
                  width={64}
                  height={64}
                  className="h-11 w-auto object-contain md:mx-auto md:h-14"
                />
                <h3 className="mt-5 font-display text-[22px] leading-[1.2] text-[#313131] md:text-[25px]">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-[#595959] md:text-[18px] md:leading-8">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080909] px-4 py-12 text-white sm:px-6 md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto grid max-w-[1440px] items-center gap-y-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-x-[80px]">
          <div>
            <p className="font-inter text-[14px] font-normal text-white/65 md:text-[18px]">
              {toTitleCase(advisor.description)}
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-[27px] leading-[1.12] text-white md:text-[36px]">
              {advisor.headline}
            </h2>
            <Link
              href={advisor.ctaHref}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-white px-5 py-3 text-[15px] font-medium text-[#141414] transition-colors hover:bg-[#f3f3f3] sm:w-auto md:text-[18px]"
            >
              {advisor.ctaLabel}
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="justify-self-center text-center md:justify-self-end">
            <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-full md:h-72 md:w-72">
              <Image
                src={advisor.image}
                alt={advisor.name}
                fill
                sizes="(max-width: 768px) 208px, 288px"
                className="object-cover"
              />
            </div>
            <p className="mt-5 text-[15px] text-white/70">
              {advisor.name}, {advisor.role}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-8">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[58px] md:leading-none">
              Read More about Art
            </h2>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 border-b border-[#1f1f1f] pb-1 text-[11px] uppercase tracking-[0.08em] md:text-[12px]"
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
                <h3 className="mt-2 font-display text-[22px] leading-[1.18] text-[#1f1f1f] md:text-[28px]">
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
