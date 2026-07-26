import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Moon, Ruler, Heart, Sparkles } from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { fetchProductsBySlugs } from "@/lib/rooms";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Bedroom Paintings Online India | Calming Canvas Wall Art | Artace Studio",
  description:
    "Shop hand-painted bedroom wall art online in India — calming canvas paintings in soft, soothing palettes, sized for above the headboard or an accent wall. 100% handmade, never printed.",
  alternates: {
    canonical: "/rooms/bedroom",
  },
  openGraph: {
    title: "Bedroom Paintings Online India | Calming Canvas Wall Art | Artace Studio",
    description:
      "Shop hand-painted bedroom wall art online in India — calming canvas paintings in soft, soothing palettes, sized for above the headboard or an accent wall.",
    url: "/rooms/bedroom",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/images/bedroom.jpeg"),
        width: 1402,
        height: 1122,
        alt: "Bedroom styled with a calming wall painting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bedroom Paintings Online India | Calming Canvas Wall Art",
    description: "Shop hand-painted bedroom wall art online in India, in soft, soothing palettes.",
    images: [buildSiteUrl("/images/bedroom.jpeg")],
  },
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const BEDROOM_PRODUCT_SLUGS = [
  "water-lily-canvas-painting",
  "golden-buddha-canvas-painting",
  "white-buddha-canvas-painting",
  "meditating-buddha-canvas-painting",
  "silence-peace",
  "beauty-of-bamboo-canvas-painting",
  "sunset-beauty-canavs-painting",
  "four-seasons-tree-canvas-painting",
  "peace-handmade-canvas-painting-vastu",
  "radhe-mohan-canvas-painting",
] as const;

const bedroomTips = [
  {
    icon: Moon,
    title: "Choose a Calming Palette",
    description:
      "Soft blues, warm neutrals, and muted gold read as restful. Save bold reds and high-contrast pieces for more active rooms like the living room.",
  },
  {
    icon: Ruler,
    title: "Size to Your Headboard",
    description:
      "For above-the-bed placement, aim for artwork roughly two-thirds the width of your headboard, so it feels intentional rather than floating.",
  },
  {
    icon: Heart,
    title: "Consider the Subject Carefully",
    description:
      "Water, nature, and meditative figures like Buddha tend to suit a bedroom's purpose better than busy, high-energy scenes.",
  },
  {
    icon: Sparkles,
    title: "One Statement, Not Many",
    description:
      "A single well-chosen piece almost always outperforms a cluttered gallery wall in a room meant for rest.",
  },
];

const BedroomPage = async () => {
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(cookieStore.get(CURRENCY_COOKIE_NAME)?.value);
  const exchangeRates = await getExchangeRates();

  const products = await fetchProductsBySlugs(BEDROOM_PRODUCT_SLUGS);

  const bedroomSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${buildSiteUrl("/rooms/bedroom")}#webpage`,
        url: buildSiteUrl("/rooms/bedroom"),
        name: "Bedroom Paintings | Calming Canvas Wall Art",
        description:
          "Shop hand-painted bedroom wall art online in India — calming canvas paintings in soft, soothing palettes.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${buildSiteUrl("/rooms/bedroom")}#itemlist`,
        url: buildSiteUrl("/rooms/bedroom"),
        numberOfItems: products.length,
        itemListElement: products.slice(0, 6).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSiteUrl(`/shop/${product.slug}`),
          name: product.name,
          image: toAbsoluteImageUrl(product.image),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bedroomSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-black">
          <div className="relative h-[75vh] min-h-[520px] w-full md:h-[85vh] md:min-h-[620px]">
            <Image
              src="/images/bedroom.jpeg"
              alt="Bedroom styled with a calming wall painting"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-14 md:items-center md:px-12 md:pb-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[16px] font-medium uppercase tracking-[0.08em] text-white/80 md:text-[18px]">
                  A Quiet Retreat, Styled Around You
                </p>
                <h1 className="mt-4 font-display text-[36px] font-semibold leading-[1.08] sm:text-[42px] md:mt-5 md:text-[52px]">
                  Bedroom Paintings
                </h1>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px]">
                  Bring a calming focal point to your bedroom with hand-painted canvas
                  art chosen for soft palettes and quiet subjects — pieces sized to rest
                  above your headboard or anchor a reading corner, so the room feels
                  finished, not just decorated.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#bedroom-collection"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    Shop Bedroom Paintings
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/custom-order"
                    className="inline-flex w-full items-center justify-center rounded-md border border-white/60 bg-transparent px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto md:text-[18px]"
                  >
                    Commission a Custom Piece
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: About */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                About Bedroom Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                Art That Makes a Bedroom Feel Like a Retreat
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                A bedroom is the one room meant purely for rest, so the art on its walls
                should lower the temperature of the space, not raise it. At Artace
                Studio, our bedroom picks lean toward soft blues, warm neutrals, and
                gentle gold — palettes proven to calm rather than energize.
              </p>
              <p>
                Every piece is hand-painted in acrylic on premium canvas, so even a
                quiet, minimal composition carries visible texture and depth up close —
                nothing about it reads as a mass-printed poster.
              </p>
              <p>
                Most homeowners hang bedroom art directly above the headboard or
                centered on the wall facing the bed. We&apos;re happy to help you choose a
                size that fills the wall correctly for your specific bed frame — just
                message us with your dimensions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Styling tips */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Styling Tips
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[38px] md:mt-4 md:text-[46px]">
                Choosing the Right Piece for Your Bedroom
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-14">
              {bedroomTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`bedroom-tip-${index}`}
                    className="rounded-[16px] border border-black/8 bg-white p-6 md:p-8"
                  >
                    <div className="mb-5 inline-flex rounded-[12px] bg-[#f4f2ee] p-3 md:mb-6">
                      <Icon className="h-6 w-6 text-[#1f1f1f]" />
                    </div>
                    <h3 className="font-display text-[19px] font-semibold leading-[1.2] text-[#1f1f1f] md:text-[21px]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-[#5b5b5b] md:text-[16px]">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Product grid */}
        <section id="bedroom-collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 md:mb-12">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Curated Collection
              </p>
              <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-[#1f1f1f] sm:text-[36px] md:mt-3 md:text-[44px]">
                Shop Bedroom Paintings
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                Hand-painted pieces chosen for calm, restful spaces.
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
                {products.map((product) => (
                  <article key={product.id} className="group relative flex flex-col">
                    <Link
                      href={`/shop/${product.slug}`}
                      aria-label={`View ${product.name}`}
                      className="absolute inset-0 z-10"
                    />

                    <div className="relative z-0">
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
                        <Image
                          src={product.image || FALLBACK_PRODUCT_IMAGE}
                          alt={product.imageAlt || product.name}
                          fill
                          sizes="(max-width: 767px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-display text-[15px] leading-snug text-[#2c2c2c] sm:text-[18px] md:text-[20px]">
                          {product.name}
                        </h3>
                        <p className="text-[14px] text-[#5b5b5b] sm:text-[15px] md:text-[16px]">
                          {product.price !== null
                            ? formatConvertedPrice(product.price, selectedCurrency, exchangeRates)
                            : null}
                        </p>
                      </div>
                    </div>

                    <div className="pointer-events-auto relative z-20 mt-4 translate-y-0 opacity-100 transition-all duration-300 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      <AddToCartButton
                        id={product.id}
                        woocommerceProductId={product.id}
                        title={product.name}
                        image={product.image || FALLBACK_PRODUCT_IMAGE}
                        subtitle="Handmade Bedroom Painting"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No bedroom paintings available at the moment. Check back soon or
                  <Link href="/custom-order" className="text-[#1f1f1f] underline">
                    {" "}
                    commission a custom piece
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <h2 className="font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Give Your Bedroom a Quiet Focal Point
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Explore our curated bedroom picks, or commission a custom piece sized
                  and toned exactly for your room.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#bedroom-collection"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                >
                  Shop the Collection
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/custom-order"
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/60 bg-transparent px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto md:text-[18px]"
                >
                  Commission a Custom Piece
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Trust stats */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {[
                { label: "Handcrafted by", value: "Indian Artists" },
                { label: "Custom Sizing", value: "Available" },
                { label: "Approval", value: "Before It Ships" },
                { label: "Shipping", value: "Across India" },
              ].map((stat, index) => (
                <div key={`bedroom-stat-${index}`} className="text-center">
                  <p className="font-display text-[24px] font-semibold text-[#1f1f1f] md:text-[32px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[14px] text-[#5b5b5b] md:text-[16px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default BedroomPage;
