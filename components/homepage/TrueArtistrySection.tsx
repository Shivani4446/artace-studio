import React from "react";
import Image from "next/image";

const TrueArtistrySection = () => {
  return (
    <section className="w-full bg-[#f7f6f3] py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-6 md:px-12 lg:grid-cols-2 lg:gap-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-[40px] leading-[1.08] text-[#222222] md:text-[52px]">
            True Artistry. No Compromises.
          </h2>
          <p className="mt-6 font-inter text-[18px] leading-[1.8] text-[#3f3f3f]">
            In a world flooded with digital prints and mass-produced decor, Artace
            Studio champions the soul of original art. We are not a marketplace; we
            are the artist&apos;s studio. Every piece we create is an authentic,
            handcrafted labor of love, utilizing premium oil and acrylic mediums
            that bring texture, depth, and life to your walls.
          </p>
        </div>

        <div className="relative w-full max-w-[460px] justify-self-center lg:justify-self-end">
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
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
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
