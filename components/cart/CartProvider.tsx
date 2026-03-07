"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartProduct = {
  id: number | string;
  woocommerceProductId?: number;
  woocommerceVariationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
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
};

const STORAGE_KEY = "artace-mini-cart";

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

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (product: CartProduct, quantity = 1) => {
      const safeQty = Math.max(1, Math.floor(quantity));

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
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
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
