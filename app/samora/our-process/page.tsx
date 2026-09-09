import type { Metadata } from "next";
import SamoraOurProcess from "@/components/samora/SamoraOurProcess";

export const runtime = "edge";

const TITLE = "Our Process | Samora by Artace Studio";
const DESCRIPTION =
  "How every Samora piece is made — from sourcing natural materials to handcrafting, quality checks, and pan-India shipping.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/our-process",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/our-process",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const SamoraOurProcessPage = () => {
  return <SamoraOurProcess />;
};

export default SamoraOurProcessPage;
