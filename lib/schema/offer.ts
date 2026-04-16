import type { WooStoreProduct, VariationData } from "./types";

const STOCK_STATUS_MAPPING: Record<string, string> = {
  instock: "https://schema.org/InStock",
  outofstock: "https://schema.org/OutOfStock",
  onbackorder: "https://schema.org/PreOrder",
};

const DEFAULT_CURRENCY = "INR";

export interface OfferSchemaOptions {
  product: WooStoreProduct;
  variation?: VariationData;
}

export function generateOfferSchema({ product, variation }: OfferSchemaOptions) {
  const price = variation?.price ?? parseFloat(product.prices.price);
  const regularPrice = variation?.regularPrice ?? parseFloat(product.prices.regular_price);
  const salePrice = variation?.salePrice ?? (product.prices.sale_price ? parseFloat(product.prices.sale_price) : null);
  
  const isOnSale = product.on_sale || (variation?.onSale ?? false);
  
  const stockStatus = variation?.inStock 
    ? "https://schema.org/InStock"
    : STOCK_STATUS_MAPPING[product.stock_status] ?? "https://schema.org/InStock";

  const priceValidUntil = new Date();
  priceValidUntil.setDate(priceValidUntil.getDate() + 30);

  const offerSchema: Record<string, unknown> = {
    "@type": "Offer",
    "price": price.toFixed(2),
    "priceCurrency": product.prices.currency_code || DEFAULT_CURRENCY,
    "availability": stockStatus,
    "url": product.permalink,
    "priceValidUntil": priceValidUntil.toISOString().split("T")[0],
    "itemCondition": "https://schema.org/NewCondition",
  };

  if (isOnSale && salePrice) {
    offerSchema["price"] = salePrice.toFixed(2);
  }

  if (regularPrice && regularPrice > price) {
    offerSchema["highPrice"] = regularPrice.toFixed(2);
  }

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

export function generateAllOffersSchema(product: WooStoreProduct) {
  if (product.variations && product.variations.length > 0) {
    return product.variations.map((variation) =>
      generateOfferSchema({ product, variation })
    );
  }

  return [generateOfferSchema({ product })];
}