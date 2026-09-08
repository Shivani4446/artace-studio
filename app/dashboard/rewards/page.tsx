import type { Metadata } from "next";
import DashboardRewards from "@/components/account/DashboardRewards";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Artace Rewards | Artace Studio",
  description: "Check your Artace Rewards points balance and history.",
  alternates: {
    canonical: buildSiteUrl("/dashboard/rewards"),
  },
  robots: { index: false, follow: true },
};

export default function RewardsDashboardPage() {
  return <DashboardRewards />;
}
