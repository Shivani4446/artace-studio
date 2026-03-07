"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type DiscoverCategoryCard = {
  id: number;
  title: string;
  image: string;
  imageAlt: string;
  href: string;
};

type DiscoverEssentialsProps = {
  categories?: DiscoverCategoryCard[];
};

const FALLBACK_CATEGORIES: DiscoverCategoryCard[] = [
  {
    id: 1,
    title: "Contemporary Art",
    image: "/images/art-forest.png",
    imageAlt: "Contemporary Art",
    href: "/shop",
  },
  {
    id: 2,
    title: "Radha Krishna",
    image: "/images/hero-bg.png",
    imageAlt: "Radha Krishna",
    href: "/shop",
  },
  {
    id: 3,
    title: "Ganesha",
    image: "/images/interior-room.png",
    imageAlt: "Ganesha",
    href: "/shop",
  },
  {
    id: 4,
    title: "Buddha",
    image: "/images/art-floral.png",
    imageAlt: "Buddha",
    href: "/shop",
  },
];

const DiscoverEssentials = ({ categories = [] }: DiscoverEssentialsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const categoryCards = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const [cardWidth, setCardWidth] = useState(0);
  const [cardFrameWidth, setCardFrameWidth] = useState(0);
  const [cardFrameHeight, setCardFrameHeight] = useState(0);
  const [headingPanelWidth, setHeadingPanelWidth] = useState(0);
  const [scrollableWidth, setScrollableWidth] = useState(0);
  const [stickyOffset, setStickyOffset] = useState(80);

  useEffect(() => {
    const updateDimensions = () => {
      if (trackWrapperRef.current) {
        const vw = trackWrapperRef.current.clientWidth;
        const isMdUp = window.innerWidth >= 768;
        const nextStickyOffset = isMdUp ? 96 : 80;
        const stickyViewportHeight = Math.max(window.innerHeight - nextStickyOffset, 0);

        const columnPadding = window.innerWidth >= 1024 ? 48 : isMdUp ? 40 : 24;
        const sectionVerticalPadding =
          window.innerWidth >= 1024 ? 80 : isMdUp ? 72 : 64;
        const maxStaggerOffset = isMdUp ? 32 : 16;
        const imageBottomGap = 20;
        const titleBlockHeight = isMdUp ? 64 : 52;
        const targetFrameWidth = 450;

        // Fit image + title in one viewport while keeping a portrait ratio.
        const availableImageHeight = Math.max(
          280,
          stickyViewportHeight -
            sectionVerticalPadding -
            maxStaggerOffset -
            imageBottomGap -
            titleBlockHeight
        );
        const frameHeight = Math.min(isMdUp ? 600 : 500, availableImageHeight);
        const frameWidth = isMdUp
          ? targetFrameWidth
          : Math.min(targetFrameWidth, Math.max(260, vw - columnPadding * 2 - 8));
        const cw = frameWidth + columnPadding * 2;

        const hpw =
          window.innerWidth >= 1024
            ? 360
            : window.innerWidth >= 768
              ? 300
              : Math.min(320, vw * 0.9);

        setCardFrameHeight(frameHeight);
        setCardFrameWidth(frameWidth);
        setCardWidth(cw);
        setHeadingPanelWidth(hpw);
        setScrollableWidth(Math.max(0, hpw + cw * categoryCards.length - vw));
        setStickyOffset(nextStickyOffset);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    requestAnimationFrame(updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [categoryCards.length]);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (!containerRef.current || !trackRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = stickyOffset - rect.top;

      let progress = scrolled;
      if (progress < 0) progress = 0;
      if (progress > scrollableWidth) progress = scrollableWidth;

      rafId = requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(-${progress}px, 0, 0)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollableWidth, stickyOffset]);

  const sectionScrollHeight = Math.max(scrollableWidth - stickyOffset, 0);

  return (
    <section
      ref={containerRef}
      style={{ height: `calc(100vh + ${sectionScrollHeight}px)` }}
      className="relative w-full border-y border-black/5 bg-[#f1f0ed]"
    >
      <div className="sticky top-20 h-[calc(100vh-5rem)] w-full overflow-hidden md:top-24 md:h-[calc(100vh-6rem)]">
        <div className="mx-auto h-full w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-9 lg:px-12 lg:py-10">
          <div ref={trackWrapperRef} className="relative h-full overflow-hidden">
            <div
              ref={trackRef}
              className="flex h-full w-max will-change-transform"
              style={{ width: `${headingPanelWidth + cardWidth * categoryCards.length}px` }}
            >
              <div
                style={{ width: headingPanelWidth ? `${headingPanelWidth}px` : "85vw" }}
                className="relative flex h-full shrink-0 flex-col justify-between border-r border-[#1a1a1a]/10 pr-6 md:pr-10"
              >
                <div>
                  <h2 className="font-display text-[36px] uppercase leading-[1.1] tracking-tight text-[#1A1A1A] md:text-[44px] lg:text-[50px]">
                    DISCOVER
                    <br className="hidden md:block" />
                    <span className="md:hidden"> </span>
                    ESSENTIALS
                  </h2>
                </div>
                <div className="mt-8 block md:mt-14">
                  <Link
                    href="/shop"
                    className="inline-block border-b border-[#1A1A1A] pb-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#1A1A1A] transition-colors hover:border-black/50 hover:text-[#1A1A1A]/70 md:text-[12px]"
                  >
                    EXPLORE ALL
                  </Link>
                </div>
              </div>

              {categoryCards.map((item, index) => (
                <div
                  key={item.id}
                  style={{ width: cardWidth ? `${cardWidth}px` : "46vw" }}
                  className="relative flex h-full shrink-0 flex-col border-r border-[#1a1a1a]/10 px-6 md:px-10 lg:px-12"
                >
                  <Link
                    href={item.href}
                    className={`group flex h-full w-full flex-col gap-5 ${
                      index % 2 !== 0 ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="relative w-full overflow-hidden">
                      <div
                        className="relative mx-auto"
                        style={{
                          width: cardFrameWidth ? `${cardFrameWidth}px` : "min(100%, 450px)",
                          height: cardFrameHeight ? `${cardFrameHeight}px` : "min(60vh, 520px)",
                          maxWidth: "100%",
                        }}
                      >
                        <Image
                          src={item.image}
                          alt={item.imageAlt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 767px) 46vw, 450px"
                        />
                      </div>
                    </div>
                    <h3 className="shrink-0 font-display text-lg text-[#1A1A1A] md:text-xl">
                      {item.title}
                    </h3>
                  </Link>
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
