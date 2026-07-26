"use client";

import React from "react";
import { useCurrency } from "@/components/currency/CurrencyProvider";

const HeroPriceAnchor = () => {
  const { formatPrice } = useCurrency();

  return (
    <p className="mt-4 font-inter text-[14px] text-white/75 md:mt-5 md:text-[15px]">
      Original pieces from {formatPrice(8500)} · Bespoke commissions from{" "}
      {formatPrice(15500)}
    </p>
  );
};

export default HeroPriceAnchor;
