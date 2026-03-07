import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const ArtistInvitation = () => {
  return (
    <section className="w-full bg-[#020304] px-4 py-12 text-white md:px-8 md:py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="relative w-full overflow-hidden">
          <div className="relative aspect-[16/10] w-full md:aspect-[16/9]">
            <Image
              src="/images/interior-room.png"
              alt="Styled interior room with framed art"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1240px"
              priority
            />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[840px] text-center md:mt-12">
          <h2 className="font-display text-[52px] leading-[1.1] text-white md:text-[52px] lg:text-[52px]">
            An Invitation to Artists: Share Your Story with Our Collectors</h2>

          <p className="mx-auto mt-6 max-w-[850px] text-[17px] leading-7 text-white/65 md:text-[18px]">
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
      </div>
    </section>
  );
};

export default ArtistInvitation;
