import React from "react";
import SingleProduct from "@/components/singleproduct/SingleProduct";

type SingleProductPageProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://artacestudio.com";

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
  thumbnail?: string;
  alt?: string;
  name?: string;
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
};

const getSingleProduct = async (slug: string): Promise<WooStoreProduct | null> => {
  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
    const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${normalizedBaseUrl}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 120 } }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WooStoreProduct[];
    return Array.isArray(payload) && payload.length > 0 ? payload[0] : null;
  } catch {
    return null;
  }
};

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  return <SingleProduct initialProduct={product} />;
};

export default SingleProductPage;
