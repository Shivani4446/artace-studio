import type { Metadata } from "next";
import DashboardOverview from "@/components/account/DashboardOverview";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Account | Artace Studio",
  description: "View your Artace Studio account overview.",
  alternates: {
    canonical: buildSiteUrl("/dashboard"),
  },
  robots: { index: false, follow: true },
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
