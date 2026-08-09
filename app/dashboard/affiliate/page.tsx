import type { Metadata } from "next";
import DashboardAffiliate from "@/components/account/DashboardAffiliate";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate Program | Artace Studio",
  description: "Share your referral link and earn commission on every order it brings in.",
  alternates: {
    canonical: buildSiteUrl("/dashboard/affiliate"),
  },
  robots: { index: false, follow: true },
};

export default function AffiliateDashboardPage() {
  return <DashboardAffiliate />;
}
