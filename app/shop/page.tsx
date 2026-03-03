import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://artacestudio.com";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

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

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  prices: WooStorePrices;
};

const parsePrice = (rawValue: string | undefined, minorUnit: number) => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
};

const formatPrice = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  if (value === null) return "Price on request";
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

const getStoreProducts = async (): Promise<WooStoreProduct[]> => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");

  const response = await fetch(
    `${normalizedBaseUrl}/wp-json/wc/store/v1/products?per_page=24`,
    {
      next: { revalidate: 120 },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WooCommerce products (${response.status}).`);
  }

  const payload = (await response.json()) as WooStoreProduct[];
  return Array.isArray(payload) ? payload : [];
};

const ShopPage = async () => {
  let products: WooStoreProduct[] = [];
  let loadError: string | null = null;

  try {
    products = await getStoreProducts();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load products.";
  }

  return (
    <main className="bg-[#f4f2ee] px-6 py-10 md:px-12 md:py-14 lg:px-24">
      <section className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#67625a]">
              Artace Studio
            </p>
            <h1 className="mt-2 font-display text-[56px] leading-none text-[#1f1f1f] md:text-[68px]">
              Shop
            </h1>
          </div>
          <p className="max-w-xl text-sm text-[#5f5a52]">
            Discover original artworks and handcrafted canvas paintings from our
            WooCommerce collection.
          </p>
        </div>

        {loadError ? (
          <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">Could not load products</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">No products found</p>
            <p className="mt-2 text-sm">
              Your WooCommerce store returned an empty product list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const minorUnit = product.prices?.currency_minor_unit ?? 2;
              const price = parsePrice(product.prices?.price, minorUnit);
              const regularPrice = parsePrice(product.prices?.regular_price, minorUnit);
              const primaryImage = product.images[0];
              const imageUrl = primaryImage?.src || FALLBACK_PRODUCT_IMAGE;
              const categoryLabel =
                product.categories.length > 0 ? product.categories[0].name : "Artwork";

              return (
                <article key={product.id} className="group flex flex-col">
                  <Link href={`/shop/${product.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-[#e7e3dc]">
                      <Image
                        src={imageUrl}
                        alt={primaryImage?.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368]">
                      {categoryLabel}
                    </p>

                    <Link
                      href={`/shop/${product.slug}`}
                      className="mt-1 block font-display text-[28px] leading-[1.2] text-[#1f1f1f] transition-colors hover:text-black"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      {regularPrice && regularPrice > (price ?? 0) && (
                        <span className="text-[14px] text-[#7a7368] line-through">
                          {formatPrice(
                            regularPrice,
                            product.prices.currency_code,
                            product.prices.currency_symbol
                          )}
                        </span>
                      )}
                      <span className="font-semibold text-[#27231f]">
                        {formatPrice(
                          price,
                          product.prices.currency_code,
                          product.prices.currency_symbol
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <AddToCartButton
                      id={product.id}
                      title={product.name}
                      image={imageUrl}
                      subtitle={categoryLabel}
                      price={price ?? undefined}
                      className="!px-4 !py-2 !text-[11px]"
                    />

                    <Link
                      href={`/shop/${product.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4f4b45] hover:text-black"
                    >
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default ShopPage;

