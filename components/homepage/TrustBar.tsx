"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Paintbrush, MessageCircle, PackageCheck, Star, Globe } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Paintbrush,
    label: "100% Handcrafted",
    detail: "Never printed, never duplicated",
  },
  {
    icon: MessageCircle,
    label: "Artist-Led Consultation",
    detail: "A real conversation, not a checkout form",
  },
  {
    icon: PackageCheck,
    label: "White-Glove Delivery",
    detail: "Packaged and delivered with care",
  },
  {
    icon: Star,
    label: "4.9★ on Google",
    detail: "From collectors across India and beyond",
  },
  {
    icon: Globe,
    label: "Worldwide Shipping",
    detail: "Your masterpiece, wherever home is",
  },
] as const;

const TrustBar = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full border-b border-black/5 bg-[#f7f6f3] py-8 md:py-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-start justify-center gap-x-8 gap-y-6 px-6 md:flex-nowrap md:justify-between md:gap-x-4 md:px-12">
        {TRUST_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex w-[calc(50%-1rem)] flex-col items-center gap-2 text-center sm:w-auto sm:items-start sm:text-left"
            >
              <Icon className="h-5 w-5 text-[#2f2f2f]" strokeWidth={1.75} />
              <p className="font-inter text-[13px] font-medium leading-tight text-[#2f2f2f] sm:text-[14px]">
                {item.label}
              </p>
              <p className="font-inter text-[11px] leading-snug text-[#767676] sm:text-[12px]">
                {item.detail}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustBar;
