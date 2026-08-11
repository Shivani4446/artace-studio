import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const AboutUsPanel = () => {
  return (
    <section className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden md:min-h-[640px] md:justify-center">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/Artace-studio-artwork.png"
          alt="Modern interior with abstract art and blue textured wall"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-6 py-10 md:justify-center md:px-12 md:py-0">
        <div className="max-w-3xl">
          <h2 className="mb-4 whitespace-pre-line font-display text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.1] lg:text-6xl">
            {"We Connect You With\nAuthentic, Handmade Art\nTo Give Your Space A\nSoul."}
          </h2>
          <p className="mb-8 max-w-xl font-inter text-[15px] font-normal leading-relaxed text-white/90 md:mb-10 md:text-lg">
            We invite you to explore. Not just to find a painting, but to discover a
            connection. Find the piece that speaks to you. Find the soul for your space.
          </p>
          <Link
            href="/about-us"
            className="inline-flex items-center gap-2 font-inter text-base font-medium text-white underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            More About Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutUsPanel;
