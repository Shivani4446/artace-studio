import type { Metadata } from "next";
import SamoraWishlistClient from "@/components/samora/SamoraWishlistClient";

export const runtime = "edge";

const TITLE = "Wishlist | Samora by Artace Studio";
const DESCRIPTION = "Your saved handcrafted tote bags, tea coasters, trays, and name plates from Samora.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/wishlist",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const SamoraWishlistPage = () => {
  return <SamoraWishlistClient />;
};

export default SamoraWishlistPage;
