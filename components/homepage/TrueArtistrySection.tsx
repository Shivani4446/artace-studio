"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

const TrueArtistrySection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.setAttribute("muted", "");
    void video.play().catch(() => {
      // Ignore autoplay rejections (e.g., low-power mode restrictions).
    });
  }, []);

  return (
    <section className="w-full bg-[#f7f6f3] py-14 md:py-20">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-6 md:px-12 lg:grid-cols-2 lg:gap-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-[34px] leading-[1.08] text-[#222222] sm:text-[40px] md:text-[52px]">
            True Artistry. No Compromises.
          </h2>
          <p className="mt-5 font-inter text-[16px] leading-[1.75] text-[#3f3f3f] md:mt-6 md:text-[18px] md:leading-[1.8]">
            In a world flooded with digital prints and mass-produced decor, Artace
            Studio champions the soul of original art. We are not a marketplace; we
            are the artist&apos;s studio. Every piece we create is an authentic,
            handcrafted labor of love, utilizing premium oil and acrylic mediums
            that bring texture, depth, and life to your walls. Don&apos;t just
            decorate your home-invest in a piece of your own story.
          </p>
        </div>

        <div className="relative w-full max-w-[340px] justify-self-center sm:max-w-[420px] lg:max-w-[460px] lg:justify-self-end">
          <div className="pointer-events-none absolute -left-56 -top-14 z-20 hidden md:block">
            <Image
              src="/authentic-vector.svg"
              alt=""
              aria-hidden="true"
              width={220}
              height={90}
              className="h-auto w-[180px] lg:w-[220px]"
            />
          </div>

          <div className="pointer-events-none absolute -bottom-14 -left-56 z-20 hidden md:block">
            <Image
              src="/museum-vector.svg"
              alt=""
              aria-hidden="true"
              width={220}
              height={90}
              className="h-auto w-[180px] lg:w-[220px]"
            />
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[12px] bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onEnded={() => {
                const video = videoRef.current;
                if (!video) return;
                video.currentTime = 0;
                void video.play().catch(() => {});
              }}
            >
              <source
                src="https://api.artacestudio.com/wp-content/uploads/2026/03/first-painting-reel.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrueArtistrySection;
