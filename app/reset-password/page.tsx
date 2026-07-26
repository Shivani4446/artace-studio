import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordPageShell from "@/components/auth/ResetPasswordPageShell";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reset Password | Artace Studio",
  description: "Reset your Artace Studio account password.",
  alternates: {
    canonical: buildSiteUrl("/reset-password"),
  },
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageShell />
    </Suspense>
  );
}
