import type { Metadata } from "next";
import DashboardProfile from "@/components/account/DashboardProfile";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Profile | Artace Studio",
  description: "Manage your Artace Studio profile.",
  alternates: {
    canonical: buildSiteUrl("/dashboard/profile"),
  },
  robots: { index: false, follow: true },
};

export default function DashboardProfilePage() {
  return <DashboardProfile />;
}
