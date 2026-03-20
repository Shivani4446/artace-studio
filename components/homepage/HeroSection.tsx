import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative isolate w-full overflow-hidden bg-black">
      <div className="relative h-[88vh] min-h-[560px] w-full bg-black md:h-[92vh] md:min-h-[620px]">
        <div className="absolute inset-x-0 bottom-0 h-[48%] md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[56%]">
          <Image
            src="/radha-krishna-hero-bg.webp"
            alt="Radha Krishna hero artwork background"
            fill
            priority
            className="object-cover object-center md:object-[84%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/55 to-black/95" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-transparent md:hidden" />
        </div>

        <div className="relative z-10 h-full w-full">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-start px-6 pb-10 pt-16 md:items-center md:px-12 md:pb-0 md:pt-0">
            <div className="w-full text-left text-white md:w-[70%] lg:w-[64%]">
              <h1 className="font-display text-[30px] font-semibold leading-[1.08] sm:text-[34px] md:text-[36px] lg:text-[44px] xl:text-[52px]">
                <span className="block md:whitespace-nowrap">Handcrafted Canvas Paintings,</span>
                <span className="block md:whitespace-nowrap">Bespoke to Your Vision</span>
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/90 md:mt-5 md:text-[18px]">
                Stop searching for the perfect piece. Experience the soul of authentic
                art and co-create an original masterpiece with Artace Studio.
              </p>
              <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="/shop"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-3 text-[17px] font-medium text-[#2f2f2f] transition-colors hover:bg-[#efefef] sm:w-auto sm:text-[18px]"
                >
                  Shop Now
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  href="https://cal.com/artace-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/80 px-7 py-3 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto sm:text-[18px]"
                >
                  Have a Custom Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
