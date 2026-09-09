"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

export type SamoraProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  regularPrice: number | null;
  currencySymbol: string;
  categories: { name: string; slug: string }[];
  attributes: { name: string; options: string[] }[];
};

const SamoraProductCard = ({ product }: { product: SamoraProduct }) => {
  const { formatPrice } = useCurrency();
  const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlist();
  const isOnSale =
    product.price !== null &&
    product.regularPrice !== null &&
    product.price < product.regularPrice;
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isWishlisted) {
      removeWishlistItem(product.id);
      return;
    }
    addWishlistItem({
      id: product.id,
      woocommerceProductId: product.id,
      title: product.name,
      image: product.image,
      subtitle: product.categories[0]?.name,
      price: product.price ?? undefined,
      href: `/samora/shop/${product.slug}`,
    });
  };

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
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#2b2420] backdrop-blur transition-colors hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[#c1683d] text-[#c1683d]" : ""}`} strokeWidth={1.75} />
        </button>
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
