import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="relative h-screen min-h-[620px] w-full">
        <Image
          src="/hero-bg.webp"
          alt="Seascape artwork background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16232f]/20 via-[#102638]/35 to-[#06121c]/60" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

        <div className="relative flex h-full items-center justify-center px-6 pb-10 text-center text-white md:pb-14">
          <div className="max-w-4xl">
            <h1 className="font-display text-[42px] font-semibold leading-[1.08] md:text-[64px]">
              Every Wall Can Tell
              <br />
              a Story.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-relaxed text-white/90">
              Hand-picked masterpieces for those who appreciate refinement.
              Experience gallery-grade quality crafted by skilled artists.
            </p>
            <Link
              href="#"
              className="mx-auto mt-8 inline-flex items-center gap-3 rounded-md bg-white px-8 py-3 text-[18px] font-medium text-[#2f2f2f] transition-colors hover:bg-[#efefef]"
            >
              Shop Now
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
