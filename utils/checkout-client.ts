"use client";

export const PENDING_CHECKOUT_STORAGE_KEY = "artace-pending-checkout";

export type PendingCheckoutRecord = {
  orderId: number;
  orderKey: string;
  orderNumber: string;
  razorpayOrderId: string;
};

export const readPendingCheckout = (): PendingCheckoutRecord | null => {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as PendingCheckoutRecord;
    if (
      typeof parsed?.orderId === "number" &&
      typeof parsed?.orderKey === "string" &&
      typeof parsed?.orderNumber === "string" &&
      typeof parsed?.razorpayOrderId === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export const writePendingCheckout = (value: PendingCheckoutRecord) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(value));
};

export const clearPendingCheckout = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
};
