"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CurrencyCode, ExchangeRates } from "@/lib/currency/types";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";

const readCurrencyCookie = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CURRENCY_COOKIE_NAME}=`));
  return match?.split("=")[1];
};

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
  const [rates, setRates] = useState<ExchangeRates | null>(initialRates);

  // The root layout can no longer read the currency cookie or fetch rates
  // itself (doing so previously forced the entire site into dynamic
  // rendering, since cookies() in a root layout marks every route dynamic —
  // which broke the Cloudflare next-on-pages deploy, which requires edge
  // runtime on every dynamic route). Instead, both are picked up here, once,
  // after mount. This means the page can briefly show INR before flipping to
  // the stored preference — an accepted trade-off for keeping the rest of
  // the site statically rendered.
  useEffect(() => {
    const cookieCurrency = parseCurrencyCode(readCurrencyCookie());
    setCurrencyState(cookieCurrency);

    let cancelled = false;

    fetch("/api/currency/rates", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { rates: ExchangeRates | null } | null) => {
        if (!cancelled && payload?.rates) {
          setRates(payload.rates);
        }
      })
      .catch(() => {
        // Network failure — keep whatever rates state already exists
        // (null, meaning prices stay in INR) rather than throwing.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
