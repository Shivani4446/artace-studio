import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const ArtistInvitation = () => {
  return (
    <section className="w-full bg-[#020304] py-6 text-white md:py-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 px-6 text-center md:flex-row md:justify-center md:gap-3 md:px-12">
        <p className="font-inter text-[14px] text-white/70 md:text-[15px]">
          We empower independent artists to share their stories with the world.
        </p>
        <Link
          href="/contact-us"
          className="inline-flex items-center gap-1 font-inter text-[14px] font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80 md:text-[15px]"
        >
          Partner With Us
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
};

export default ArtistInvitation;
