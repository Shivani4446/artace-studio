"use client";

import { motion, useReducedMotion } from "framer-motion";

const HIGHLIGHTS = [
  { value: "30%", label: "Flat Commission (You Keep 70%)" },
  { value: "₹999", label: "Standard per year* | 3 & 6-month plans too" },
  { value: "7 Days", label: "Fast Payout Timeline*" },
  { value: "Pan-India & Global", label: "Curated Collector Reach" },
];

const SellPaintingsHighlights = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full border-b border-black/5 bg-[#f7f6f3] py-10 md:py-12">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-6 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
        {HIGHLIGHTS.map((highlight, index) => (
          <motion.div
            key={highlight.label}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <span className="font-display text-[34px] leading-none text-[#B8860B] md:text-[40px]">
              {highlight.value}
            </span>
            <span className="mt-3 max-w-[220px] font-inter text-[13px] leading-[1.5] text-[#5b5b5b] md:text-[14px]">
              {highlight.label}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-6 px-6 text-center font-inter text-[13px] leading-6 text-[#8a8478] md:px-12">
        *Plus 18% GST. Standard payouts are monthly after delivery &amp; inspection;
        Premium artists can request a payout any time.
      </p>
    </section>
  );
};

export default SellPaintingsHighlights;