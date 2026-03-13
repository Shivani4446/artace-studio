"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";

const getCheckoutProductId = (
  id: number | string,
  woocommerceProductId?: number
) => {
  if (typeof woocommerceProductId === "number" && woocommerceProductId > 0) {
    return woocommerceProductId;
  }

  if (typeof id === "number" && id > 0) return id;
  const parsedFromPrefix = Number(String(id).split("-")[0]);
  return Number.isFinite(parsedFromPrefix) && parsedFromPrefix > 0
    ? parsedFromPrefix
    : null;
};

export default function CartPage() {
  const { status: authStatus } = useAuthSession();
  const {
    items,
    itemCount,
    subtotal,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

  const hasCheckoutReadyItems = useMemo(
    () => items.some((item) => getCheckoutProductId(item.id, item.woocommerceProductId)),
    [items]
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <div className="mb-6 rounded-full bg-[#F5F5F5] p-6">
          <ShoppingBag className="h-12 w-12 text-[#666]" />
        </div>
        <h1 className="font-display text-4xl text-[#222] md:text-5xl">Your Cart Is Empty</h1>
        <p className="mt-4 max-w-xl text-lg text-[#666]">
          You have not added anything yet. Browse our collections and add your favorites.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex min-h-11 items-center gap-2 bg-[#222] px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </main>
    );
  }

  const isAuthenticated = authStatus === "authenticated";
  const checkoutDisabled = !hasCheckoutReadyItems;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Cart</p>
          <h1 className="mt-2 font-display text-4xl text-[#222] md:text-5xl">Shopping Cart</h1>
          <p className="mt-2 text-[#666]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="min-h-11 text-sm font-medium text-[#666] underline underline-offset-4 hover:text-[#111]"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-6 sm:flex-row sm:gap-6"
            >
              <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:gap-6">
                <div className="flex-1">
                  <h2 className="font-display text-xl text-[#222]">{item.title}</h2>
                  {item.subtitle && (
                    <p className="mt-1 text-sm text-[#666]">{item.subtitle}</p>
                  )}
                  <p className="mt-2 font-medium text-[#222]">
                    INR {(item.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center border border-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      className="min-h-11 min-w-11 px-3 py-2 transition-colors hover:bg-[#F5F5F5]"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="mx-auto h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      className="min-h-11 min-w-11 px-3 py-2 transition-colors hover:bg-[#F5F5F5]"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="mx-auto h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex min-h-11 items-center gap-1 text-sm text-[#666] transition-colors hover:text-[#222]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-left sm:min-w-[120px] sm:text-right">
                <p className="font-display text-xl text-[#222]">
                  INR {((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}

          <Link
            href="/shop"
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#666] transition-colors hover:text-[#222]"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <aside className="h-fit rounded-2xl bg-[#FAF9F6] p-6 sm:p-8">
          <h3 className="font-display text-2xl text-[#222]">Order summary</h3>

          <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-[#666]">Subtotal</span>
              <span className="font-medium text-[#222]">
                INR {subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#666]">
              Delivery details and payment happen on the next step.
            </p>
          </div>

          {!hasCheckoutReadyItems && (
            <p className="mt-4 rounded-[14px] bg-[#f9ebe8] px-4 py-3 text-sm text-[#b42318]">
              Some cart items are missing WooCommerce product ids. Please remove and re-add those items from the Shop page before checkout.
            </p>
          )}

          <div className="mt-6 rounded-[18px] border border-[#1f1f1f]/10 bg-white px-5 py-5">
            {!isAuthenticated ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#f5f0e8] p-2">
                    <ShieldCheck className="h-5 w-5 text-[#1f1f1f]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f1f1f]">
                      Action required: sign in to checkout
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#666]">
                      We require an account before placing an order so your purchase is automatically linked for tracking and support.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/signup?callbackUrl=${encodeURIComponent("/cart")}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[12px] bg-[#1f1f1f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                  >
                    Create account
                  </Link>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent("/cart")}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8]"
                  >
                    Log in
                  </Link>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#666]">
                  Already created your account? Log in and you will be able to checkout immediately.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#f5f0e8] p-2">
                    <Lock className="h-5 w-5 text-[#1f1f1f]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f1f1f]">
                      Ready for secure checkout
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#666]">
                      Next you will enter delivery details and complete payment securely via Razorpay.
                    </p>
                  </div>
                </div>

                {checkoutDisabled ? (
                  <div className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[12px] bg-black/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-black/40">
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </div>
                ) : (
                  <Link
                    href="/checkout"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1f1f1f] px-4 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black"
                  >
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                {checkoutDisabled && (
                  <p className="mt-3 text-sm leading-6 text-[#b42318]">
                    Some items in your cart cannot be checked out yet. Remove and re-add them from the Shop page.
                  </p>
                )}

                <p className="mt-4 text-sm leading-6 text-[#666]">
                  Payments are processed by Razorpay. We do not store card or UPI credentials.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
