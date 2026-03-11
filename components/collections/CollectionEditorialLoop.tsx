"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type EditorialItem = {
  title: string;
  body: string;
};

type EditorialImage = {
  src: string;
  alt: string;
};

type CollectionEditorialLoopProps = {
  items: EditorialItem[];
  images: EditorialImage[];
  staticImage?: EditorialImage;
};

const AUTO_ADVANCE_MS = 3600;
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const CollectionEditorialLoop = ({
  items,
  images,
  staticImage,
}: CollectionEditorialLoopProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = activeIndex >= items.length ? 0 : activeIndex;

  const resolvedImages = useMemo(() => {
    const fallbackImage = images[0] ?? {
      src: FALLBACK_PRODUCT_IMAGE,
      alt: "Collection artwork",
    };

    return items.map((item, index) => ({
      src: images[index]?.src || fallbackImage.src,
      alt: images[index]?.alt || item.title || fallbackImage.alt,
    }));
  }, [images, items]);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <div className="mt-8 grid gap-8 md:mt-10 md:gap-10 lg:grid-cols-2 lg:items-center lg:gap-[60px]">
      <div className="order-2 space-y-1 lg:order-1 lg:self-center">
        {items.map((item, index) => {
          const isActive = index === safeActiveIndex;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-expanded={isActive}
              className="block w-full py-4 text-left md:py-5"
            >
              <div className="flex items-start">
                <h3
                  className={`font-display text-[21px] leading-[1.2] transition-colors md:text-[26px] lg:text-[30px] ${
                    isActive ? "text-[#111111]" : "text-[#8a8378]"
                  }`}
                >
                  {item.title}
                </h3>
              </div>

              <div className="mt-5 border-t border-black/10 md:mt-6" />

              <div
                className={`grid overflow-hidden transition-all duration-500 ease-out ${
                  isActive
                    ? "mt-6 grid-rows-[1fr] opacity-100 md:mt-10 lg:mt-[60px]"
                    : "mt-0 grid-rows-[0fr] opacity-60"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[620px] text-[16px] leading-[1.7] text-[#5b5b5b] md:text-[17px] lg:text-[18px]">
                    {item.body}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="order-1 relative aspect-[4/4.85] w-full overflow-hidden rounded-[14px] bg-[#ded8ce] md:aspect-[4/5] md:rounded-[16px] lg:order-2 lg:w-[92%] lg:justify-self-end">
        {staticImage ? (
          <>
            <Image
              src={staticImage.src || FALLBACK_PRODUCT_IMAGE}
              alt={staticImage.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 42vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
          </>
        ) : (
          resolvedImages.map((image, index) => {
            const isActive = index === safeActiveIndex;

            return (
              <div
                key={`${image.src}-${index}`}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.src || FALLBACK_PRODUCT_IMAGE}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CollectionEditorialLoop;
