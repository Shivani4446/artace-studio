import React from "react";
import Link from "next/link";
import Image from "next/image";

const ArtistInvitation = () => {
  return (
    <section className="relative h-[320px] w-full md:h-[360px]">
      <Image
        src="/images/art-gallery.png"
        alt="Artist Invitation"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 mx-auto flex w-full max-w-[1240px] items-center justify-between gap-6 px-4 text-white md:px-6">
        <div className="max-w-[560px]">
          <h2 className="font-display text-3xl uppercase leading-[1.03] md:text-[42px]">
            AN INVITATION TO ARTISTS:
            <br />
            SHARE YOUR STORY WITH OUR COLLECTORS
          </h2>
          <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/80 md:text-sm">
            Join our curated roster and bring your voice to a global audience
            of collectors and design-led homes.
          </p>
          <Link
            href="#"
            className="mt-5 inline-block bg-white px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#d5c29c]"
          >
            Apply Now
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {[
            "/images/art-forest.png",
            "/images/art-floral.png",
            "/images/product-ship.png",
            "/images/product-portrait.png",
          ].map((art, index) => (
            <div
              key={art}
              className="relative h-[72px] w-[58px] overflow-hidden border border-white/70 bg-white/20"
            >
              <Image
                src={art}
                alt={`Artist frame ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistInvitation;
