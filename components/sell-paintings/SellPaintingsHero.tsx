"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const WHP_LINK =
  "https://wa.me/919657609102?text=Hi%20Artace%20Studio%2C%20I%20am%20an%20artist%20and%20want%20to%20sell%20my%20paintings";

const SellPaintingsHero = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex h-[80vh] min-h-[560px] w-full items-center overflow-hidden bg-[#1f1f1f] md:h-[86vh] md:min-h-[640px]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={shouldReduceMotion ? undefined : { scale: 1.08 }}
        transition={{ duration: 20, ease: "linear" }}
      >
        <Image
          src="/Artace-studio-artwork.png"
          alt="Original handcrafted paintings curated by Artace Studio"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl">
          <motion.span
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-[#B8860B]/40 bg-[#B8860B]/15 px-4 py-1.5 font-inter text-[12px] font-medium uppercase tracking-[0.14em] text-[#E6C46A]"
          >
            Artist Partner Program
          </motion.span>
          <motion.h1
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-5 font-display text-[36px] leading-[1.1] text-white md:text-[56px]"
          >
            Sell Your Original Paintings Online With India&apos;s Artist-First Studio
          </motion.h1>
          <motion.p
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-2xl font-inter text-[16px] leading-7 text-white/85 md:text-[19px] md:leading-8"
          >
            Join a curated repository of passionate collectors and interior
            designers. Keep <strong className="font-semibold text-white">70% of your
            earnings</strong> with a flat 30% commission and simple annual plans
            starting at ₹999.
          </motion.p>
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <Link
              href="#artist-register-form"
              className="inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90"
            >
              Apply as an Artist
            </Link>
            <Link
              href={WHP_LINK}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/30 px-6 py-3 font-inter text-[15px] font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Talk to Curator on WhatsApp
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SellPaintingsHero;