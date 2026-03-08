"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type WishlistProduct = {
  id: number | string;
  woocommerceProductId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  href?: string;
};

export type WishlistItem = WishlistProduct;

type WishlistContextValue = {
  items: WishlistItem[];
  itemCount: number;
  addItem: (product: WishlistProduct) => void;
  removeItem: (id: WishlistItem["id"]) => void;
  clearWishlist: () => void;
  isInWishlist: (id: WishlistItem["id"]) => boolean;
};

const STORAGE_KEY = "artace-wishlist";

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

const parseStoredWishlist = (value: string | null): WishlistItem[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as WishlistItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        (typeof item.id === "string" || typeof item.id === "number") &&
        (item.woocommerceProductId === undefined ||
          typeof item.woocommerceProductId === "number") &&
        typeof item.title === "string" &&
        typeof item.image === "string"
    );
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    return parseStoredWishlist(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: WishlistProduct) => {
    setItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) return prevItems;
      return [...prevItems, product];
    });
  }, []);

  const removeItem = useCallback((id: WishlistItem["id"]) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const isInWishlist = useCallback(
    (id: WishlistItem["id"]) => items.some((item) => item.id === id),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      addItem,
      removeItem,
      clearWishlist,
      isInWishlist,
    }),
    [items, addItem, removeItem, clearWishlist, isInWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
};
