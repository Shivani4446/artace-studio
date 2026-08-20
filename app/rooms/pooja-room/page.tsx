import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Heart, Ruler, Compass, Palette } from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { fetchProductsBySlugs } from "@/lib/rooms";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Pooja Room Paintings Online India | Deity Selection & Placement Guide | Artace Studio",
  description:
    "Shop hand-painted pooja room wall art and get guidance on deity selection, altar-wall sizing, and traditional placement. 100% handmade canvas paintings, custom sizing available.",
  alternates: {
    canonical: "/rooms/pooja-room",
  },
  openGraph: {
    title: "Pooja Room Paintings Online India | Deity Selection & Placement Guide | Artace Studio",
    description:
      "Shop hand-painted pooja room wall art and get guidance on deity selection, altar-wall sizing, and traditional placement.",
    url: "/rooms/pooja-room",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/images/pooja-room.jpeg"),
        width: 1408,
        height: 768,
        alt: "Pooja room altar with devotional wall art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pooja Room Paintings Online India | Deity Selection & Placement Guide",
    description: "Shop hand-painted pooja room wall art online in India, chosen by deity, size, and direction.",
    images: [buildSiteUrl("/images/pooja-room.jpeg")],
  },
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const POOJA_ROOM_PRODUCT_SLUGS = [
  "ekdantaya-ganesha",
  "classic-ganesha-canvas-painting-india-modern-om-calligraphy-wall-art-in-grey-gold-devotional-contemporary-art-for-indian-home-decor-aratce-studio",
  "baasuri-ganesha-canvas-painting",
  "dagdusheth-ganapati-canvas-painting",
  "shiv-ganesh-canvas-painting-abhisheka",
  "handmade-lord-vitthal-canvas-painting-contemporary-vithoba-wall-art-art-ace-studio",
  "shri-krishna-canvas-painting-india",
  "multipiece-ganesha-1",
  "complete-focus-canvas-paintings",
  "golden-buddha-canvas-painting",
] as const;

const poojaRoomTips = [
  {
    icon: Heart,
    title: "Choose by Ishta Devata",
    description:
      "Pick the deity central to your family's practice rather than what's trending — a pooja room painting is lived with daily, so personal meaning matters most.",
  },
  {
    icon: Ruler,
    title: "Size to the Altar, Not the Wall",
    description:
      "Match the painting's width to your altar shelf or mandir unit, not the full wall — this keeps the space feeling proportioned rather than crowded.",
  },
  {
    icon: Compass,
    title: "Mind the Traditional Direction",
    description:
      "Many households place devotional art on the East or Northeast wall, believed to be the most auspicious direction for a pooja room.",
  },
  {
    icon: Palette,
    title: "Keep the Palette Serene",
    description:
      "Gold, white, and soft warm tones are traditional choices that suit the quiet, reverent mood of a pooja room.",
  },
];

const PoojaRoomPage = async () => {
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(cookieStore.get(CURRENCY_COOKIE_NAME)?.value);
  const exchangeRates = await getExchangeRates();

  const products = await fetchProductsBySlugs(POOJA_ROOM_PRODUCT_SLUGS);

  const poojaRoomSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${buildSiteUrl("/rooms/pooja-room")}#webpage`,
        url: buildSiteUrl("/rooms/pooja-room"),
        name: "Pooja Room Paintings | Deity Selection & Placement Guide",
        description:
          "Shop hand-painted pooja room wall art and get guidance on deity selection, altar-wall sizing, and traditional placement.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${buildSiteUrl("/rooms/pooja-room")}#itemlist`,
        url: buildSiteUrl("/rooms/pooja-room"),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(poojaRoomSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-black">
          <div className="relative h-[75vh] min-h-[520px] w-full md:h-[85vh] md:min-h-[620px]">
            <Image
              src="/images/pooja-room.jpeg"
              alt="Pooja room altar with devotional wall art"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-14 md:items-center md:px-12 md:pb-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[16px] font-medium uppercase tracking-[0.08em] text-white/80 md:text-[18px]">
                  Devotional Art, Chosen With Care
                </p>
                <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:mt-5 md:text-[56px]">
                  Pooja Room Paintings
                </h1>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px]">
                  A buying guide and curated collection for your home altar — hand-painted
                  devotional canvases chosen by deity, direction, and size, so your pooja
                  room feels complete and sacred.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#pooja-room-collection"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    Shop Pooja Room Paintings
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
                About Pooja Room Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                A Buying Guide for Your Pooja Room Wall
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                Choosing art for a pooja room is different from any other room in the
                house — the painting isn&apos;t just décor, it&apos;s part of daily ritual.
                This guide covers the three decisions that matter most: which deity, what
                size, and where to place it.
              </p>
              <p>
                <strong className="text-[#1f1f1f]">Deity selection</strong> usually starts
                with your family&apos;s ishta devata (chosen deity) or the deity most
                central to your household&apos;s practice — Ganapati for new beginnings,
                Krishna or Vitthal for devotion, Buddha for meditation-focused spaces.
                There&apos;s no wrong answer; it should reflect what your family already
                prays to.
              </p>
              <p>
                <strong className="text-[#1f1f1f]">Altar-wall sizing</strong> matters more
                here than in any other room, since pooja rooms are often the smallest
                space in the home. A painting that&apos;s too large overwhelms the altar;
                too small gets lost. As a rule of thumb, size the piece to roughly the
                width of your altar shelf or unit, not the full wall.
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
                Three Decisions That Matter Most
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-14">
              {poojaRoomTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`pooja-room-tip-${index}`}
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
        <section id="pooja-room-collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 md:mb-12">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Curated Collection
              </p>
              <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-[#1f1f1f] sm:text-[36px] md:mt-3 md:text-[44px]">
                Shop Pooja Room Paintings
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                Devotional pieces hand-painted for the altar wall.
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
                        subtitle="Handmade Pooja Room Painting"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No pooja room paintings available at the moment. Check back soon or
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

        {/* Section 5: Vastu collection cross-link */}
        <section className="pb-4 md:pb-6">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <p className="text-[15px] text-[#5b5b5b] md:text-[16px]">
              Looking for Vastu-conscious art for the rest of your home?{" "}
              <Link href="/collections/vastu-paintings" className="text-[#1f1f1f] underline">
                Browse the full Vastu Collection
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Section 6: CTA */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <h2 className="font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Complete Your Pooja Room With the Right Piece
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Explore our curated pooja room picks, or commission a custom piece sized
                  for your altar.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#pooja-room-collection"
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

        {/* Section 7: Trust stats */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {[
                { label: "Handcrafted by", value: "Indian Artists" },
                { label: "Custom Sizing", value: "Available" },
                { label: "Approval", value: "Before It Ships" },
                { label: "Shipping", value: "Across India" },
              ].map((stat, index) => (
                <div key={`pooja-room-stat-${index}`} className="text-center">
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

export default PoojaRoomPage;
