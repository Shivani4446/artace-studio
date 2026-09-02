import type { Metadata } from "next";
import CanvasRollsHero from "@/components/canvas-rolls/CanvasRollsHero";
import WhyOurCanvas from "@/components/canvas-rolls/WhyOurCanvas";
import MaterialWeavePriming from "@/components/canvas-rolls/MaterialWeavePriming";
import SizesSupplyFormats from "@/components/canvas-rolls/SizesSupplyFormats";
import DigitalPrintingTeaser from "@/components/canvas-rolls/DigitalPrintingTeaser";
import CanvasRollEnquiryForm from "@/components/canvas-rolls/CanvasRollEnquiryForm";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Fine Art Canvas Rolls – Premium Cotton & Poly-Cotton Canvas | Artace Studio",
  description:
    'Premium fine art canvas rolls — 100% cotton, cotton-poly blend, and linen, double acrylic-gesso primed, 12"-144" widths, 90-600 GSM. Bulk & export supply.',
  alternates: {
    canonical: buildSiteUrl("/canvas-rolls"),
  },
  openGraph: {
    title: "Fine Art Canvas Rolls – Premium Cotton & Poly-Cotton Canvas | Artace Studio",
    description:
      "Double acrylic-gesso primed canvas, supplied by the roll for studios and print houses.",
    url: buildSiteUrl("/canvas-rolls"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Fine Art Canvas Rolls | Artace Studio",
    description: 'Premium cotton, cotton-poly & linen canvas, double primed, 12"-144" widths.',
  },
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What materials are available?",
    answer: "100% Cotton, 65/35 Cotton-Polyester Blend, Linen, and 100% Polyester.",
  },
  {
    question: "What priming do you use?",
    answer:
      "Double Acrylic Gesso as standard — other primer types and coat counts are available on request.",
  },
  {
    question: "What sizes can I order?",
    answer:
      "12″-144″ width, with roll lengths from 5m to 1000m (including jumbo rolls), plus pre-cut yardage from 6 to 100 yards.",
  },
  {
    question: "What colors are available?",
    answer: "White, Off-white, Black, and Linen finish — custom colors are available on sample.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer:
      "No minimum for the fine-art canvas line. The Digital Printing Canvas line has a 10-meter minimum.",
  },
  {
    question: "Do you offer canvas for digital printing?",
    answer:
      "Yes — our Digital Printing Canvas Rolls are compatible with UV, Eco-Solvent, Solvent, Latex, Pigment, and Dye-Sublimation printing.",
  },
  {
    question: "How is the canvas packed and protected for shipping?",
    answer:
      "Tube, poly-wrap, or carbonated-sheet packing, with acid-free, moisture-resistant, or standard protection.",
  },
  {
    question: "Can I get a sample before ordering in bulk?",
    answer:
      "Yes — custom colors and finishes are available on sample request; mention this in your enquiry.",
  },
  {
    question: "How is pricing determined?",
    answer:
      "Pricing starts from ₹120/meter for the fine-art line and depends on material, size, and quantity — submit an enquiry for a quote.",
  },
  {
    question: "Do you supply outside India?",
    answer: "Yes — manufactured in India for both domestic and export supply.",
  },
];

const CanvasRollsPage = () => {
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
        <CanvasRollsHero />
        <WhyOurCanvas />
        <MaterialWeavePriming />
        <SizesSupplyFormats />
        <DigitalPrintingTeaser />

        <FAQSection title="Canvas Roll FAQs" items={FAQ_ITEMS} />

        <section className="px-4 py-14 sm:px-6 md:px-12 md:py-20">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px]">
              Request Pricing & Samples
            </h2>
            <p className="mt-3 font-inter text-[15px] leading-7 text-[#595959] md:text-[16px]">
              Tell us what you need — we&apos;ll follow up with pricing, lead times, and
              sample availability.
            </p>
            <div className="mt-8 text-left">
              <CanvasRollEnquiryForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default CanvasRollsPage;
