"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const DesignPartnerHero = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex h-[78vh] min-h-[520px] w-full items-center overflow-hidden bg-[#1f1f1f] md:h-[85vh] md:min-h-[620px]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={shouldReduceMotion ? undefined : { scale: 1.08 }}
        transition={{ duration: 20, ease: "linear" }}
      >
        <Image
          src="/Artace-studio-artwork.png"
          alt="A designer-styled interior featuring an original handcrafted painting"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl">
          <motion.h1
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-[36px] leading-[1.1] text-white md:text-[56px]"
          >
            Handcrafted Art, Built for Every Project You Design
          </motion.h1>
          <motion.p
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-2xl font-inter text-[16px] leading-7 text-white/85 md:text-[19px] md:leading-8"
          >
            Partner with Artace Studio for bespoke, made-to-order canvas art — co-created
            around your vision, your client, and your timeline.
          </motion.p>
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-6"
          >
            <Link
              href="#apply"
              className="inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90"
            >
              Become a Design Partner
            </Link>
            <Link
              href="#process"
              className="font-inter text-[15px] font-medium text-white underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              See How It Works →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DesignPartnerHero;
