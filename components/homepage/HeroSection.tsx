import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pb-14 pt-3 md:px-6 md:pb-20">
      <div className="relative h-[58vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt="Hero artwork"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/45" />

        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center text-white">
          <h1 className="font-display text-4xl leading-[1.08] md:text-6xl">
            Every Wall Can Tell
            <br />
            <span className="italic">a Story.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[10px] uppercase tracking-[0.2em] text-white/85 md:text-[11px]">
            Discover museum-inspired canvases and handcrafted framing designed
            to bring warmth and character into your home.
          </p>
          <Link
            href="#"
            className="mt-6 inline-block bg-white px-6 py-2 text-[10px] uppercase tracking-[0.22em] text-black transition-colors hover:bg-[#d5c29c]"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
