"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const DesignPartnerWhoWeAre = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#efeeec]">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-6 py-14 md:px-12 md:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
            A Studio, Not a Marketplace
          </p>
          <h2 className="mt-4 font-display text-[30px] leading-[1.1] text-[#1f1f1f] sm:text-[38px] md:text-[46px]">
            A Studio, Not a Marketplace
          </h2>
          <p className="mt-5 max-w-xl font-inter text-[16px] leading-[1.75] text-[#4f4b45] md:text-[18px]">
            We&apos;re a collective of master artists creating handcrafted, made-to-order
            canvas art — oil, acrylic, and mixed media — for homes and spaces across India.
            Every piece is original. Nothing is mass-produced. Nothing is duplicated.
          </p>
        </div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { clipPath: "inset(0 100% 0 0)" }}
          whileInView={shouldReduceMotion ? undefined : { clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          className="relative h-[320px] w-full overflow-hidden rounded-[18px] sm:h-[420px] lg:h-[480px]"
        >
          <Image
            src="/masteripiece-image-v-1.webp"
            alt="A framed original painting displayed in a designed interior space"
            fill
            className="object-cover"
            sizes="(max-width: 1023px) 100vw, 45vw"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default DesignPartnerWhoWeAre;
