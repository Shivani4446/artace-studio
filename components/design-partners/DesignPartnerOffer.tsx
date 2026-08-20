"use client";

import { motion, useReducedMotion } from "framer-motion";

const OFFER_CARDS = [
  {
    title: "Ready-to-Acquire Originals",
    body: "Pre-made, handcrafted pieces for projects with faster timelines.",
  },
  {
    title: "The Studio Masterpiece",
    body: "Fully bespoke, co-created around your client's vision and your design direction.",
  },
  {
    title: "Accessible Artistry",
    body: "Museum-quality, gallery-grade canvas prints for budget-conscious phases of a project.",
  },
];

const DesignPartnerOffer = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-center font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
          Three Ways to Work With Us
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {OFFER_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
            >
              <h3 className="font-display text-[20px] leading-[1.2] text-[#1f1f1f]">
                {card.title}
              </h3>
              <p className="mt-3 font-inter text-[14px] leading-6 text-[#595959]">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesignPartnerOffer;
