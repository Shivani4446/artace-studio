import type { Metadata } from "next";
import SellPaintingsHero from "@/components/sell-paintings/SellPaintingsHero";
import SellPaintingsDashboardGuide from "@/components/sell-paintings/SellPaintingsDashboardGuide";
import SellPaintingsHighlights from "@/components/sell-paintings/SellPaintingsHighlights";
import SellPaintingsComparison from "@/components/sell-paintings/SellPaintingsComparison";
import SellPaintingsBenefits from "@/components/sell-paintings/SellPaintingsBenefits";
import SellPaintingsProcess from "@/components/sell-paintings/SellPaintingsProcess";
import SellPaintingsCalculator from "@/components/sell-paintings/SellPaintingsCalculator";
import SellPaintingsPlans from "@/components/sell-paintings/SellPaintingsPlans";
import SellPaintingsStandards from "@/components/sell-paintings/SellPaintingsStandards";
import SellPaintingsDashboardCta from "@/components/sell-paintings/SellPaintingsDashboardCta";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sell Paintings Online in India | Artist Partnership & Registration | Artace Studio",
  description:
    "Sell your original handmade paintings online with Artace Studio. Enjoy a flat 30% commission (keep 70%), flexible 3-month, 6-month and yearly artist plans from ₹999/year, and your own artist dashboard.",
  keywords: [
    "sell paintings online india",
    "sell art online india",
    "online art gallery artist registration",
    "sell original canvas paintings",
    "art marketplace india",
    "sell handmade art online",
    "artace studio artist",
  ],
  alternates: {
    canonical: buildSiteUrl("/sell-paintings"),
  },
  openGraph: {
    title: "Sell Your Paintings Online with Artace Studio | Artist-First Gallery",
    description:
      "Keep 70% of every sale with a flat 30% commission. Artist plans from ₹999/yr, fast payouts, and direct collector recognition. Apply in 5 minutes.",
    url: buildSiteUrl("/sell-paintings"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Your Paintings Online with Artace Studio | Artist-First Gallery",
    description:
      "Join India's premier handcrafted art community. Flat 30% commission, flexible artist plans, an artist dashboard for orders and payouts, and dedicated artist promotion.",
  },
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What commission does Artace Studio charge to sell paintings?",
    answer:
      "Artace Studio charges a transparent, artist-first commission of 30% when an order is completed. You keep 70% of your listing price — no paywalls, no hidden deductions.",
  },
  {
    question: "Are there any registration or listing fees for artists?",
    answer:
      "Getting started requires an artist plan, billed every 3 months, 6 months or yearly. Standard is ₹349 for 3 months, ₹599 for 6 months or ₹999 a year; Premium is ₹649, ₹1,149 or ₹1,899 a year (all plus 18% GST). The yearly plan saves up to 28%. There are no additional listing, profile, or promotion fees, and the only deduction on a sale is the flat 30% commission.",
  },
  {
    question: "What is the difference between the Standard and Premium artist plans?",
    answer:
      "Both plans include a verified artist profile and unlimited original artwork listings at a flat 30% commission (you keep 70%). Premium (from ₹1,899/year) adds curation within 24 hours instead of 48, payouts you can request any time, featured and banner placement across our storefront, digital print uploads and sales of your originals, and dedicated artist support.",
  },
  {
    question: "How and when do artists receive payment for sold paintings?",
    answer:
      "Payments go directly into your verified bank account after the customer delivery and inspection window. Standard artists are paid monthly; Premium artists can request a payout any time from their artist dashboard.",
  },
  {
    question: "Do I need a formal degree in Fine Arts (BFA/MFA) to sell here?",
    answer:
      "No. We evaluate your work based on technical mastery, depth, composition, and authenticity — not your academic pedigree. Self-taught artists with strong original portfolios are warmly welcomed.",
  },
  {
    question: "How does shipping to Pune work? Who pays for courier charges?",
    answer:
      "Once an artwork sells, roll and pack it securely into a protective PVC tube. Insured delivery to our Pune facility is arranged by the artist, and these courier charges are the artist's responsibility. After your artwork reaches us, we handle inspection, customer delivery, and everything that follows.",
  },
  {
    question: "Can I sell my paintings in exhibitions or other sites while listed on Artace Studio?",
    answer:
      "Absolutely. Artace Studio operates under a non-exclusive partnership model. You retain 100% ownership and copyright of your art. If an original piece is sold elsewhere, simply update your artist dashboard within 24 hours.",
  },
  {
    question: "Why does Artace Studio prefer rolled canvas over framed art?",
    answer:
      "Framed art carries high transit risk, heavy volumetric courier charges, and frequent glass breakage. Shipping original canvas rolled safely inside high-density PVC tubes prevents damage and allows collectors to choose framing tailored to their home interior.",
  },
  {
    question: "How does Artace Studio promote my artwork?",
    answer:
      "We invest heavily in paid Google Search, Instagram, Pinterest, architectural trade networks, and direct consultations with interior designers across metro cities in India and overseas. We also feature curated artist stories in our newsletter and social channels.",
  },
  {
    question: "What is the return policy for customers and how does it affect me?",
    answer:
      "Artace Studio has a curated 7-day transit inspection policy. Because our curators pre-verify accurate high-resolution photography before listing, returns are rare. In the unlikely event of an approved return, the artwork is inspected and returned to you in pristine condition without penal fees.",
  },
];

const SellPaintingsPage = () => {
  const faqSchema = {
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

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: buildSiteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sell Paintings",
        item: buildSiteUrl("/sell-paintings"),
      },
    ],
  };

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, faqSchema],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      <main className="bg-[#f4f2ee] text-[#1f1f1f]">
        <SellPaintingsHero />
        <SellPaintingsDashboardGuide />
        <SellPaintingsHighlights />
        <SellPaintingsComparison />
        <SellPaintingsBenefits />
        <SellPaintingsProcess />
        <SellPaintingsCalculator />
        <SellPaintingsPlans />
        <SellPaintingsStandards />

        <FAQSection title="Artist FAQs" items={FAQ_ITEMS} />

        <SellPaintingsDashboardCta />
      </main>
    </>
  );
};

export default SellPaintingsPage;