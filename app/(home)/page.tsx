import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/homepage/HeroSection";
import TrustBar from "@/components/homepage/TrustBar";
import ArtaceJourney from "@/components/homepage/ArtaceJourney";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import ShopByRoom from "@/components/homepage/ShopByRoom";
import ShopByPrice from "@/components/homepage/ShopByPrice";
import ShopByArtist from "@/components/homepage/ShopByArtist";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
import TrueArtistrySection from "@/components/homepage/TrueArtistrySection";
import AboutUsPanel from "@/components/homepage/AboutUsPanel";
import Testimonials from "@/components/homepage/Testimonials";
import DesignTogetherPanel from "@/components/homepage/DesignTogetherPanel";
import SamoraSpotlight from "@/components/homepage/SamoraSpotlight";
import ArtistInvitation from "@/components/homepage/ArtistInvitation";
import FAQSection from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";
import { homepageFaqs, homepageSchema } from "./homepage-schema";

export const metadata: Metadata = {
  title: "Handcrafted Canvas Paintings in India | Artace Studio",
  description:
    "Buy handcrafted canvas paintings online in India, including spiritual wall art, abstract canvases, and custom-made commissions for homes, offices, and gifting.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Handcrafted Canvas Paintings in India | Artace Studio",
    description:
      "Shop handcrafted canvas paintings online in India, from spiritual and abstract art to custom commissions designed for your space.",
    url: "/",
    images: [
      {
        url: buildSiteUrl("/artace-studio-home-page-og-image.webp"),
        width: 1200,
        height: 630,
        alt: "Handcrafted canvas paintings from Artace Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Canvas Paintings in India | Artace Studio",
    description:
      "Discover original wall art, spiritual paintings, and custom canvas commissions from Artace Studio.",
    images: [buildSiteUrl("/artace-studio-home-page-og-image.webp")],
  },
};

const Home = async () => {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <HeroSection />
      <TrustBar />
      <ShopBestSellers />
      <ArtaceJourney />
      <ShopByRoom />
      <ShopByPrice />
      <ShopByArtist />
      <DiscoverEssentials />
      <TrueArtistrySection />
      <AboutUsPanel />
      <Testimonials />
      <DesignTogetherPanel />
      <SamoraSpotlight />
      <FAQSection
        id="homepage-faqs"
        eyebrow="Buyer Questions"
        title="Questions Buyers Ask Before Ordering Handmade Art"
        intro="These answers help search engines and AI assistants understand what Artace Studio offers, while giving buyers the practical detail they need before placing an order."
        items={[...homepageFaqs]}
      />
      <ArtistInvitation />
    </main>
  );
};

export default Home;
