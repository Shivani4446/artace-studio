"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

type CheckoutFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  customerNote: string;
};

const INITIAL_FORM: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  customerNote: "",
};

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

const CartPage = () => {
  const { items, itemCount, subtotal, incrementItem, decrementItem, removeItem, clearCart } =
    useCart();
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  const hasCheckoutReadyItems = useMemo(
    () =>
      items.some((item) =>
        getCheckoutProductId(item.id, item.woocommerceProductId)
      ),
    [items]
  );

  const handleFieldChange =
    (field: keyof CheckoutFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleCheckout = async () => {
    if (isSubmitting) return;

    setCheckoutError(null);
    setCheckoutSuccess(null);
    setIsSubmitting(true);

    try {
      const lineItems = items
        .map((item) => {
          const productId = getCheckoutProductId(
            item.id,
            item.woocommerceProductId
          );
          if (!productId) return null;
          return {
            productId,
            variationId: item.woocommerceVariationId,
            quantity: item.quantity,
          };
        })
        .filter(
          (
            lineItem
          ): lineItem is {
            productId: number;
            variationId?: number;
            quantity: number;
          } => Boolean(lineItem)
        );

      if (lineItems.length === 0) {
        throw new Error(
          "No valid WooCommerce products found in your cart. Please re-add items from the Shop page."
        );
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems,
          billing: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address1: form.address1,
            address2: form.address2,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
            country: form.country,
          },
          customerNote: form.customerNote,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        orderNumber?: string;
        paymentUrl?: string | null;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Could not place your order.");
      }

      const orderLabel = payload.orderNumber ? `#${payload.orderNumber}` : "";
      setCheckoutSuccess(`Order ${orderLabel} created successfully.`);
      clearCart();

      if (payload.paymentUrl) {
        window.location.href = payload.paymentUrl;
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Checkout failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <div className="mb-6 rounded-full bg-[#F5F5F5] p-6">
          <ShoppingBag className="h-12 w-12 text-[#666]" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-[#222]">Your Cart Is Empty</h1>
        <p className="mt-4 max-w-xl text-lg text-[#666]">
          You have not added anything yet. Browse our collections and add your favorites.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 bg-[#222] px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </main>
    );
  }

  // Calculate prices
  const shipping = subtotal > 500 ? 0 : 50;
  const sgst = subtotal * 0.025; // 2.5% SGST
  const cgst = subtotal * 0.025; // 2.5% CGST
  const tax = sgst + cgst; // Total 5%
  const total = subtotal + shipping + tax;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-12 md:py-16">
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Cart</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl text-[#222]">Shopping Cart</h1>
          <p className="mt-2 text-[#666]">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm font-medium text-[#666] underline underline-offset-4 hover:text-[#111]"
        >
          Clear Cart
        </button>
      </div>

      {/* Main Content */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left Column - Products */}
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 border-b border-[#E5E5E5] pb-6">
              {/* Product Image */}
              <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="font-display text-xl text-[#222]">
                    {item.title}
                  </h2>
                  {item.subtitle && (
                    <p className="mt-1 text-sm text-[#666]">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="mt-2 font-medium text-[#222]">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => decrementItem(item.id)}
                      className="px-3 py-2 hover:bg-[#F5F5F5] transition-colors"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementItem(item.id)}
                      className="px-3 py-2 hover:bg-[#F5F5F5] transition-colors"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-sm text-[#666] hover:text-[#222] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="font-display text-xl text-[#222]">
                  ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#666] hover:text-[#222] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Right Column - Order Summary */}
        <aside className="h-fit rounded-2xl bg-[#FAF9F6] p-8">
          <h3 className="font-display text-2xl text-[#222]">Order Summary</h3>
          
          <div className="mt-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-[#666]">Subtotal</span>
              <span className="font-medium text-[#222]">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            
            {/* Shipping */}
            <div className="flex items-center justify-between">
              <span className="text-[#666]">Shipping</span>
              <span className="font-medium text-[#222]">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>
            
            {/* SGST */}
            <div className="flex items-center justify-between">
              <span className="text-[#666]">SGST (2.5%)</span>
              <span className="font-medium text-[#222]">₹{sgst.toLocaleString("en-IN")}</span>
            </div>

            {/* CGST */}
            <div className="flex items-center justify-between">
              <span className="text-[#666]">CGST (2.5%)</span>
              <span className="font-medium text-[#222]">₹{cgst.toLocaleString("en-IN")}</span>
            </div>
            
            {/* Divider */}
            <div className="border-t border-[#E5E5E5] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-[#222]">Total</span>
                <span className="font-display text-xl text-[#222]">₹{total.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleFieldChange("firstName")}
                className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleFieldChange("lastName")}
                className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleFieldChange("email")}
              className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={handleFieldChange("phone")}
              className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
            />
            <input
              type="text"
              placeholder="Address Line 1"
              value={form.address1}
              onChange={handleFieldChange("address1")}
              className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
            />
            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              value={form.address2}
              onChange={handleFieldChange("address2")}
              className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={handleFieldChange("city")}
                className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
              />
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={handleFieldChange("state")}
                className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="PIN / ZIP"
                value={form.postcode}
                onChange={handleFieldChange("postcode")}
                className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
              />
              <input
                type="text"
                placeholder="Country Code (IN)"
                value={form.country}
                onChange={handleFieldChange("country")}
                className="w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm uppercase outline-none focus:border-[#1f1f1f]/40"
              />
            </div>
            <textarea
              placeholder="Order Note (Optional)"
              value={form.customerNote}
              onChange={handleFieldChange("customerNote")}
              className="min-h-[84px] w-full border border-[#1f1f1f]/15 px-3 py-2 text-sm outline-none focus:border-[#1f1f1f]/40"
            />
          </div>

          {checkoutError && (
            <p className="mt-4 text-sm text-[#b42318]">{checkoutError}</p>
          )}
          {checkoutSuccess && (
            <p className="mt-4 text-sm text-[#116329]">{checkoutSuccess}</p>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting || !hasCheckoutReadyItems}
            className="mt-8 w-full bg-[#222] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>

          {/* Free Shipping Notice */}
          {subtotal < 500 && (
            <p className="mt-4 text-center text-sm text-[#666]">
              Add ₹{(500 - subtotal).toLocaleString("en-IN")} more for free shipping
            </p>
          )}
        </aside>
      </div>
    </main>
  );
};

export default CartPage;
