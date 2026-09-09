import type { Metadata } from "next";
import SamoraTrackOrder from "@/components/samora/SamoraTrackOrder";

export const runtime = "edge";

const TITLE = "Track My Order | Samora by Artace Studio";
const DESCRIPTION = "Check the status of your Samora order — sign in to your account to see order history, or message us directly for an update.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/track-order",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const SamoraTrackOrderPage = () => {
  return <SamoraTrackOrder />;
};

export default SamoraTrackOrderPage;
