import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

const SoulfulSpaces = () => {
  return (
    <section
      className={`relative w-full h-[calc(100svh-5rem)] overflow-hidden md:h-[calc(100svh-6rem)] ${playfair.variable} ${inter.variable}`}
    >
      <div className="absolute inset-0 z-0 h-full w-full">
        <Image
          src="/about-us-bg.webp"
          alt="Abstract dark water reflection with soulful light"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-center px-6 md:px-12">
        <div className="max-w-2xl">
          <h2 className="font-playfair text-5xl leading-[1.1] text-white md:text-7xl lg:text-[5.5rem]">
            <span className="mb-2 block font-normal md:mb-4">Creating For Soulful Spaces</span>
          </h2>

          <p className="mt-6 max-w-lg font-inter text-base font-light tracking-wide text-white/90 md:mt-8 md:text-lg">
            *If you care deeply about art, quality, and meaning - you belong here.
          </p>

          <Link
            href="/story"
            className="mt-10 inline-block rounded-[4px] bg-white px-8 py-3.5 font-inter text-sm font-medium text-black transition-colors duration-300 hover:bg-gray-100 md:mt-12 md:text-base"
          >
            View Story
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SoulfulSpaces;
