"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { inter } from "@/lib/fonts";

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

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

const ShopBestsellers = () => {
  const [products, setProducts] = useState<FeaturedProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetch("/api/homepage/highlights")
      .then((response) => (response.ok ? response.json() : { featuredProducts: [] }))
      .then((data: { featuredProducts?: FeaturedProductCard[] }) => {
        if (!isActive) return;
        setProducts(data.featuredProducts ?? []);
      })
      .catch(() => {
        if (isActive) setProducts([]);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section
      className={`bg-[#FAF9F6] py-14 md:py-20 ${inter.variable}`}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-playfair text-3xl text-[#2C2C2C] tracking-wide md:text-5xl">
              Bestselling Handcrafted Canvas Paintings
            </h2>
            <p className="mt-3 font-inter text-[15px] text-[#666666] md:text-[16px]">
              The pieces our collectors return to again and again, devotional,
              abstract, and everything between.
            </p>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-2 font-inter text-[#4A4846] text-sm font-medium border-b border-[#4A4846] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            SHOP ALL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-12">
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={`bestseller-skeleton-${index}`} className="flex flex-col gap-3">
                <div className="aspect-square w-full animate-pulse rounded-[10px] bg-gray-200 sm:rounded-[12px]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
              </div>
            ))
          ) : products.length === 0 ? (
            <p className="font-inter col-span-full text-sm text-[#666666]">
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
                  {/* Image Container */}
                  <div className="relative mb-3 w-full aspect-square overflow-hidden rounded-[10px] bg-gray-200 sm:mb-4 sm:rounded-[12px]">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col gap-1">
                    <p className="font-inter text-[12px] text-[#666666] sm:text-[14px]">
                      {product.categoryLabel}
                    </p>
                    <h3 className="font-playfair text-[15px] leading-snug text-[#2C2C2C] sm:text-[18px]">
                      {product.title}
                    </h3>
                    <p className="line-clamp-2 font-inter text-[12px] text-[#666666] sm:text-[14px]">
                      {product.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pointer-events-auto relative z-20 mt-3 translate-y-0 opacity-100 transition-all duration-300 sm:mt-4 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <AddToCartButton
                    id={product.id}
                    woocommerceProductId={product.id}
                    title={product.title}
                    image={product.image}
                    subtitle={product.subtitle}
                    className="origin-top-left scale-[0.88] self-start sm:scale-100"
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopBestsellers;
