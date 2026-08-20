"use client";

import { motion, useReducedMotion } from "framer-motion";
import CountUpNumber from "./CountUpNumber";

const DesignPartnerTrustBar = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full border-b border-black/5 bg-[#f7f6f3] py-8 md:py-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-6 px-6 text-center md:flex-row md:gap-12 md:px-12">
        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4 }}
          className="font-inter text-[16px] font-medium text-[#2f2f2f] md:text-[18px]"
        >
          <CountUpNumber target={10} suffix="+" /> Designer Collaborations
        </motion.p>
        <span className="hidden h-4 w-px bg-black/15 md:inline-block" />
        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-inter text-[16px] font-medium text-[#2f2f2f] md:text-[18px]"
        >
          <CountUpNumber target={21} suffix="+" /> Metro Cities Served
        </motion.p>
        <span className="hidden h-4 w-px bg-black/15 md:inline-block" />
        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-inter text-[16px] font-medium text-[#2f2f2f] md:text-[18px]"
        >
          100% Handcrafted, 0% Mass-Produced
        </motion.p>
      </div>
    </section>
  );
};

export default DesignPartnerTrustBar;
