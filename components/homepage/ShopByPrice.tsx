import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PriceTier = {
  label: string;
  range: string;
  href: string;
  background: string;
  textColor: string;
  subTextColor: string;
};

const PRICE_TIERS: PriceTier[] = [
  {
    label: "Starter Pieces",
    range: "Under ₹5,000",
    href: "/shop?maxPrice=5000",
    background: "bg-[#FAF7F2]",
    textColor: "text-[#1f1f1f]",
    subTextColor: "text-[#8a8478]",
  },
  {
    label: "Most Loved",
    range: "₹5,000 – ₹10,000",
    href: "/shop?minPrice=5000&maxPrice=10000",
    background: "bg-[#EFDFB8]",
    textColor: "text-[#1f1f1f]",
    subTextColor: "text-[#6b5a2f]",
  },
  {
    label: "Statement Art",
    range: "₹10,000 – ₹15,000",
    href: "/shop?minPrice=10000&maxPrice=15000",
    background: "bg-[#D4AF37]",
    textColor: "text-[#1f1f1f]",
    subTextColor: "text-[#4a3d1a]",
  },
  {
    label: "Premium Pieces",
    range: "₹15,000 – ₹25,000",
    href: "/shop?minPrice=15000&maxPrice=25000",
    background: "bg-[#4A3D2A]",
    textColor: "text-white",
    subTextColor: "text-white/70",
  },
  {
    label: "Masterworks",
    range: "Above ₹25,000",
    href: "/shop?minPrice=25000",
    background: "bg-[#1f1f1f]",
    textColor: "text-white",
    subTextColor: "text-[#D4AF37]",
  },
];

const ShopByPrice = () => {
  return (
    <section className="w-full bg-[#f4f2ee] py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">
          Shop by Budget
        </p>
        <h2 className="mt-4 font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[40px] md:mt-5 md:text-[52px]">
          Find Art That Fits Your Vision — and Your Budget
        </h2>
        <p className="mt-4 max-w-2xl font-inter text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-5 md:text-[18px]">
          Every price point at Artace Studio is 100% hand-painted — never
          printed, never mass-produced. Pick a range and start browsing.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-12 md:gap-5 lg:grid-cols-5">
          {PRICE_TIERS.map((tier, index) => (
            <Link
              key={tier.label}
              href={tier.href}
              className={`group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[12px] p-6 transition-transform duration-500 hover:scale-[1.03] md:min-h-[220px] ${
                tier.background
              } ${index === PRICE_TIERS.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <p
                className={`font-inter text-[12px] font-semibold uppercase tracking-[0.12em] ${tier.subTextColor}`}
              >
                {tier.label}
              </p>
              <div>
                <p
                  className={`font-display text-[22px] leading-[1.15] md:text-[26px] ${tier.textColor}`}
                >
                  {tier.range}
                </p>
                <div
                  className={`mt-3 flex items-center gap-2 text-[13px] font-medium ${tier.textColor}`}
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByPrice;
