import type { WooStoreProduct, VariationData } from "./types";
import { parsePrice } from "@/lib/currency/parse-price";

const STOCK_STATUS_MAPPING: Record<string, string> = {
  instock: "https://schema.org/InStock",
  outofstock: "https://schema.org/OutOfStock",
  onbackorder: "https://schema.org/BackOrder",
  // Deliberately no "unknown" entry. An unmapped status must NOT fall through
  // to InStock — see the guard in generateOfferSchema below.
};

const DEFAULT_CURRENCY = "INR";

/**
 * A price is only safe to publish if it parsed to a real, non-negative,
 * finite number. Woo sends "" for a product with no purchasable variation,
 * which parsePrice turns into null, and Number("garbage") into NaN — both of
 * which used to reach .toFixed(2) and emit the literal string "NaN" into
 * JSON-LD, which Google treats as invalid structured data.
 */
const toOfferPrice = (value: number | null): string | null => {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  return value.toFixed(2);
};

export interface OfferSchemaOptions {
  product: WooStoreProduct;
  productUrl: string;
  variation?: VariationData;
}

export function generateOfferSchema({ product, productUrl, variation }: OfferSchemaOptions) {
  // WooCommerce Store API prices are integer amounts in the currency's MINOR
  // unit (paise for INR). This schema previously skipped the division
  // entirely, publishing e.g. 15000000.00 as the price of a Rs 1,50,000
  // painting. parsePrice is now the single shared source of that conversion.
  const minorUnit = product.prices.currency_minor_unit ?? 2;
  const price = variation?.price ?? parsePrice(product.prices.price, minorUnit);
  const salePrice =
    variation?.salePrice ?? parsePrice(product.prices.sale_price, minorUnit);

  const isOnSale = product.on_sale || (variation?.onSale ?? false);

  // Prefer the variation's explicit flag, but only when it is actually
  // present — an undefined inStock used to be falsy and silently fall back
  // to the PARENT product's status, which is wrong for a sold-out variation.
  const variationStock = variation?.inStock;
  const stockStatus =
    variationStock === true
      ? "https://schema.org/InStock"
      : variationStock === false
        ? "https://schema.org/OutOfStock"
        : (STOCK_STATUS_MAPPING[product.stock_status] ??
          "https://schema.org/SoldOut");

  const offerSchema: Record<string, unknown> = {
    "@type": "Offer",
    "priceCurrency": product.prices.currency_code || DEFAULT_CURRENCY,
    "availability": stockStatus,
    "url": productUrl,
    "itemCondition": "https://schema.org/NewCondition",
  };

  const offerPrice = toOfferPrice(isOnSale && salePrice !== null ? salePrice : price);
  if (offerPrice !== null) {
    offerSchema["price"] = offerPrice;
  }

  // priceValidUntil was previously a rolling "now + 30 days" on every request.
  // For a one-of-one original there is no price window at all, and for
  // anything else a self-generated 30-day date is a claim we cannot make.
  // Omitted rather than faked.
  //
  // highPrice was also removed — it is not a schema.org Offer property and
  // was emitting a bogus second price for every sale item.

  if (variation) {
    const variationName = variation.attributes
      .map((attr) => attr.value)
      .join(" / ");

    offerSchema["itemOffered"] = {
      "@type": "Product",
      "name": variationName ? `${product.name} - ${variationName}` : product.name,
    };
  }

  return offerSchema;
}

export function generateAllOffersSchema(product: WooStoreProduct, productUrl: string) {
  if (product.variations && product.variations.length > 0) {
    return product.variations.map((variation) =>
      generateOfferSchema({ product, productUrl, variation })
    );
  }

  return [generateOfferSchema({ product, productUrl })];
}
