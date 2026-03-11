"use client";

import { useEffect, useState } from "react";
import AccountDetailsForm from "@/components/account/AccountDetailsForm";
import type { WordPressProfile } from "@/utils/wordpress-auth";

export default function DashboardDetails() {
  const [profile, setProfile] = useState<WordPressProfile | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      const response = await fetch("/api/account/profile", {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        message?: string;
        profile?: WordPressProfile;
      };

      if (!isActive) {
        return;
      }

      if (!response.ok || !payload.profile) {
        setError(payload.message || "We couldn't load your editable details.");
        setIsLoading(false);
        return;
      }

      setProfile(payload.profile);
      setIsLoading(false);
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-[18px] border border-black/8 bg-white p-6 md:p-8">
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Profile Details
        </p>
        <h2 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f]">
          Loading your details...
        </h2>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-[18px] border border-black/8 bg-white p-6 md:p-8">
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Profile Details
        </p>
        <h2 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f]">
          We couldn&apos;t load your editable details.
        </h2>
        <p className="mt-4 max-w-[720px] text-[16px] leading-[1.75] text-[#5b5b5b]">
          {error ||
            "Your account is signed in, but WordPress did not return a profile record for editing. Please try again shortly or contact support if the issue continues."}
        </p>
      </section>
    );
  }

  return <AccountDetailsForm profile={profile} />;
}
