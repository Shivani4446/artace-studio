import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative isolate w-full overflow-hidden bg-black">
      <div className="relative h-[92vh] min-h-[620px] w-full bg-black">
        <div className="absolute inset-y-0 right-0 w-full md:w-[56%]">
          <Image
            src="/nandikeshavara-hero-bg.webp"
            alt="Nandikeshavara hero artwork background"
            fill
            priority
            className="object-cover object-[84%_center]"
          />
        </div>

        <div className="relative z-10 h-full w-full">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-center px-6 md:px-12">
            <div className="w-full text-left text-white md:w-[70%] lg:w-[64%]">
              <h1 className="font-display text-[40px] font-semibold leading-[1.08] md:text-[36px] lg:text-[44px] xl:text-[52px]">
                <span className="block whitespace-nowrap">Handcrafted Canvas Paintings,</span>
                <span className="block whitespace-nowrap">Bespoke to Your Vision.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-white/90">
                Stop searching for the perfect piece. Experience the soul of authentic
                art and co-create an original masterpiece with Artace Studio.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 rounded-md bg-white px-8 py-3 text-[18px] font-medium text-[#2f2f2f] transition-colors hover:bg-[#efefef]"
                >
                  Shop Now
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  href="https://cal.com/artace-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-white/80 px-7 py-3 text-[18px] font-medium text-white transition-colors hover:bg-white/10"
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
