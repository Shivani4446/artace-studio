"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { CurrencyCode, ExchangeRates } from "@/lib/currency/types";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency/cookie";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInInr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

const CURRENCY_COOKIE_MAX_AGE_SECONDS = 31536000; // 1 year

type CurrencyProviderProps = {
  initialCurrency: CurrencyCode;
  initialRates: ExchangeRates | null;
  children: React.ReactNode;
};

export const CurrencyProvider = ({
  initialCurrency,
  initialRates,
  children,
}: CurrencyProviderProps) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [rates] = useState<ExchangeRates | null>(initialRates);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    if (typeof document !== "undefined") {
      document.cookie = `${CURRENCY_COOKIE_NAME}=${next}; path=/; max-age=${CURRENCY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    }
  }, []);

  const formatPrice = useCallback(
    (amountInInr: number) => formatConvertedPrice(amountInInr, currency, rates),
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
