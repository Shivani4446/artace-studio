import type { Metadata } from "next";
import DesignPartnerHero from "@/components/design-partners/DesignPartnerHero";
import DesignPartnerTrustBar from "@/components/design-partners/DesignPartnerTrustBar";
import DesignPartnerGap from "@/components/design-partners/DesignPartnerGap";
import DesignPartnerWhoWeAre from "@/components/design-partners/DesignPartnerWhoWeAre";
import DesignPartnerOffer from "@/components/design-partners/DesignPartnerOffer";
import DesignPartnerProcess from "@/components/design-partners/DesignPartnerProcess";
import DesignPartnerWhyUs from "@/components/design-partners/DesignPartnerWhyUs";
import DesignPartnerPerks from "@/components/design-partners/DesignPartnerPerks";
import DesignPartnerForm from "@/components/design-partners/DesignPartnerForm";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Art Partner Program for Interior Designers | Artace Studio",
  description:
    "Partner with Artace Studio for handcrafted, bespoke canvas art built for your projects. Trade perks, priority turnaround, white-glove delivery.",
  alternates: {
    canonical: buildSiteUrl("/interior-designer-partnership"),
  },
  openGraph: {
    title: "Art Partner Program for Interior Designers | Artace Studio",
    description:
      "Handcrafted, bespoke canvas art built for the projects you design. Become a Design Partner.",
    url: buildSiteUrl("/interior-designer-partnership"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Partner Program for Interior Designers",
    description: "Handcrafted, bespoke canvas art built for the projects you design.",
  },
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Do you offer trade pricing or commission for interior designers?",
    answer:
      "Yes — approved design partners receive trade commission on every referred project, along with priority scheduling.",
  },
  {
    question: "How long does a custom commission take?",
    answer:
      "Timelines depend on scale and complexity, and are confirmed during the Vision Consultation phase so it fits your project schedule.",
  },
  {
    question: "Can the artwork be customized to match a specific room's palette?",
    answer:
      "Yes — every piece goes through a dedicated Palette Confirmation phase, ensuring the final work is built around your interior scheme.",
  },
  {
    question: "Is there a minimum order size to become a partner?",
    answer: "No minimum commitment. We welcome starting with a single project.",
  },
  {
    question: "Do you handle delivery and installation?",
    answer: "Yes — every piece is professionally packaged and delivered white-glove, ready to install.",
  },
  {
    question: "Can I get samples or mood board assets before pitching to a client?",
    answer:
      "Yes — partners get access to our portfolio and collection previews to include directly in client presentations.",
  },
];

const InteriorDesignerPartnershipPage = () => {
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
        <DesignPartnerHero />
        <DesignPartnerTrustBar />
        <DesignPartnerGap />
        <DesignPartnerWhoWeAre />
        <DesignPartnerOffer />
        <DesignPartnerProcess />
        <DesignPartnerWhyUs />
        <DesignPartnerPerks />

        <FAQSection title="Designer FAQs" items={FAQ_ITEMS} />

        <section className="px-4 py-14 sm:px-6 md:px-12 md:py-20">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
              Let&apos;s Build Something Together
            </h2>
            <p className="mt-3 font-inter text-[15px] leading-7 text-[#595959] md:text-[16px]">
              Start with one project — no commitment beyond that.
            </p>
            <div className="mt-8 text-left">
              <DesignPartnerForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default InteriorDesignerPartnershipPage;
