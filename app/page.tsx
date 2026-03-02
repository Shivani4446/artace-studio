import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
import ShopByArtist from "@/components/homepage/ShopByArtist";
import PromotionalBanner from "@/components/homepage/PromotionalBanner";
import Testimonials from "@/components/homepage/Testimonials";
import JournalSection from "@/components/homepage/JournalSection";
import ArtistInvitation from "@/components/homepage/ArtistInvitation";

const Home = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ShopBestSellers />
      <DiscoverEssentials />
      <ShopByArtist />
      <PromotionalBanner />
      <Testimonials />
      <JournalSection />
      <ArtistInvitation />
    </main>
  );
};

export default Home;
