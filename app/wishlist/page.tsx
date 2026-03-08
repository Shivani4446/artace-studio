"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const formatPrice = (value?: number) => {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const WishlistPage = () => {
  const { addItem } = useCart();
  const { items, itemCount, removeItem, clearWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <div className="mb-6 rounded-full bg-[#F5F5F5] p-6">
          <Heart className="h-12 w-12 text-[#666]" />
        </div>
        <h1 className="font-display text-4xl text-[#222] md:text-5xl">
          Your Wishlist Is Empty
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[#666]">
          Save artworks you love and come back to compare them anytime.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 bg-[#222] px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Explore Paintings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Wishlist</p>
          <h1 className="mt-2 font-display text-4xl text-[#222] md:text-5xl">
            Saved Artworks
          </h1>
          <p className="mt-2 text-[#666]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your wishlist
          </p>
        </div>
        <button
          type="button"
          onClick={clearWishlist}
          className="text-sm font-medium text-[#666] underline underline-offset-4 hover:text-[#111]"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item) => {
          const formattedPrice = formatPrice(item.price);

          return (
            <article key={item.id} className="flex gap-6 border-b border-[#E5E5E5] pb-6">
              <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-[#222]">{item.title}</h2>
                  {item.subtitle ? (
                    <p className="mt-1 text-sm text-[#666]">{item.subtitle}</p>
                  ) : null}
                  {formattedPrice ? (
                    <p className="mt-2 font-medium text-[#222]">{formattedPrice}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => addItem(item, 1)}
                    className="inline-flex items-center gap-2 rounded-[6px] bg-[#1f1f1f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Bag
                  </button>

                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-[#444] underline underline-offset-4 hover:text-[#111]"
                    >
                      View Product
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1 text-sm text-[#666] transition-colors hover:text-[#222]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#666] transition-colors hover:text-[#222]"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>
    </main>
  );
};

export default WishlistPage;
