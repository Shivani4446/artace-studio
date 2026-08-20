import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTISTS } from "@/lib/artists/data";
import { buildSiteUrl } from "@/lib/site";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Our Artists | Artace Studio",
  description: "Meet the artists behind Artace Studio's handcrafted paintings.",
  alternates: {
    canonical: buildSiteUrl("/artists"),
  },
};

export default function ArtistsPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
      <h1 className="font-display text-[36px] leading-[1.1] text-[#1f1f1f] md:text-[56px]">Our Artists</h1>
      <p className="mt-2 max-w-2xl text-[16px] text-[#666] md:text-[18px]">
        Meet the artists behind our handcrafted paintings.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ARTISTS.map((artist) => (
          <Link key={artist.slug} href={`/artists/${artist.slug}`} className="group flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 font-display text-[20px] text-[#2c2c2c]">{artist.name}</h2>
            <p className="mt-1 text-[14px] text-[#666]">{artist.tagline}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
