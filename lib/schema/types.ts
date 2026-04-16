export interface WooStorePrices {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
}

export interface WooStoreImage {
  id: number;
  src: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
}

export interface WooStoreCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooStoreAttributeTerm {
  id: number;
  name: string;
  slug: string;
}

export interface WooStoreAttribute {
  id: number;
  name: string;
  options?: string[];
  terms?: WooStoreAttributeTerm[];
}

export interface VariationData {
  id: number;
  attributes: { name: string; value: string }[];
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
}

export interface WooStoreProduct {
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
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  attributes: WooStoreAttribute[];
  prices: WooStorePrices;
  related_ids?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  variations?: VariationData[];
  meta_data?: { key: string; value: unknown }[];
}

export interface WooCommerceReview {
  id: number;
  date_created: string;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
  verified: boolean;
  product_id: number;
}

export interface ProductSchemaInput {
  product: WooStoreProduct;
  reviews?: WooCommerceReview[];
  baseUrl?: string;
}

export interface SchemaOutput {
  "@context": "https://schema.org";
  "@graph": unknown[];
}