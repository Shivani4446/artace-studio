import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const ArtistInvitation = () => {
  return (
    <section className="w-full bg-[#020304] py-12 text-white md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-[840px] md:max-w-[720px]">
          <h2 className="font-display text-left text-[34px] leading-[1.1] text-white sm:text-[40px] md:text-[52px]">
            An Invitation to Artists: Share Your Story with Our Collectors</h2>

          <p className="mt-6 max-w-[850px] text-left text-[16px] leading-7 text-white/65 md:text-[18px]">
            At Artace Studio, we believe to build the bridge between your studio and
            the spaces where your work will be most cherished. We are not a
            marketplace; we are a curated digital gallery dedicated to presenting
            authentic, handmade art in the elevated context it deserves.
          </p>

          <Link
            href="/contact-us"
            className="mt-9 inline-flex items-center gap-2 rounded-[6px] bg-white px-7 py-3 text-[15px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#efefef]"
          >
            Partner With Us
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
          </Link>
          </div>

          <div className="w-full max-w-[420px] md:w-[38%]">
            <div className="relative h-[220px] w-full sm:h-[260px] md:h-[300px] lg:h-[320px]">
              <Image
                src="/partner-with-us.svg"
                alt="Partner with Artace Studio"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 420px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtistInvitation;
