"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { trackAddToCart } from "@/utils/gtm";

export type CartProduct = {
  id: number | string;
  woocommerceProductId?: number;
  woocommerceVariationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  // Real per-unit weight (kg) from WooCommerce — used by Samora's checkout
  // to get an accurate Delhivery shipping rate for the whole cart.
  weightKg?: number;
  // Which frame style was chosen on the product page (e.g. "Black & Brown"),
  // if any. Forwarded to the real WooCommerce order as line-item metadata —
  // see lib/api-route-handlers/checkout/route.ts.
  frameLabel?: string;
  // A plain-language tag for this line item shown to you in WooCommerce
  // (e.g. "Fine Art Print") — forwarded as line-item metadata, same
  // mechanism as frameLabel. Undefined for a normal order.
  orderTypeLabel?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  incrementItem: (id: CartItem["id"]) => void;
  decrementItem: (id: CartItem["id"]) => void;
  removeItem: (id: CartItem["id"]) => void;
  clearCart: () => void;
  // Order-level gift option (Samora's "Make it a gift" flow) — one message per
  // order, not per line item, so it lives alongside the cart rather than on
  // each CartItem.
  isGiftOrder: boolean;
  giftMessage: string;
  setGiftOrder: (value: boolean) => void;
  setGiftMessage: (value: string) => void;
};

const STORAGE_KEY = "artace-mini-cart";
const GIFT_STORAGE_KEY = "artace-mini-cart-gift";

const CartContext = createContext<CartContextValue | undefined>(undefined);

const parseStoredCart = (value: string | null): CartItem[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as CartItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          (typeof item.id === "string" || typeof item.id === "number") &&
          (item.woocommerceProductId === undefined ||
            typeof item.woocommerceProductId === "number") &&
          (item.woocommerceVariationId === undefined ||
            typeof item.woocommerceVariationId === "number") &&
          typeof item.title === "string" &&
          typeof item.image === "string" &&
          typeof item.quantity === "number"
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));
  } catch {
    return [];
  }
};

const parseStoredGift = (value: string | null): { isGiftOrder: boolean; giftMessage: string } => {
  if (!value) return { isGiftOrder: false, giftMessage: "" };

  try {
    const parsed = JSON.parse(value) as { isGiftOrder?: unknown; giftMessage?: unknown };
    return {
      isGiftOrder: parsed.isGiftOrder === true,
      giftMessage: typeof parsed.giftMessage === "string" ? parsed.giftMessage : "",
    };
  } catch {
    return { isGiftOrder: false, giftMessage: "" };
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftMessage, setGiftMessageState] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(parseStoredCart(window.localStorage.getItem(STORAGE_KEY)));
    const storedGift = parseStoredGift(window.localStorage.getItem(GIFT_STORAGE_KEY));
    setIsGiftOrder(storedGift.isGiftOrder);
    setGiftMessageState(storedGift.giftMessage);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(
      GIFT_STORAGE_KEY,
      JSON.stringify({ isGiftOrder, giftMessage })
    );
  }, [isGiftOrder, giftMessage, isHydrated]);

  const setGiftOrder = useCallback((value: boolean) => {
    setIsGiftOrder(value);
  }, []);

  const setGiftMessage = useCallback((value: string) => {
    setGiftMessageState(value);
  }, []);

  const addItem = useCallback(
    (product: CartProduct, quantity = 1) => {
      const safeQty = Math.max(1, Math.floor(quantity));

      trackAddToCart(product, safeQty);

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === product.id);

        if (existingIndex === -1) {
          return [...prevItems, { ...product, quantity: safeQty }];
        }

        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQty }
            : item
        );
      });
    },
    []
  );

  const incrementItem = useCallback((id: CartItem["id"]) => {
    setItems((prevItems) => {
      const targetItem = prevItems.find((item) => item.id === id);
      if (targetItem) {
        trackAddToCart(targetItem, 1);
      }

      return prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  }, []);

  const decrementItem = useCallback((id: CartItem["id"]) => {
    setItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id: CartItem["id"]) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsGiftOrder(false);
    setGiftMessageState("");
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + (item.price ?? 0) * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      isGiftOrder,
      giftMessage,
      setGiftOrder,
      setGiftMessage,
    }),
    [
      items,
      itemCount,
      subtotal,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      isGiftOrder,
      giftMessage,
      setGiftOrder,
      setGiftMessage,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
