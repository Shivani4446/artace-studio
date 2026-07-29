import type { Metadata } from "next";
import SamoraCraftCategories from "@/components/samora/SamoraCraftCategories";
import SamoraFAQSection from "@/components/samora/SamoraFAQSection";
import SamoraGiftingBanner from "@/components/samora/SamoraGiftingBanner";
import SamoraHero from "@/components/samora/SamoraHero";
import SamoraProcess from "@/components/samora/SamoraProcess";
import SamoraStory from "@/components/samora/SamoraStory";
import SamoraTrustBar from "@/components/samora/SamoraTrustBar";
import { samoraFaqs, samoraSchema } from "./samora-schema";

const TITLE = "Samora by Artace Studio | Handcrafted Tote Bags, Coasters, Trays & Name Plates";
const DESCRIPTION =
  "Samora is the handcrafted lifestyle sub-brand of Artace Studio. Shop handmade tote bags, tea coasters, trays, and personalized name plates made from natural materials.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const SamoraHomePage = () => {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(samoraSchema) }}
      />
      <SamoraHero />
      <SamoraTrustBar />
      <SamoraCraftCategories />
      <SamoraStory />
      <SamoraProcess />
      <SamoraGiftingBanner />
      <SamoraFAQSection
        id="faq"
        eyebrow="FAQ"
        title="Questions About Samora"
        intro="Everything you need to know about Samora, its handcrafted collection, and how it connects to Artace Studio."
        items={samoraFaqs}
      />
    </main>
  );
};

export default SamoraHomePage;
