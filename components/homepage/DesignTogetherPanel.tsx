import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CAL_LINK = "https://cal.com/artace-studio";

const DesignTogetherPanel = () => {
  return (
    <section className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden md:min-h-[640px] md:justify-center">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/stack-3.webp"
          alt="Grey living room with gallery wall frames"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-6 py-10 md:justify-center md:px-12 md:py-0">
        <div className="max-w-3xl">
          <h2 className="mb-4 font-display text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.1] lg:text-6xl">
            Not Sure What You Need? Let&apos;s Design It Together
          </h2>
          <p className="mb-8 max-w-xl font-inter text-[15px] font-normal leading-relaxed text-white/90 md:mb-10 md:text-lg">
            At Artace Studio, our curation extends beyond the canvas. We believe the
            same authenticity, craftsmanship, and narrative power should apply to
            every element that makes your space your own.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[4px] bg-white px-8 py-3.5 font-inter text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Book a Call Now
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-inter text-sm font-medium text-white underline-offset-4 transition-all hover:underline"
            >
              See Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignTogetherPanel;
