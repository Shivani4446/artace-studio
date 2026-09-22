"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const CALC_ROWS = [
  { label: "Your Set Reserve Price (What you want in hand)", value: "₹20,000" },
  { label: "Artace Gallery Fee & Promotion (30%)", value: "₹6,000" },
];

const SellPaintingsCalculator = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#efeeec] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[820px]">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
            Simple, Transparent Math. No Hidden Charges.
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            Here is an example of how your payouts work on Artace Studio:
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 overflow-hidden rounded-[18px] border border-[#1f1f1f]/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
        >
          <div>
            {CALC_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f1f1f]/[0.06] px-6 py-5 md:px-8"
              >
                <span className="font-inter text-[14px] text-[#5b5b5b] md:text-[15px]">
                  {row.label}
                </span>
                <span className="font-display text-[22px] text-[#1f1f1f]">{row.value}</span>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#faf5eb] px-6 py-5 md:px-8">
              <span className="font-inter text-[14px] font-semibold text-[#1f1f1f] md:text-[15px]">
                Final Listed Catalog Price (Includes GST &amp; Packaging support)
              </span>
              <span className="font-display text-[24px] text-[#B8860B]">₹26,000</span>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#f7f6f3] px-6 py-5 md:px-8">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#B8860B]" strokeWidth={2} />
            <p className="font-inter text-[14px] leading-6 text-[#4f4b45] md:text-[15px]">
              <strong className="font-semibold text-[#1f1f1f]">
                You receive your exact in-hand reserve price of ₹20,000
              </strong>{" "}
              with a fully transparent 30% gallery fee. A Premium plan adds faster
              payouts, faster curation, and digital print sales on top of your
              original listings.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SellPaintingsCalculator;