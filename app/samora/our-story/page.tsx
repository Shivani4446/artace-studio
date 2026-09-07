import type { Metadata } from "next";
import SamoraOurStory from "@/components/samora/SamoraOurStory";

export const runtime = "edge";

const TITLE = "Our Story | Samora by Artace Studio";
const DESCRIPTION =
  "Meet Sampadaa Mahalley, the maker behind Samora — sourcing natural materials, working directly with artisans, and personally seeing every handcrafted order through from Pune to your door.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/our-story",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/our-story",
    type: "website",
    images: [{ url: "/sampadaa-mahalley-profile.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const SamoraOurStoryPage = () => {
  return <SamoraOurStory />;
};

export default SamoraOurStoryPage;
