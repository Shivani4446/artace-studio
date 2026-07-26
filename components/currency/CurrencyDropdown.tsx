"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import type { CurrencyCode } from "@/lib/currency/types";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "INR" },
  { code: "USD", label: "USD" },
  { code: "AED", label: "AED" },
  { code: "AUD", label: "AUD" },
  { code: "CAD", label: "CAD" },
  { code: "GBP", label: "GBP" },
  { code: "EUR", label: "EUR" },
  { code: "NZD", label: "NZD" },
];

const CurrencyDropdown = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Select currency"
        className="inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 text-[13px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/25 md:h-10 md:text-[14px]"
      >
        {currency}
        <ChevronDown
          className={`h-4 w-4 text-[#4f4b45] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[75] mt-2 min-w-[140px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
        >
          {CURRENCY_OPTIONS.map((option) => {
            const isSelected = currency === option.code;

            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setCurrency(option.code);
                  setIsOpen(false);
                }}
                className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                  isSelected
                    ? "bg-[#1f1f1f] text-white"
                    : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
