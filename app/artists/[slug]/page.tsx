import { notFound } from "next/navigation";
import { getArtistBySlug, getArtistProducts } from "@/lib/artists/directory";
import { buildSiteUrl } from "@/lib/site";
import ArtistProductGrid from "@/components/artists/ArtistProductGrid";
import ArtistAvatar from "@/components/artists/ArtistAvatar";
import { generatePersonSchema } from "@/lib/schema";

export const runtime = "edge";
export const revalidate = 300;

type ArtistPageProps = {
  params: Promise<{ slug: string }>;
};

const toAbsoluteImage = (image: string | null) =>
  image ? (image.startsWith("http") ? image : buildSiteUrl(image)) : undefined;

export async function generateMetadata({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const artistUrl = buildSiteUrl(`/artists/${artist.slug}`);
  const image = toAbsoluteImage(artist.image);

  return {
    title: `${artist.name} | Artace Studio`,
    description: artist.tagline,
    alternates: {
      canonical: artistUrl,
    },
    openGraph: {
      title: artist.name,
      description: artist.tagline,
      url: artistUrl,
      images: image ? [{ url: image }] : [],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const products = await getArtistProducts(artist);

  const artistSchema = {
    "@context": "https://schema.org",
    ...generatePersonSchema({
      name: artist.name,
      jobTitle: artist.recognition,
      image: toAbsoluteImage(artist.image),
      description: artist.bio || artist.tagline,
      url: buildSiteUrl(`/artists/${artist.slug}`),
    }),
  };

  const bioParagraphs = (artist.bio || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artistSchema) }}
      />
      <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] md:items-start">
          <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-full">
            <ArtistAvatar name={artist.name} image={artist.image} sizes="(max-width: 768px) 240px, 320px" />
          </div>
          <div>
            <h1 className="font-display text-[36px] leading-[1.1] text-[#1f1f1f] md:text-[56px]">
              {artist.name}
            </h1>
            {artist.location ? (
              <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-[#8a8378]">
                {artist.location}
              </p>
            ) : null}
            <p className="mt-2 text-[16px] text-[#666] md:text-[18px]">{artist.tagline}</p>
            {bioParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-6 max-w-2xl whitespace-pre-line text-[15px] leading-7 text-[#3f3d37] md:text-[17px] md:leading-8"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-[24px] text-[#1f1f1f] md:text-[30px]">
            Available Paintings
          </h2>
          <div className="mt-6">
            <ArtistProductGrid products={products} />
          </div>
        </div>
      </main>
    </>
  );
}
