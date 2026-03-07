"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

type AddToCartButtonProps = {
  id: number | string;
  woocommerceProductId?: number;
  woocommerceVariationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  className?: string;
};

const AddToCartButton = ({
  id,
  woocommerceProductId,
  woocommerceVariationId,
  title,
  image,
  subtitle,
  price,
  className = "",
}: AddToCartButtonProps) => {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() =>
        addItem({
          id,
          woocommerceProductId,
          woocommerceVariationId,
          title,
          image,
          subtitle,
          price,
        })
      }
      className={`inline-flex items-center gap-2 border border-[#2c2c2c]/30 px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white ${className}`}
    >
      <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.8} />
      Add to Cart
    </button>
  );
};

export default AddToCartButton;

