"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ChatProductCardData } from "@/lib/chat/types";

const formatPrice = (price: number | null, currencySymbol = "₹") => {
  if (price === null) return null;
  return `${currencySymbol}${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const ChatProductCard = ({ product }: { product: ChatProductCardData }) => {
  const formattedPrice = formatPrice(product.price, product.currencySymbol);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="flex items-center gap-3 rounded-[10px] border border-black/10 bg-white p-2 transition-colors hover:bg-[#f6f3ee]"
    >
      <span className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] bg-[#f1f1f1]">
        {product.image ? (
          <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[#2c2c2c]">
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {formattedPrice ? (
            <span className="text-[12px] font-semibold text-[#2c2c2c]">{formattedPrice}</span>
          ) : null}
          {product.inStock === false ? (
            <span className="text-[11px] text-[#b3402c]">Out of stock</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default ChatProductCard;
