import type { Metadata } from "next";
import DashboardDetails from "@/components/account/DashboardDetails";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account Details | Artace Studio",
  description: "Manage your Artace Studio account details.",
  alternates: {
    canonical: buildSiteUrl("/dashboard/details"),
  },
  robots: { index: false, follow: true },
};

export default function DashboardDetailsPage() {
  return <DashboardDetails />;
}
