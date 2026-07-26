import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, UtensilsCrossed, Compass, Sun, Ruler } from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { fetchProductsBySlugs } from "@/lib/rooms";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Dining Room Paintings Online India | Canvas Wall Art for Dining Spaces | Artace Studio",
  description:
    "Shop hand-painted dining room wall art online in India — warm landscapes, florals, and abstract canvas paintings sized for dining spaces. 100% handmade, custom sizing available.",
  alternates: {
    canonical: "/rooms/dining-room",
  },
  openGraph: {
    title: "Dining Room Paintings Online India | Canvas Wall Art for Dining Spaces | Artace Studio",
    description:
      "Shop hand-painted dining room wall art online in India — warm landscapes, florals, and abstract canvas paintings sized for dining spaces.",
    url: "/rooms/dining-room",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/images/dining-room.jpeg"),
        width: 1402,
        height: 1122,
        alt: "Dining room styled with warm wall art",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dining Room Paintings Online India | Canvas Wall Art for Dining Spaces",
    description: "Shop hand-painted dining room wall art online in India, in warm, inviting tones.",
    images: [buildSiteUrl("/images/dining-room.jpeg")],
  },
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const DINING_ROOM_PRODUCT_SLUGS = [
  "autumn-garden-path-landscape-canvas-painting-india-vibrant-floral-garden-wall-art-in-orange-red-blue-nature-painting-for-indian-home-decor-aratce-studio",
  "beauty-of-landscape",
  "ghats-of-varanasi-canvas-handmade-paint",
  "horse-cart-2-canavs-painting",
  "vibrant-abstract-sunflower",
  "waves-of-fortune-abstract-fish-fantasy",
  "amazing-bird-canvas-painting",
  "a-memory-from-diary",
  "abstract-deer-canvas-wall-art",
] as const;

const diningRoomTips = [
  {
    icon: UtensilsCrossed,
    title: "Match Your Table's Energy",
    description:
      "A rustic wood table pairs naturally with landscapes and folk-art pieces; a modern glass or marble table suits bolder abstract work.",
  },
  {
    icon: Compass,
    title: "Mind the Sightlines",
    description:
      "Choose art visible from the main seats at the table, not just from the doorway — that's where it'll be seen most.",
  },
  {
    icon: Sun,
    title: "Warm Tones Aid Appetite",
    description:
      "Warm oranges, golds, and earthy greens are traditionally associated with comfort and appetite — a natural fit for dining spaces.",
  },
  {
    icon: Ruler,
    title: "Horizontal for Table Walls",
    description:
      "A wide, horizontal composition usually suits the wall behind a dining table better than a tall vertical piece.",
  },
];

const DiningRoomPage = async () => {
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(cookieStore.get(CURRENCY_COOKIE_NAME)?.value);
  const exchangeRates = await getExchangeRates();

  const products = await fetchProductsBySlugs(DINING_ROOM_PRODUCT_SLUGS);

  const diningRoomSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${buildSiteUrl("/rooms/dining-room")}#webpage`,
        url: buildSiteUrl("/rooms/dining-room"),
        name: "Dining Room Paintings | Canvas Wall Art for Dining Spaces",
        description:
          "Shop hand-painted dining room wall art online in India — warm landscapes, florals, and abstract canvas paintings.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${buildSiteUrl("/rooms/dining-room")}#itemlist`,
        url: buildSiteUrl("/rooms/dining-room"),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(diningRoomSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-black">
          <div className="relative h-[75vh] min-h-[520px] w-full md:h-[85vh] md:min-h-[620px]">
            <Image
              src="/images/dining-room.jpeg"
              alt="Dining room styled with warm wall art"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-14 md:items-center md:px-12 md:pb-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[16px] font-medium uppercase tracking-[0.08em] text-white/80 md:text-[18px]">
                  Where Every Gathering Finds Its Backdrop
                </p>
                <h1 className="mt-4 font-display text-[36px] font-semibold leading-[1.08] sm:text-[42px] md:mt-5 md:text-[52px]">
                  Dining Room Paintings
                </h1>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px]">
                  Set the scene for every meal and gathering with warm, inviting canvas
                  art — landscapes, florals, and abstract pieces chosen to complement
                  your table, not compete with it.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#dining-room-collection"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    Shop Dining Room Paintings
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
                About Dining Room Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                Art That Sets the Mood for Every Gathering
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                A dining room is a space for connection — meals, conversation,
                celebrations — so its art should feel warm and inviting rather than
                stark. Our dining room picks lean toward landscapes, gardens, and gently
                abstract pieces in warm, appetite-friendly tones.
              </p>
              <p>
                Every piece is hand-painted on premium canvas, adding real texture to a
                room that&apos;s often otherwise dominated by hard surfaces — table,
                chairs, flooring.
              </p>
              <p>
                Dining rooms usually call for a horizontal orientation matched to the
                length of the table wall, or a striking vertical piece on an adjacent
                accent wall. We can help you pick the right fit for your layout.
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
                Choosing the Right Piece for Your Dining Room
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-14">
              {diningRoomTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`dining-room-tip-${index}`}
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
        <section id="dining-room-collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 md:mb-12">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Curated Collection
              </p>
              <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-[#1f1f1f] sm:text-[36px] md:mt-3 md:text-[44px]">
                Shop Dining Room Paintings
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                Warm, hand-painted pieces chosen to complement every gathering.
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
                        subtitle="Handmade Dining Room Painting"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No dining room paintings available at the moment. Check back soon or
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
                  Set the Scene for Your Next Gathering
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Explore our curated dining room picks, or commission a custom piece
                  sized for your table wall.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#dining-room-collection"
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
                <div key={`dining-room-stat-${index}`} className="text-center">
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

export default DiningRoomPage;
