"use client";

import { useEffect } from "react";
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
    <main className="bg-[#fcfaf7] px-4 py-8 sm:px-6 md:px-12 md:py-14 lg:px-[50px]">
      <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="order-2 max-w-[640px] lg:order-1">
          <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368] md:text-[16px]">
            Artace Account
          </p>
          <h2 className="mt-4 font-display text-[36px] leading-[1.04] text-[#1f1f1f] md:text-[56px]">
            Sign in if you already created your account.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.75] text-[#5b5b5b] md:mt-5 md:text-[19px]">
            Returning customers can use their WordPress credentials here. If you are
            new to Artace, create your account first and then log in to track orders,
            review account activity, and manage your dashboard.
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <LoginForm callbackUrl={safeCallbackUrl} />
        </div>
      </div>
    </main>
  );
}
