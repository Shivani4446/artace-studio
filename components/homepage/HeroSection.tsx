import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import HeroPriceAnchor from "./HeroPriceAnchor";

const HeroSection = () => {
  return (
    <section className="relative isolate w-full overflow-hidden bg-black">
      <div className="relative h-[88vh] min-h-[560px] w-full bg-black md:h-[92vh] md:min-h-[620px]">
        <Image
          src="/hero-section-mobile-bg.webp"
          alt="Gallery wall of handcrafted canvas paintings featuring Ganesha, Buddha, Shiva, and Radha Krishna in a modern living room"
          fill
          priority
          sizes="100vw"
          className="block object-cover object-center md:hidden"
        />
        <Image
          src="/hero-section-bg.webp"
          alt="Gallery wall of handcrafted canvas paintings featuring Ganesha, Buddha, Shiva, and Radha Krishna in a modern living room"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-center md:block"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent md:hidden" />

        <div className="relative z-10 h-full w-full">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-start px-6 pb-10 pt-16 md:items-center md:px-12 md:pb-0 md:pt-0">
            <div className="w-full text-left text-white md:w-[70%] lg:w-[64%]">
              <h1 className="font-display text-[36px] leading-[1.1] md:text-[56px]">
                <span className="block md:whitespace-nowrap">Handcrafted Canvas Paintings,</span>
                <span className="block md:whitespace-nowrap">Bespoke to Your Vision</span>
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/90 md:mt-5 md:text-[18px]">
                Buy handcrafted canvas paintings online in India, from spiritual wall art
                and abstract statements to custom commissions shaped around your space,
                palette, and story.
              </p>
              <HeroPriceAnchor />
              <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="/shop"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-3 text-[17px] font-medium text-[#2f2f2f] transition-colors hover:bg-[#efefef] sm:w-auto sm:text-[18px]"
                >
                  Shop Now
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/custom-order"
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/80 px-7 py-3 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto sm:text-[18px]"
                >
                  Have a Custom Order
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/samora"
          className="absolute right-6 top-6 z-20 hidden items-center gap-2 rounded-full bg-[#F3ECDD] py-2.5 pl-4 pr-4 shadow-xl transition-transform duration-300 hover:scale-105 md:flex lg:right-10 lg:top-8"
        >
          <Image
            src="/samroa-logo.svg"
            alt="Samora"
            width={112}
            height={74}
            className="h-10 w-auto"
          />
          <ArrowRight className="h-4 w-4 text-[#5b4f3f]" />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
