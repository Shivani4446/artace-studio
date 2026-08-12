import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Sun,
  Truck,
  Archive,
  CloudRain,
  Bug,
  Frame,
  Camera,
  Heart,
  ShieldAlert,
} from "lucide-react";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Art Care Guide – How to Clean, Store & Protect Your Paintings | Artace Studio",
  description:
    "How to care for hand-painted artwork in India: cleaning, sunlight, monsoon humidity, pest prevention, and medium-specific tips for canvas, framed photography, and custom portraits.",
  alternates: {
    canonical: buildSiteUrl("/art-care"),
  },
  openGraph: {
    title: "Art Care Guide – How to Clean, Store & Protect Your Paintings | Artace Studio",
    description: "Simple steps to keep your hand-painted artwork looking beautiful for years.",
    url: buildSiteUrl("/art-care"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Care Guide | Artace Studio",
    description: "Simple steps to keep your hand-painted artwork looking beautiful for years.",
  },
};

const GENERAL_CARE = [
  {
    icon: Sparkles,
    title: "Cleaning",
    text: "Dust gently with a soft, dry cloth about once a month. A lightly damp cloth every 6 months removes finer dust. Never use soap, detergents, disinfectants, or solvents — they can damage pigments and varnish.",
  },
  {
    icon: Sun,
    title: "Sunlight & Placement",
    text: "Keep artwork away from direct sunlight and away from walls prone to dampness or leakage. Prolonged UV exposure fades pigments over time.",
  },
  {
    icon: Truck,
    title: "Transport & Handling",
    text: "Hold artwork by the frame edges or stretcher bars, never the painted surface. For larger pieces, two people carrying it is best.",
  },
  {
    icon: Archive,
    title: "Storage",
    text: "Don't leave a painting rolled in its packaging tube long-term — unroll and mount or frame it as soon as you can to avoid surface cracking or creasing.",
  },
];

const CLIMATE_CARE = [
  {
    icon: CloudRain,
    title: "Humidity & Monsoon Care",
    text: "Keep artwork away from exterior or damp-prone walls during humid months. A dehumidifier or silica packs in humid rooms help, and it's worth checking framed backing for trapped moisture periodically.",
  },
  {
    icon: Bug,
    title: "Pest Prevention",
    text: "Keep artwork away from furniture prone to wood-boring insects, inspect frames and backing periodically, and avoid storing pieces in damp basements or attics where pests thrive.",
  },
];

const MEDIUM_CARE = [
  {
    icon: Frame,
    title: "Canvas Paintings",
    text: "Never frame a canvas painting under glass — canvas needs to breathe, and glass traps moisture that can damage the surface over time. For mid-to-large pieces, extra stretcher-bar support helps prevent warping and cracking.",
  },
  {
    icon: Camera,
    title: "Framed Photography & Prints",
    text: "Non-glare, UV-protective glass is best, paired with acid-free mats and backing to prevent yellowing or moisture damage over time.",
  },
  {
    icon: Heart,
    title: "Custom Portraits",
    text: "Follow the same canvas or paper guidance above depending on what your portrait was painted on. Since a portrait is usually a one-off, sentimental piece, a little extra care around placement and handling goes a long way toward keeping it as a lasting heirloom.",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How often should I clean my painting or framed artwork?",
    answer:
      "Dust it gently with a soft, dry cloth about once a month. A lightly damp cloth every 6 months is enough to remove finer dust for most pieces.",
  },
  {
    question: "Can I clean my artwork with water or cleaning products?",
    answer:
      "No — avoid soap, detergents, disinfectants, and solvents, as they can damage pigments and varnish. Use only a dry or lightly damp soft cloth.",
  },
  {
    question: "Where's the best place to hang a painting?",
    answer:
      "Away from direct sunlight and away from walls prone to dampness or leakage. Prolonged UV exposure fades pigments over time.",
  },
  {
    question: "How do I protect artwork during India's monsoon season?",
    answer:
      "Keep it away from exterior or damp-prone walls, use a dehumidifier or silica packs in humid rooms, and check framed backing for trapped moisture periodically.",
  },
  {
    question: "How do I prevent pests from damaging my artwork?",
    answer:
      "Keep artwork away from furniture prone to wood-boring insects, inspect frames and backing periodically, and avoid storing pieces in damp basements or attics where pests thrive.",
  },
  {
    question: "Can canvas paintings be framed under glass?",
    answer:
      "No — canvas needs to breathe. Framing it under glass traps moisture and can damage the surface over time.",
  },
  {
    question: "What's the right glass for framed photography or prints?",
    answer:
      "Non-glare, UV-protective glass, paired with acid-free mats and backing to prevent yellowing or moisture damage over time.",
  },
  {
    question: "How should I transport or move a painting?",
    answer:
      "Hold it by the frame edges or stretcher bars, never the painted surface. For larger pieces, two people carrying it is best.",
  },
  {
    question: "What should I do if my artwork is damaged or shows signs of mold or flaking paint?",
    answer: "Don't attempt a DIY repair — consult a professional art conservator or restorer.",
  },
  {
    question: "How long can I leave a painting rolled in its packaging tube?",
    answer:
      "Not long-term — unroll and mount or frame it as soon as you can to avoid surface cracking or creasing.",
  },
];

const ArtCarePage = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="bg-[#f4f2ee] text-[#1f1f1f]">
        <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto max-w-[860px]">
            <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
              Art Care Guide
            </p>
            <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
              How to Care for Your Hand-Painted Artwork
            </h1>
            <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
              Simple steps to keep your artwork looking beautiful for years to come.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              General Care Basics
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {GENERAL_CARE.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Caring for Art in India&apos;s Climate
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {CLIMATE_CARE.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Care by Medium
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {MEDIUM_CARE.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[900px]">
            <div className="flex flex-col items-center rounded-[16px] border border-[#1f1f1f]/10 bg-white p-8 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-[24px] leading-[1.15] text-[#1f1f1f] md:text-[30px]">
                When to Call a Professional
              </h2>
              <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
                If your artwork is damaged, or shows signs of mold, tears, or flaking paint, don&apos;t
                attempt a DIY repair. Consult a professional art conservator or restorer.
              </p>
            </div>
          </div>
        </section>

        <FAQSection title="Art Care FAQ" items={FAQ_ITEMS} />

        <section className="px-4 py-12 text-center sm:px-6 md:px-12 md:py-16">
          <p className="text-[15px] text-[#595959]">
            Shopping for a new piece?{" "}
            <Link href="/shop" className="font-medium text-[#1f1f1f] underline underline-offset-2">
              Browse the Shop
            </Link>
            {" "}· Commissioning something custom?{" "}
            <Link
              href="/custom-portraits"
              className="font-medium text-[#1f1f1f] underline underline-offset-2"
            >
              Explore Custom Portraits
            </Link>
          </p>
        </section>
      </main>
    </>
  );
};

export default ArtCarePage;
