import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Palette,
  Ruler,
  Layers,
  Sparkles,
  Truck,
} from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Original Paintings For Sale Online | Shipped to Ireland | Artace Studio",
  description:
    "Shop original, hand-painted paintings online — shipped to Ireland. Real canvas texture and brushwork, never printed. Custom sizing and commissioned pieces available.",
  alternates: {
    canonical: "/original-paintings-for-sale-ireland",
  },
  openGraph: {
    title: "Original Paintings For Sale Online | Shipped to Ireland | Artace Studio",
    description:
      "Shop original, hand-painted paintings online — shipped to Ireland. Real canvas texture and brushwork, never printed.",
    url: "/original-paintings-for-sale-ireland",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/hero-bg.webp"),
        width: 2160,
        height: 1215,
        alt: "Original hand-painted canvas art by Artace Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Paintings For Sale Online | Shipped to Ireland",
    description: "Shop original, hand-painted paintings online, shipped to Ireland.",
    images: [buildSiteUrl("/hero-bg.webp")],
  },
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const STOREFRONT_REVALIDATE_SECONDS = 60;

const IRELAND_PRODUCT_SLUGS = [
  "water-lily-canvas-painting",
  "golden-buddha-canvas-painting",
  "abstract-city-view",
  "axis-of-gold-balance-canvas-art",
  "radha-krishna-canvas-painting-bansuri",
  "waves-of-fortune-abstract-fish-fantasy",
  "sunset-beauty-canavs-painting",
  "beauty-of-landscape",
  "ghats-of-varanasi-canvas-handmade-paint",
  "white-buddha-canvas-painting",
  "multi-color-buddha-canvas-painting",
  "dagdusheth-ganapati-canvas-painting",
] as const;

type WooStorePrices = {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
};

type WooStoreImage = {
  id: number;
  src: string;
  alt?: string;
  name?: string;
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  prices: WooStorePrices;
};

type IrelandProductCard = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  currencyCode: string;
  currencySymbol: string;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchIrelandProducts = async (): Promise<IrelandProductCard[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?slug=${IRELAND_PRODUCT_SLUGS.join(",")}&per_page=${IRELAND_PRODUCT_SLUGS.length}`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(products)) return [];

    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return IRELAND_PRODUCT_SLUGS.map((slug) => bySlug.get(slug))
      .filter((product): product is WooStoreProduct => Boolean(product))
      .map((product) => {
        const minorUnit = product.prices?.currency_minor_unit ?? 2;
        const numericPrice = product.prices?.price
          ? Number(product.prices.price) / 10 ** minorUnit
          : null;

        return {
          id: product.id,
          slug: product.slug,
          name: decodeHtmlEntities(product.name),
          image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
          imageAlt: decodeHtmlEntities(
            product.images?.[0]?.alt || product.images?.[0]?.name || product.name
          ),
          price: numericPrice,
          currencyCode: product.prices?.currency_code || "INR",
          currencySymbol: product.prices?.currency_symbol || "Rs. ",
        };
      });
  } catch {
    return [];
  }
};

const buyingGuideTips = [
  {
    icon: Palette,
    title: "Start With Your Palette",
    description:
      "Look at the colors already in your room — your sofa, your walls, your flooring — and choose a piece that complements or intentionally contrasts with them.",
  },
  {
    icon: Ruler,
    title: "Size for the Wall, Not the Room",
    description:
      "Measure the specific wall the piece will hang on. As a rough guide, aim for artwork that covers roughly two-thirds of the available wall width above a sofa, console, or bed.",
  },
  {
    icon: Layers,
    title: "Match the Subject to the Room",
    description:
      "Calming landscapes and meditative pieces suit bedrooms and reading corners; bold, colorful compositions suit living rooms and entryways where energy and conversation happen.",
  },
  {
    icon: Sparkles,
    title: "Choose What You Keep Coming Back To",
    description:
      "The right piece is usually the one you find yourself looking at again after the first glance — trust that instinct over trends.",
  },
];

const collectorTestimonials = [
  {
    id: "review-1",
    authorName: "24Bites",
    location: "Pune, India",
    rating: 5,
    text: "Purchased 2 canvas paintings of Radha Krishna and Mahadev. The quality they offer is so good and all the packaging is very neatly done with goodies also. Definitely suggesting if want canvas painting in Pune.",
  },
  {
    id: "review-5",
    authorName: "Akshay Chaudhari",
    location: "Parbhani, India",
    rating: 4.5,
    text: "Purchased an ancient canvas painting of Madhavrao Peshwe Darbar and loved the details and accuracy of each character",
  },
  {
    id: "review-6",
    authorName: "Shreyas Bangale",
    location: "Texas, USA",
    rating: 4.9,
    text: "Purchased 2 paintings one form the gallery and second I customized on my own preference. Thank You Artace Studio.",
  },
];

const irelandFaqs: FAQItem[] = [
  {
    question: "Do you ship original paintings to Ireland?",
    answer:
      "Yes. Every original painting in this collection ships from our studio in India to addresses across Ireland. Framed pieces travel in protective casing; unframed canvases are rolled and shipped in a durable tube.",
  },
  {
    question: "How long does delivery to Ireland take?",
    answer:
      "Delivery time depends on the piece and your specific location. We'll confirm an estimated delivery window once your order is placed.",
  },
  {
    question: "Will I have to pay customs duty or import VAT?",
    answer:
      "The price shown at checkout covers the artwork itself. Any Irish or EU customs duty or import VAT is assessed separately and is the customer's responsibility to pay on delivery.",
  },
  {
    question: "Can I return a painting if it's not right for my space?",
    answer:
      "Stock pieces can be returned within 7 days of delivery if unused and in original packaging — return shipping is the customer's responsibility. Custom commissions can't be returned, since they're made specifically for you, unless there's a confirmed quality issue on our side. Full details are on our Return Policy page.",
  },
  {
    question: "Are these real hand-painted originals, or prints?",
    answer:
      "Every piece is 100% hand-painted in acrylic on canvas by our artists — never a printed reproduction. Because each one is made by hand, small variations in brushwork and color are part of the piece, not a flaw.",
  },
  {
    question: "Can I commission a custom painting instead?",
    answer:
      "Yes. Tell us your preferred size, palette, and composition, and our artists will create a one-of-a-kind piece for your space — we'll share progress photos before it ships.",
  },
  {
    question: "What if I'm not sure which piece is right for my space?",
    answer:
      "Message us with a photo of your wall and the colors already in the room, and we'll help you shortlist pieces that fit — free of charge.",
  },
];

const getStarCount = (rating: number) => {
  const rounded = Math.round(rating);
  if (rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded;
};

const IrelandLandingPage = async () => {
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(cookieStore.get(CURRENCY_COOKIE_NAME)?.value);
  const exchangeRates = await getExchangeRates();

  const products = await fetchIrelandProducts();

  const pageUrl = buildSiteUrl("/original-paintings-for-sale-ireland");

  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Original Paintings For Sale Online | Shipped to Ireland",
        description:
          "Shop original, hand-painted paintings online — shipped to Ireland. Real canvas texture and brushwork, never printed.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        url: pageUrl,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 6).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSiteUrl(`/shop/${product.slug}`),
          name: product.name,
          image: toAbsoluteImageUrl(product.image),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: irelandFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-black">
          <div className="relative h-[80vh] min-h-[560px] w-full md:h-[88vh] md:min-h-[640px]">
            <Image
              src="/hero-bg.webp"
              alt="Original hand-painted canvas art by Artace Studio"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-14 md:items-center md:px-12 md:pb-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[16px] font-medium uppercase tracking-[0.08em] text-white/80 md:text-[18px]">
                  Hand-Painted, Shipped to Ireland
                </p>
                <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:mt-5 md:text-[56px]">
                  Original Paintings For Sale
                </h1>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px]">
                  Discover original, hand-painted canvas art — real texture, real
                  brushwork, and a story behind every piece — shipped directly from our
                  studio in India to your home in Ireland.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#collection"
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
          </div>
        </section>

        {/* Section 2: Why Original, Hand-Painted Art */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Why Original Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                The Difference Between Original Art and a Print
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                A print reproduces an image. An original painting is the image — every
                brushstroke, every layer of texture, every decision the artist made
                while the paint was still wet. When you buy an original painting from
                Artace Studio, you&apos;re buying a piece that exists nowhere else.
              </p>
              <p>
                Each canvas is individually hand-painted in acrylic by our artists,
                built up in real layers with visible texture you can only get from
                paint applied by hand — something no giclée print or mass-produced
                canvas wrap can replicate.
              </p>
              <p>
                That&apos;s also why no two pieces are ever perfectly identical, even
                within the same series. Small variations in brushwork and color are
                part of what makes an original painting worth owning.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How to Choose Original Art for Your Home */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Buying Guide
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[38px] md:mt-4 md:text-[46px]">
                Choosing Original Art for Your Home
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-14">
              {buyingGuideTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`buying-guide-tip-${index}`}
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

        {/* Section 4: Shop the Collection */}
        <section id="collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 md:mb-12">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Curated Collection
              </p>
              <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-[#1f1f1f] sm:text-[36px] md:mt-3 md:text-[44px]">
                Shop the Collection
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                Original, hand-painted canvases across landscapes, abstract, and
                spiritual art — ready to ship to Ireland.
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
                        subtitle="Original Hand-Painted Artwork"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No paintings available at the moment. Check back soon or
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

        {/* Section 5: What Collectors Say */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Real Reviews
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[38px] md:mt-4 md:text-[46px]">
                What Collectors Say
              </h2>
              <p className="mt-4 text-[16px] leading-[1.6] text-[#5b5b5b] md:text-[18px]">
                Real reviews from Artace Studio collectors around the world.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
              {collectorTestimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="flex h-full flex-col rounded-[12px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={`${testimonial.id}-star-${index}`}
                        className={
                          index < getStarCount(testimonial.rating)
                            ? "text-[#FFDB4D]"
                            : "text-[#d7d2c8]"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-[15px] leading-7 text-[#3f3a32]">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="mt-auto pt-5">
                    <div className="border-t border-[#1f1f1f]/10 pt-5">
                      <p className="font-semibold text-[#1f1f1f]">{testimonial.authorName}</p>
                      <p className="mt-1 text-sm text-[#7a7368]">{testimonial.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Commission a Custom Piece */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-white/60 md:text-[17px]">
                  Custom Commissions
                </p>
                <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Commission a One-of-a-Kind Piece
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Want a piece sized and toned exactly for your space? Work directly
                  with our artists to commission a custom painting — choose your
                  palette, dimensions, and composition, and we&apos;ll share progress
                  photos at every stage before it ships.
                </p>
              </div>

              <Link
                href="/custom-order"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
              >
                Start Your Commission
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 7: Shipping to Ireland */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Shipping &amp; Delivery
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                Shipping Original Art to Ireland
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                Every piece ships directly from our studio in India, carefully packed —
                framed paintings in protective casing, unframed canvases rolled and
                shipped in a durable tube for safe transit.
              </p>
              <p>
                We ship original art to Ireland on every order. Once your order is
                placed, we&apos;ll confirm an estimated delivery window based on the
                piece and your location.
              </p>
              <p>
                The price you see at checkout covers the artwork and its packaging. Any
                Irish or EU customs duty or import VAT is assessed separately and is
                the customer&apos;s responsibility to pay on delivery.
              </p>
            </div>
            <div className="mx-auto mt-8 flex max-w-[820px] items-center justify-center gap-3 text-[15px] text-[#5b5b5b] md:text-[16px]">
              <Truck className="h-5 w-5 text-[#1f1f1f]" />
              <span>Shipped worldwide, including Ireland</span>
            </div>
          </div>
        </section>

        {/* Section 8: FAQ */}
        <FAQSection
          id="ireland-art-faqs"
          eyebrow="Questions Before You Buy"
          title="Original Art in Ireland: Frequently Asked Questions"
          intro="Everything Irish collectors ask before ordering an original painting from Artace Studio."
          items={irelandFaqs}
        />

        {/* Section 9: Final CTA + trust stats */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <h2 className="font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Bring Original Art Into Your Home
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Shop the collection, or commission a custom piece made exactly for
                  your space.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#collection"
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

        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {[
                { label: "Handcrafted by", value: "Indian Artists" },
                { label: "Custom Sizing", value: "Available" },
                { label: "Approval", value: "Before It Ships" },
                { label: "Ships to", value: "Ireland & Worldwide" },
              ].map((stat, index) => (
                <div key={`ireland-stat-${index}`} className="text-center">
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

export default IrelandLandingPage;
