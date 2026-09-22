"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

type Row = {
  term: string;
  artace: string;
  legacy: string;
};

const ROWS: Row[] = [
  {
    term: "Platform Commission",
    artace: "Flat 30% — you keep 70%",
    legacy: "40% + flat minimum deductions (₹1,500+)",
  },
  {
    term: "Registration & Account Fees",
    artace: "Simple annual plans — ₹999 Standard / ₹1,899 Premium",
    legacy: "₹990 paywall for print permissions",
  },
  {
    term: "Shipping & Courier Logistics",
    artace: "Insured delivery to our Pune facility; artist arranges & bears courier cost",
    legacy: "Artist pays & arranges shipping to Pune warehouse",
  },
  {
    term: "Payout Timeline",
    artace: "7–10 business days post-inspection; faster on Premium",
    legacy: "Long 30-day holding period",
  },
  {
    term: "Artist Identity & Attribution",
    artace: "Dedicated artist profile, bio & social spotlights",
    legacy: "Anonymized catalog listing without branding",
  },
  {
    term: "Exclusivity & Independence",
    artace: "Non-exclusive — retain 100% rights & copyright",
    legacy: "Threats of legal notices for out-of-sync inventory",
  },
];

const SellPaintingsComparison = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-[860px] text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
            Why Independent Artists Choose Artace Studio
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            Compare our transparent, respectful terms against traditional online
            marketplaces like Fizdi.
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 overflow-hidden rounded-[18px] border border-[#1f1f1f]/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#1f1f1f]/10">
                  <th className="px-5 py-5 font-inter text-[13px] font-medium uppercase tracking-[0.08em] text-[#8a8478] md:px-7">
                    Terms &amp; Features
                  </th>
                  <th className="bg-[#faf5eb] px-5 py-5 font-display text-[16px] text-[#1f1f1f] md:px-7">
                    Artace Studio
                  </th>
                  <th className="px-5 py-5 font-inter text-[13px] font-medium uppercase tracking-[0.08em] text-[#8a8478] md:px-7">
                    Legacy Marketplaces (e.g. Fizdi)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, index) => (
                  <tr
                    key={row.term}
                    className={`border-b border-[#1f1f1f]/[0.06] ${
                      index === ROWS.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-5 py-5 font-inter text-[14px] font-semibold text-[#2f2f2f] md:px-7">
                      {row.term}
                    </td>
                    <td className="bg-[#faf5eb] px-5 py-5 font-inter text-[14px] leading-6 text-[#1f1f1f] md:px-7">
                      <span className="flex items-start gap-2">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#B8860B]" strokeWidth={2.25} />
                        <span className="font-medium">{row.artace}</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 font-inter text-[14px] leading-6 text-[#6a655d] md:px-7">
                      {row.legacy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto mt-6 max-w-[860px] text-center font-inter text-[13px] leading-6 text-[#8a8478]"
        >
          Comparison reflects published public terms of the cited platforms and may change.
        </motion.p>
      </div>
    </section>
  );
};

export default SellPaintingsComparison;