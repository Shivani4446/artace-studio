import type { Metadata } from "next";
import { Suspense } from "react";
import LoginPageShell from "@/components/auth/LoginPageShell";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Login | Artace Studio",
  description: "Log in to your Artace Studio account.",
  alternates: {
    canonical: buildSiteUrl("/login"),
  },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageShell />
    </Suspense>
  );
}
