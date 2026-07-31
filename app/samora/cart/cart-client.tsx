"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Gift, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";

const getCheckoutProductId = (id: number | string, woocommerceProductId?: number) => {
  if (typeof woocommerceProductId === "number" && woocommerceProductId > 0) {
    return woocommerceProductId;
  }
  if (typeof id === "number" && id > 0) return id;
  const parsedFromPrefix = Number(String(id).split("-")[0]);
  return Number.isFinite(parsedFromPrefix) && parsedFromPrefix > 0 ? parsedFromPrefix : null;
};

export default function SamoraCartPageClient() {
  const { status: authStatus } = useAuthSession();
  const currency = useCurrency();
  const {
    items,
    itemCount,
    subtotal,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    isGiftOrder,
    giftMessage,
    setGiftOrder,
    setGiftMessage,
  } = useCart();

  const hasCheckoutReadyItems = useMemo(
    () => items.some((item) => getCheckoutProductId(item.id, item.woocommerceProductId)),
    [items]
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1320px] flex-col items-center justify-center px-5 py-16 text-center md:px-10">
        <div className="mb-6 rounded-full bg-[#f3ead9] p-6">
          <ShoppingBag className="h-12 w-12 text-[#8a7c68]" strokeWidth={1.5} />
        </div>
        <h1 className="font-samora-display text-[34px] text-[#2b2420] md:text-[42px]">
          Your cart is empty
        </h1>
        <p className="mt-4 max-w-xl text-[16px] leading-[1.7] text-[#5c5344]">
          You haven&apos;t added anything yet. Browse the Samora collection and add your
          favorites.
        </p>
        <Link
          href="/samora/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c1683d] px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Continue Shopping
        </Link>
      </main>
    );
  }

  const isAuthenticated = authStatus === "authenticated";
  const checkoutDisabled = !hasCheckoutReadyItems;

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 py-10 md:px-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c1683d]">
            Cart
          </p>
          <h1 className="font-samora-display mt-2 text-[32px] text-[#2b2420] md:text-[40px]">
            Shopping Cart
          </h1>
          <p className="mt-2 text-[14.5px] text-[#5c5344]">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-[13.5px] font-medium text-[#8a7c68] underline underline-offset-4 hover:text-[#2b2420]"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 border-b border-[#2b2420]/10 pb-6 sm:flex-row sm:gap-6"
            >
              <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-[12px] bg-[#f3ead9]">
                <Image src={item.image} alt={item.title} fill sizes="112px" className="object-cover" />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:gap-6">
                <div className="flex-1">
                  <h2 className="font-samora-display text-[19px] text-[#2b2420]">{item.title}</h2>
                  {item.subtitle ? (
                    <p className="mt-1 text-[13.5px] text-[#8a7c68]">{item.subtitle}</p>
                  ) : null}
                  <p className="mt-2 text-[14.5px] font-medium text-[#2b2420]">
                    {currency.formatPrice(item.price || 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-full border border-[#2b2420]/15">
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-[#f3ead9]"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="mx-auto h-4 w-4" strokeWidth={2} />
                    </button>
                    <span className="w-8 text-center text-[14px] font-medium text-[#2b2420]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-[#f3ead9]"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="mx-auto h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1.5 text-[13.5px] text-[#8a7c68] transition-colors hover:text-[#2b2420]"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-left sm:min-w-[120px] sm:text-right">
                <p className="font-samora-display text-[19px] text-[#2b2420]">
                  {currency.formatPrice((item.price || 0) * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <Link
            href="/samora/shop"
            className="mt-2 inline-flex items-center gap-2 text-[13.5px] font-medium text-[#5c5344] transition-colors hover:text-[#2b2420]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Continue Shopping
          </Link>
        </div>

        <aside className="h-fit rounded-[20px] bg-[#f3ead9] p-6 sm:p-7">
          <h3 className="font-samora-display text-[21px] text-[#2b2420]">Order Summary</h3>

          <div className="mt-5 rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#5c5344]">Subtotal</span>
              <span className="text-[15px] font-medium text-[#2b2420]">
                {currency.formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-3 text-[13.5px] leading-[1.6] text-[#8a7c68]">
              Delivery details and payment happen on the next step.
            </p>
          </div>

          {/* Gift options — Steps 2 & 3 of "Make it a gift" */}
          <div className="mt-5 rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] px-5 py-5">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={isGiftOrder}
                onChange={(event) => setGiftOrder(event.target.checked)}
                className="h-4 w-4 accent-[#c1683d]"
              />
              <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#2b2420]">
                <Gift className="h-4 w-4 text-[#c1683d]" strokeWidth={1.75} />
                This order is a gift
              </span>
            </label>

            {isGiftOrder ? (
              <div className="mt-4">
                <label className="text-[13px] font-medium text-[#5c5344]">
                  Personalised message (optional)
                </label>
                <textarea
                  rows={3}
                  value={giftMessage}
                  onChange={(event) => setGiftMessage(event.target.value)}
                  placeholder="Write a short note for the recipient..."
                  maxLength={300}
                  className="mt-1.5 w-full resize-y rounded-[10px] border border-[#2b2420]/15 bg-white px-3.5 py-2.5 text-[14px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
                />
                <p className="mt-2 text-[12.5px] leading-[1.5] text-[#8a7c68]">
                  Wrapped in Samora&apos;s signature butter paper with your message enclosed.
                </p>
              </div>
            ) : null}
          </div>

          {!hasCheckoutReadyItems && (
            <p className="mt-4 rounded-[14px] bg-[#f8ece8] px-4 py-3 text-[13.5px] text-[#a63b2d]">
              Some cart items are missing WooCommerce product ids. Please remove and re-add those
              items from the shop page before checkout.
            </p>
          )}

          <div className="mt-5 rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] px-5 py-5">
            {!isAuthenticated ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#f3ead9] p-2">
                    <ShieldCheck className="h-5 w-5 text-[#2b2420]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#2b2420]">
                      Action required: sign in to checkout
                    </p>
                    <p className="mt-2 text-[13.5px] leading-[1.6] text-[#5c5344]">
                      We require an account before placing an order so your purchase is
                      automatically linked for tracking and support.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/signup?callbackUrl=${encodeURIComponent("/samora/cart")}`}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#2b2420] px-4 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1c1712]"
                  >
                    Create account
                  </Link>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent("/samora/cart")}`}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-[#2b2420]/15 bg-white px-4 py-3 text-[13.5px] font-semibold text-[#2b2420] transition-colors hover:bg-[#f3ead9]"
                  >
                    Log in
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#f3ead9] p-2">
                    <Lock className="h-5 w-5 text-[#2b2420]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#2b2420]">
                      Ready for secure checkout
                    </p>
                    <p className="mt-2 text-[13.5px] leading-[1.6] text-[#5c5344]">
                      Next you will enter delivery details and complete payment securely via
                      Razorpay.
                    </p>
                  </div>
                </div>

                {checkoutDisabled ? (
                  <div className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#2b2420]/10 px-4 py-3 text-[13.5px] font-semibold text-[#2b2420]/40">
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </div>
                ) : (
                  <Link
                    href="/samora/checkout"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c1683d] px-4 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#a8552f]"
                  >
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                <p className="mt-4 text-[13px] leading-[1.6] text-[#8a7c68]">
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
