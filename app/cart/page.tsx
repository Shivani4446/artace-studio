"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

const CartPage = () => {
  const { items, itemCount, subtotal, incrementItem, decrementItem, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <h1 className="font-display text-5xl text-[#222]">Your Cart Is Empty</h1>
        <p className="mt-4 max-w-xl text-[#666]">
          You have not added anything yet. Browse our collections and add your
          favorites.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 border border-[#222] px-6 py-3 text-sm font-medium uppercase tracking-[0.05em] text-[#222] transition-colors hover:bg-[#222] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Cart</p>
          <h1 className="mt-2 font-display text-5xl text-[#222]">Your Items</h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold uppercase tracking-[0.06em] text-[#555] underline underline-offset-4 hover:text-[#111]"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-[#1f1f1f]/10 border-y border-[#1f1f1f]/10">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-5 py-6 sm:flex-row">
              <div className="relative h-36 w-28 shrink-0 overflow-hidden bg-[#f3f3f3]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="font-display text-[28px] leading-tight text-[#222]">
                    {item.title}
                  </h2>
                  {item.subtitle && (
                    <p className="mt-2 text-sm uppercase tracking-[0.06em] text-[#666]">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <div className="flex items-center border border-[#222]/20">
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      className="px-3 py-2 hover:bg-[#f3f3f3]"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      className="px-3 py-2 hover:bg-[#f3f3f3]"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-[#666] hover:text-[#111]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-[#1f1f1f]/10 bg-white p-6">
          <h3 className="font-display text-3xl text-[#222]">Summary</h3>
          <div className="mt-6 space-y-3 text-sm text-[#555]">
            <div className="flex items-center justify-between">
              <span>Total Items</span>
              <span className="font-semibold text-[#222]">{itemCount}</span>
            </div>
            {subtotal > 0 && (
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#222]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mt-8 w-full bg-[#222] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </main>
  );
};

export default CartPage;

