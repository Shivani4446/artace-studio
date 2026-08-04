"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import AddToCartButton from "@/components/cart/AddToCartButton";

export type ArtistGridProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number | null;
};

export default function ArtistProductGrid({ products }: { products: ArtistGridProduct[] }) {
  const { formatPrice } = useCurrency();

  if (products.length === 0) {
    return <p className="text-[15px] text-[#666]">No paintings currently available from this artist.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {products.map((product) => (
        <article key={product.id} className="group relative flex flex-col">
          <Link
            href={`/shop/${product.slug}`}
            aria-label={`Open ${product.name}`}
            className="absolute inset-0 z-10"
          />
          <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 48vw, 24vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <h3 className="font-display text-[17px] leading-snug text-[#2c2c2c] sm:text-[22px]">
            {product.name}
          </h3>
          {product.price !== null ? (
            <p className="mt-1 text-[14px] text-[#2c2c2c] sm:text-[16px]">
              {formatPrice(product.price)}
            </p>
          ) : null}
          <div className="pointer-events-auto relative z-20 mt-4">
            <AddToCartButton
              id={product.id}
              woocommerceProductId={product.id}
              title={product.name}
              image={product.image}
              price={product.price ?? undefined}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
