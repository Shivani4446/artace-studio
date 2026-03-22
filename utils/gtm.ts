"use client";

import type { CartItem, CartProduct } from "@/components/cart/CartProvider";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type TrackCheckoutOptions = {
  currency?: string;
  value?: number;
  dedupeKey?: string;
};

type TrackPurchaseOptions = {
  orderId: number | string;
  orderNumber?: string;
  total?: number | string;
  currency?: string;
  paymentMethod?: string;
  coupon?: string;
  dedupeKey?: string;
  items: CartItem[];
};

const DEFAULT_CURRENCY = "INR";
const TRACKING_PREFIX = "artace-gtm";

const getPrice = (price?: number) =>
  typeof price === "number" && Number.isFinite(price) ? price : undefined;

const getItemId = (
  item: Pick<CartProduct, "id" | "woocommerceProductId" | "woocommerceVariationId">
) => {
  if (
    typeof item.woocommerceVariationId === "number" &&
    item.woocommerceVariationId > 0
  ) {
    return String(item.woocommerceVariationId);
  }

  if (
    typeof item.woocommerceProductId === "number" &&
    item.woocommerceProductId > 0
  ) {
    return String(item.woocommerceProductId);
  }

  return String(item.id);
};

const toEcommerceItem = (item: CartProduct, quantity = 1) => {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const ecommerceItem: Record<string, unknown> = {
    item_id: getItemId(item),
    item_name: item.title,
    quantity: safeQuantity,
  };

  if (item.subtitle) {
    ecommerceItem.item_variant = item.subtitle;
  }

  const price = getPrice(item.price);
  if (price !== undefined) {
    ecommerceItem.price = price;
  }

  return ecommerceItem;
};

const getCartValue = (items: CartItem[]) =>
  items.reduce((total, item) => total + (getPrice(item.price) ?? 0) * item.quantity, 0);

const pushToDataLayer = (payload: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

const getSessionTrackingKey = (dedupeKey: string) => `${TRACKING_PREFIX}:${dedupeKey}`;

const hasTrackedInSession = (dedupeKey?: string) => {
  if (!dedupeKey || typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(getSessionTrackingKey(dedupeKey)) === "1";
  } catch {
    return false;
  }
};

const markTrackedInSession = (dedupeKey?: string) => {
  if (!dedupeKey || typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(getSessionTrackingKey(dedupeKey), "1");
  } catch {
    // Ignore storage failures so analytics does not impact checkout.
  }
};

export const trackAddToCart = (
  product: CartProduct,
  quantity = 1,
  currency = DEFAULT_CURRENCY
) => {
  const item = toEcommerceItem(product, quantity);
  const price = getPrice(product.price) ?? 0;

  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency,
      value: price * (item.quantity as number),
      items: [item],
    },
  });
};

export const trackBeginCheckout = (
  items: CartItem[],
  { currency = DEFAULT_CURRENCY, value, dedupeKey }: TrackCheckoutOptions = {}
) => {
  if (!items.length || hasTrackedInSession(dedupeKey)) return;

  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency,
      value: value ?? getCartValue(items),
      items: items.map((item) => toEcommerceItem(item, item.quantity)),
    },
  });

  markTrackedInSession(dedupeKey);
};

export const trackPurchase = ({
  orderId,
  orderNumber,
  total,
  currency = DEFAULT_CURRENCY,
  paymentMethod,
  coupon,
  dedupeKey,
  items,
}: TrackPurchaseOptions) => {
  if (hasTrackedInSession(dedupeKey)) return;

  const parsedTotal =
    typeof total === "number"
      ? total
      : typeof total === "string"
        ? Number(total)
        : Number.NaN;

  const ecommerce: Record<string, unknown> = {
    transaction_id: String(orderNumber || orderId),
    currency,
    value: Number.isFinite(parsedTotal) ? parsedTotal : getCartValue(items),
    items: items.map((item) => toEcommerceItem(item, item.quantity)),
  };

  if (paymentMethod) {
    ecommerce.payment_type = paymentMethod;
  }

  if (coupon) {
    ecommerce.coupon = coupon;
  }

  pushToDataLayer({
    event: "purchase",
    ecommerce,
  });

  markTrackedInSession(dedupeKey);
};
