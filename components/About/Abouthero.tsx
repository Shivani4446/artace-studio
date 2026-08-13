import Image from "next/image";
import { playfairDisplay as playfair, inter } from "@/lib/fonts";

export default function HeroSection() {
  return (
    <section className="relative flex h-[72vh] min-h-[420px] w-full items-center overflow-hidden md:h-[80vh] md:min-h-[500px]">
      
      {/* 1. Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Artace-studio-artwork.png"
          alt="Abstract dark nature background"
          fill
          priority
          className="object-cover object-center brightness-75" // brightness-75 dims image slightly so text pops
        />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          
          {/* Heading */}
          <h1
            className={`${playfair.className} mb-4 text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:mb-6 md:text-7xl lg:text-8xl`}
          >
            Creating for <br />
            Soulful Spaces
          </h1>

          {/* Subtext */}
          <p
            className={`${inter.className} text-base font-light tracking-wide text-white/90 sm:text-lg md:text-xl`}
          >
            If you care deeply about art, quality, and meaning you belong here.
          </p>

        </div>
      </div>
    </section>
  );
}

