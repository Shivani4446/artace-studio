"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/components/currency/CurrencyProvider";

export type SamoraProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  regularPrice: number | null;
  currencySymbol: string;
};

const SamoraProductCard = ({ product }: { product: SamoraProduct }) => {
  const { formatPrice } = useCurrency();
  const isOnSale =
    product.price !== null &&
    product.regularPrice !== null &&
    product.price < product.regularPrice;

  return (
    <Link
      href={`/samora/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] transition-colors hover:border-[#c1683d]/40"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#f3ead9]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-[14.5px] font-medium leading-snug text-[#2b2420]">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          {product.price !== null ? (
            <span className="text-[14.5px] font-semibold text-[#c1683d]">
              {formatPrice(product.price)}
            </span>
          ) : null}
          {isOnSale && product.regularPrice !== null ? (
            <span className="text-[13px] text-[#8a7c68] line-through">
              {formatPrice(product.regularPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default SamoraProductCard;
