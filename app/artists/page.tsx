import Link from "next/link";
import type { Metadata } from "next";
import { getAllArtists } from "@/lib/artists/directory";
import { ARTIST_DASHBOARD_LINKS, withDashboardUtm } from "@/lib/artists/dashboard";
import ArtistAvatar from "@/components/artists/ArtistAvatar";
import { buildSiteUrl } from "@/lib/site";
import { generatePersonSchema } from "@/lib/schema";

export const runtime = "edge";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Artists | Artace Studio",
  description: "Meet the artists behind Artace Studio's handcrafted paintings.",
  alternates: {
    canonical: buildSiteUrl("/artists"),
  },
};

const toAbsoluteImage = (image: string | null) =>
  image ? (image.startsWith("http") ? image : buildSiteUrl(image)) : undefined;

export default async function ArtistsPage() {
  const artists = await getAllArtists();

  const artistsSchema = {
    "@context": "https://schema.org",
    "@graph": artists.map((artist) =>
      generatePersonSchema({
        name: artist.name,
        jobTitle: artist.recognition,
        image: toAbsoluteImage(artist.image),
        description: artist.tagline,
        url: buildSiteUrl(`/artists/${artist.slug}`),
      })
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artistsSchema) }}
      />
      <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
        <h1 className="font-display text-[36px] leading-[1.1] text-[#1f1f1f] md:text-[56px]">Our Artists</h1>
        <p className="mt-2 max-w-2xl text-[16px] text-[#666] md:text-[18px]">
          Meet the artists behind our handcrafted paintings.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((artist) => (
            <Link key={artist.slug} href={`/artists/${artist.slug}`} className="group flex flex-col">
              <div className="relative aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
                <ArtistAvatar
                  name={artist.name}
                  image={artist.image}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h2 className="mt-4 font-display text-[20px] text-[#2c2c2c]">{artist.name}</h2>
              {artist.location ? (
                <p className="mt-0.5 text-[13px] uppercase tracking-[0.12em] text-[#8a8378]">
                  {artist.location}
                </p>
              ) : null}
              <p className="mt-1 text-[14px] text-[#666]">{artist.tagline}</p>
            </Link>
          ))}
        </div>

        <section className="mt-16 flex flex-col items-start gap-4 rounded-[12px] bg-[#f4efe6] px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="font-display text-[22px] text-[#1f1f1f] md:text-[28px]">Are you an artist?</h2>
            <p className="mt-1 max-w-xl text-[15px] text-[#5f5a52]">
              Apply to sell your original paintings on Artace Studio. We handle the storefront,
              payments and shipping.
            </p>
          </div>
          <a
            href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.apply, "artists-page")}
            className="inline-flex shrink-0 items-center justify-center rounded-[4px] bg-[#1f1f1f] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
          >
            Apply to sell your art
          </a>
        </section>
      </main>
    </>
  );
}
