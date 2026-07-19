"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import type { CurrencyCode } from "@/lib/currency/types";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "INR" },
  { code: "USD", label: "USD" },
  { code: "AED", label: "AED" },
  { code: "AUD", label: "AUD" },
  { code: "CAD", label: "CAD" },
  { code: "GBP", label: "GBP" },
];

const CurrencyDropdown = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
      aria-label="Select currency"
      className="h-9 rounded-[8px] border border-[#d5d5d5] bg-white px-2 text-[13px] font-medium text-[#2f2f2f] transition-colors hover:border-black/40 focus:outline-none md:h-10 md:text-[14px]"
    >
      {CURRENCY_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CurrencyDropdown;
