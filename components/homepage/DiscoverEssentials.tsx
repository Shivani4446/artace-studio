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

type DiscoverEssentialsProps = {
  categories?: DiscoverCategoryCard[];
};

const FALLBACK_CATEGORIES: DiscoverCategoryCard[] = [
  {
    id: 1,
    title: "Radha Krishna",
    image: "/stack-1.webp",
    imageAlt: "Radha Krishna Collection",
    href: getCollectionHref("radha-krishna-paintings"),
  },
  {
    id: 2,
    title: "Figurative",
    image: "/stack-2.webp",
    imageAlt: "Figurative Collection",
    href: getCollectionHref("figurative-paintings"),
  },
  {
    id: 3,
    title: "Buddha",
    image: "/stack-3.webp",
    imageAlt: "Buddha Collection",
    href: getCollectionHref("buddha-paintings"),
  },
  {
    id: 4,
    title: "Abstract",
    image: "/images/art-forest.png",
    imageAlt: "Abstract Collection",
    href: getCollectionHref("abstract-paintings"),
  },
  {
    id: 5,
    title: "Landscapes",
    image: "/hero-bg.webp",
    imageAlt: "Landscapes Collection",
    href: getCollectionHref("landscapes-cityscapes-paintings"),
  },
  {
    id: 6,
    title: "Vastu",
    image: "/images/interior-room.png",
    imageAlt: "Vastu Collection",
    href: getCollectionHref("vastu-paintings"),
  },
  {
    id: 7,
    title: "Ganapati",
    image: "/images/hero-bg.png",
    imageAlt: "Ganapati Collection",
    href: getCollectionHref("ganapati-paintings"),
  },
];

const CUSTOM_ORDER_CARD: DiscoverCategoryCard = {
  id: 999,
  title: "Custom Order",
  image: "/images/product-ship.png",
  imageAlt: "Create your custom painting",
  href: "/custom-order",
};

const PRIORITY_KEYWORDS = ["radha krishna", "figurative", "buddha", "abstract"];

const getCategoryPriority = (title: string) => {
  const normalizedTitle = title.trim().toLowerCase();
  const matchIndex = PRIORITY_KEYWORDS.findIndex((keyword) =>
    normalizedTitle.includes(keyword)
  );

  return matchIndex === -1 ? Number.POSITIVE_INFINITY : matchIndex;
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

const getDisplayCards = (categories: DiscoverCategoryCard[]) => {
  const sourceCards = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const prioritizedCards = sourceCards
    .map((card, index) => ({
      card,
      index,
      priority: getCategoryPriority(card.title),
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.index - b.index;
    })
    .map((entry) => entry.card);

  const cards = prioritizedCards.slice(0, 7);
  let fillerIndex = 0;
  while (cards.length < 7) {
    cards.push(FALLBACK_CATEGORIES[fillerIndex % FALLBACK_CATEGORIES.length]);
    fillerIndex += 1;
  }
  // Replace last card with Custom Order card
  cards[6] = CUSTOM_ORDER_CARD;

  return cards;
};

const DiscoverEssentials = ({ categories = [] }: DiscoverEssentialsProps) => {
  const displayCards = getDisplayCards(categories);
  const featuredCard = displayCards[0];
  const gridCards = displayCards.slice(1, 7);

  return (
    <section className="w-full bg-[#efeeec] py-12 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <h2 className="font-display text-[34px] leading-[1.04] tracking-tight text-[#2f2f2f] sm:text-[42px] md:text-[52px]">
          Discover Our Collections
        </h2>

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
