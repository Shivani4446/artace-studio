"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

export default function LoginPageShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useAuthSession();
  const callbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/")
      ? callbackUrl
      : "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(safeCallbackUrl);
    }
  }, [router, safeCallbackUrl, status]);

  return (
    <main className="min-h-[100svh] bg-[#fcfaf7] px-4 py-6 sm:px-6 sm:py-8 lg:px-[50px]">
      <div className="mx-auto grid w-full max-w-[1160px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-14">
        <section className="order-2 max-w-[640px] lg:order-1">
          <h1 className="font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[44px]">
            Sign in to continue your checkout.
          </h1>
          <p className="mt-4 text-[16px] leading-[1.75] text-[#5b5b5b] md:text-[18px]">
            Complete your painting purchase, then track the order any time from your dashboard.
          </p>

          <div className="mt-6 grid gap-3 rounded-[22px] border border-black/8 bg-white/70 p-5 backdrop-blur sm:grid-cols-2">
            <div className="rounded-[16px] bg-white px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
              <p className="text-sm font-semibold text-[#1f1f1f]">One account</p>
              <p className="mt-1 text-sm leading-6 text-[#666]">
                Use the same login for your profile, orders, and support.
              </p>
            </div>
            <div className="rounded-[16px] bg-white px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
              <p className="text-sm font-semibold text-[#1f1f1f]">Order tracking</p>
              <p className="mt-1 text-sm leading-6 text-[#666]">
                See status updates without hunting for emails.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-[#6d665d]">
            New customer?{" "}
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`}
              className="font-medium text-[#1f1f1f] underline underline-offset-4"
            >
              Create an account
            </Link>
            .
          </p>
        </section>

        <div className="order-1 lg:order-2">
          <LoginForm callbackUrl={safeCallbackUrl} />
        </div>
      </div>
    </main>
  );
}
