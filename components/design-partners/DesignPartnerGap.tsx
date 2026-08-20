"use client";

import { motion, useReducedMotion } from "framer-motion";

const PAIN_POINTS = [
  "Mass-produced prints feel generic and undercut the design",
  "Custom art vendors are often slow, unreliable, or inconsistent in quality",
  'Clients settle for "good enough" simply because good options are hard to find',
];

const DesignPartnerGap = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[860px] text-center">
        <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
          The Last Layer Is Always the Hardest to Source
        </h2>
        <div className="mt-8 space-y-4">
          {PAIN_POINTS.map((point, index) => (
            <motion.p
              key={point}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              className="font-inter text-[16px] leading-7 text-[#5b5b5b] md:text-[18px]"
            >
              {point}
            </motion.p>
          ))}
        </div>
        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 font-display text-[20px] text-[#1f1f1f] md:text-[24px]"
        >
          This is the gap Artace Studio fills.
        </motion.p>
      </div>
    </section>
  );
};

export default DesignPartnerGap;
