import type { Metadata } from "next";
import DashboardOrders from "@/components/account/DashboardOrders";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Orders | Artace Studio",
  description: "View your Artace Studio order history.",
  alternates: {
    canonical: buildSiteUrl("/dashboard/orders"),
  },
  robots: { index: false, follow: true },
};

export default function OrdersDashboardPage() {
  return <DashboardOrders />;
}
