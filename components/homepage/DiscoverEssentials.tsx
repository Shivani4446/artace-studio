"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const essentials = [
  {
    title: "Contemporary Art",
    image: "/images/art-forest.png",
  },
  {
    title: "Radha Krishna",
    image: "/images/hero-bg.png",
  },
  {
    title: "Ganesha",
    image: "/images/interior-room.png",
  },
  {
    title: "Buddha",
    image: "/images/art-floral.png",
  },
];

const DiscoverEssentials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [scrollableWidth, setScrollableWidth] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (trackWrapperRef.current) {
        const vw = trackWrapperRef.current.clientWidth;
        // Specifically requesting 1 fully visible and 2nd one 80% visible means 1.8 cards fit in the viewport
        const cw = vw / 1.8;
        setCardWidth(cw);
        setScrollableWidth(Math.max(0, cw * essentials.length - vw));
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    // Request animation frame ensures it's measured right after paint
    requestAnimationFrame(updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (!containerRef.current || !trackRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = -rect.top;

      // Calculate progress and clamp between 0 and scrollableWidth
      let progress = scrolled;
      if (progress < 0) progress = 0;
      if (progress > scrollableWidth) progress = scrollableWidth;

      // Use transform wrapper directly for maximum performance
      rafId = requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(-${progress}px, 0, 0)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollableWidth]);

  return (
    <section
      ref={containerRef}
      style={{ height: `calc(100vh + ${scrollableWidth}px)` }}
      className="relative w-full border-y border-black/5 bg-[#f1f0ed]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col md:flex-row pl-4 md:pl-8 lg:pl-12 py-10 md:py-16 lg:py-24">
          {/* Left Column (Fixed visually on all devices) */}
          <div className="flex w-full shrink-0 flex-col justify-between pr-6 md:w-[300px] lg:w-[360px] md:pr-10 border-r border-[#1a1a1a]/10 pb-6 md:pb-0 z-10 relative bg-[#f1f0ed] md:bg-transparent">
            <div>
              <h2 className="font-display text-[36px] uppercase leading-[1.1] tracking-tight text-[#1A1A1A] md:text-[44px] lg:text-[50px]">
                DISCOVER
                <br className="hidden md:block" />
                <span className="md:hidden"> </span>
                ESSENTIALS
              </h2>
            </div>
            <div className="mt-8 md:mt-14 block">
              <Link
                href="#"
                className="inline-block border-b border-[#1A1A1A] pb-0.5 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.05em] text-[#1A1A1A] transition-colors hover:border-black/50 hover:text-[#1A1A1A]/70"
              >
                EXPLORE ALL
              </Link>
            </div>
          </div>

          {/* Right Scroll Column */}
          <div
            ref={trackWrapperRef}
            className="flex-1 overflow-hidden relative border-t md:border-t-0 border-[#1a1a1a]/10 pt-6 md:pt-0"
          >
            <div
              ref={trackRef}
              className="flex h-full w-max will-change-transform"
              style={{ width: `${cardWidth * essentials.length}px` }}
            >
              {essentials.map((item, index) => (
                <div
                  key={index}
                  style={{ width: cardWidth ? `${cardWidth}px` : "55vw" }}
                  className="relative flex h-full shrink-0 flex-col px-6 md:px-10 lg:px-12 border-r border-[#1a1a1a]/10"
                >
                  <div
                    className={`flex h-full w-full flex-col ${
                      index % 2 !== 0
                        ? "justify-end pb-8 md:pb-16"
                        : "justify-start pt-8 md:pt-24"
                    }`}
                  >
                    <div className="relative mb-5 w-full overflow-hidden">
                      {/* Aspect ratio allows the images to get huge but forces proportional height to constraint them slightly */}
                      <div className="relative aspect-[4/5] md:aspect-[3/4] max-h-[50vh] md:max-h-[60vh] w-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 40vw"
                        />
                      </div>
                    </div>
                    <h3 className="font-display text-lg text-[#1A1A1A] md:text-xl shrink-0 mt-2 md:mt-4">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverEssentials;
