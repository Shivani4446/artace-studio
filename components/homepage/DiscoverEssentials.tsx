"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getCollectionHref } from "@/utils/collections";

type DiscoverCategoryCard = {
  id: number;
  title: string;
  image: string;
  imageAlt: string;
  href: string;
};

// Fixed, hand-curated lineup for the "Explore Our Collections" section —
// order and images are deliberate choices, not derived from live WooCommerce
// category data (product counts fluctuate and would reorder/replace these
// unpredictably). To change which collections appear, or their order or
// image, edit this array directly.
const CURATED_CATEGORIES: DiscoverCategoryCard[] = [
  {
    id: 1,
    title: "Modern Art",
    image: "/modern-art.webp",
    imageAlt: "Modern Art Collection",
    href: getCollectionHref("modern-wall-art"),
  },
  {
    id: 2,
    title: "Abstract Paintings",
    image: "/abstract-art.webp",
    imageAlt: "Abstract Paintings Collection",
    href: getCollectionHref("abstract-paintings"),
  },
  {
    id: 3,
    title: "Landscape Paintings",
    image: "/landscape-collection-bg.webp",
    imageAlt: "Landscape Paintings Collection",
    href: getCollectionHref("landscapes-cityscapes-paintings"),
  },
  {
    id: 4,
    title: "Ganesha Paintings",
    image: "/ganesha-painting.webp",
    imageAlt: "Ganesha Paintings Collection",
    href: getCollectionHref("ganapati-paintings"),
  },
  {
    id: 5,
    title: "Radha Krishna Paintings",
    image: "/radha-krishna-collection-bg.webp",
    imageAlt: "Radha Krishna Paintings Collection",
    href: getCollectionHref("radha-krishna-paintings"),
  },
  {
    id: 6,
    title: "Photography",
    image: "/Artist-1.webp",
    imageAlt: "Photography Collection",
    href: getCollectionHref("photography"),
  },
];

const CUSTOM_ORDER_CARD: DiscoverCategoryCard = {
  id: 999,
  title: "Custom Order",
  image: "/images/product-ship.png",
  imageAlt: "Create your custom painting",
  href: "/custom-order",
};

const toCollectionLabel = (title: string) => {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return "Collection";
  if (/collection/i.test(normalizedTitle)) return normalizedTitle;

  const cleanedTitle = normalizedTitle
    .replace(/\bpaintings?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return `${cleanedTitle || normalizedTitle} Collection`;
};

const DiscoverEssentials = () => {
  // 6 curated collections + Custom Order card = exactly 7: one large
  // featured card up front, six in the grid, Custom Order always last.
  const displayCards = [...CURATED_CATEGORIES, CUSTOM_ORDER_CARD];
  const featuredCard = displayCards[0];
  const gridCards = displayCards.slice(1, 7);

  return (
    <section className="w-full bg-[#efeeec] py-12 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <h2 className="font-display text-[34px] leading-[1.04] tracking-tight text-[#2f2f2f] sm:text-[42px] md:text-[52px]">
          Explore Our Collections, Radha Krishna, Abstract, Buddha & Beyond
        </h2>
        <p className="mt-4 max-w-2xl font-inter text-[16px] leading-[1.6] text-[#5b5b5b] md:text-[18px]">
          From the divine to the abstract, every collection at Artace Studio is
          handcrafted in-house, no two canvases are ever the same.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:mt-10 md:gap-5 lg:mt-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:grid-rows-2">
          <Link
            href={featuredCard.href}
            className="group relative block min-h-[280px] overflow-hidden rounded-[12px] bg-[#d6d2ca] sm:col-span-2 sm:min-h-[340px] md:row-span-2 md:min-h-[520px] lg:col-span-1 lg:min-h-[584px]"
          >
            <Image
              src={featuredCard.image}
              alt={featuredCard.imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 md:bottom-6 md:left-6 md:right-6">
              <h3 className="font-inter text-[17px] font-medium leading-[1.1] text-white md:text-[18px]">
                {toCollectionLabel(featuredCard.title)}
              </h3>
            </div>
          </Link>

          {gridCards.map((item, index) => (
            item.title === "Custom Order" ? (
              <Link
                key={`${item.id}-${index}`}
                href={item.href}
                className="group relative flex flex-col items-center justify-center min-h-[190px] overflow-hidden rounded-[12px] bg-[#292929] sm:min-h-[220px] md:min-h-[250px] lg:min-h-[280px] transition-colors hover:bg-[#1f1f1f]"
              >
                <div className="text-center px-4">
                  <h3 className="font-inter text-[18px] font-medium leading-[1.2] text-white sm:text-[20px] md:text-[22px]">
                    Can&apos;t find what you&apos;re looking for?
                  </h3>
                  <p className="mt-2 text-[14px] text-white/80 sm:text-[16px]">
                    Create your dream painting with our custom order service.
                  </p>
                  <span className="mt-4 inline-block rounded-full bg-white px-6 py-2 text-[14px] font-medium text-[#292929] transition-transform group-hover:scale-105">
                    Create Custom Order
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                key={`${item.id}-${index}`}
                href={item.href}
                className="group relative block min-h-[190px] overflow-hidden rounded-[12px] bg-[#d6d2ca] sm:min-h-[220px] md:min-h-[250px] lg:min-h-[280px]"
              >
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 22vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5">
                  <h3 className="font-inter text-[16px] font-medium leading-[1.1] text-white sm:text-[17px] md:text-[18px]">
                    {toCollectionLabel(item.title)}
                  </h3>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverEssentials;
