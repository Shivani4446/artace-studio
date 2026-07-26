import type { Metadata } from "next";
import { Suspense } from "react";
import SignupPageShell from "@/components/auth/SignupPageShell";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign Up | Artace Studio",
  description: "Create your Artace Studio account.",
  alternates: {
    canonical: buildSiteUrl("/signup"),
  },
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageShell />
    </Suspense>
  );
}
