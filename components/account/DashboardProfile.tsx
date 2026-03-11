"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import type { WordPressProfile } from "@/utils/wordpress-auth";

export default function DashboardProfile() {
  const { session } = useAuthSession();
  const [profile, setProfile] = useState<WordPressProfile | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      const response = await fetch("/api/account/profile", {
        cache: "no-store",
      });

      if (!response.ok || !isActive) {
        return;
      }

      const payload = (await response.json()) as { profile?: WordPressProfile };
      if (isActive) {
        setProfile(payload.profile || null);
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="rounded-[18px] border border-black/8 bg-white p-6 md:p-8">
      <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">Profile</p>
      <h2 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f]">
        Your WordPress account at a glance.
      </h2>
      <p className="mt-4 max-w-[760px] text-[16px] leading-[1.75] text-[#5b5b5b]">
        Review the personal details currently attached to your Artace account before
        you edit them or place another order.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Display Name</p>
          <p className="mt-2 text-[18px] font-medium text-[#1f1f1f]">
            {profile?.displayName || profile?.name || session?.user?.name || "Not set"}
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Email</p>
          <p className="mt-2 break-words text-[18px] font-medium text-[#1f1f1f]">
            {profile?.email || session?.user?.email || "Not available"}
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Username</p>
          <p className="mt-2 text-[18px] font-medium text-[#1f1f1f]">
            {profile?.username || session?.user?.username || "Not available"}
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">First Name</p>
          <p className="mt-2 text-[18px] font-medium text-[#1f1f1f]">
            {profile?.firstName || "Not set"}
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Last Name</p>
          <p className="mt-2 text-[18px] font-medium text-[#1f1f1f]">
            {profile?.lastName || "Not set"}
          </p>
        </article>

        <article className="rounded-[14px] bg-[#fcfaf7] p-5">
          <p className="text-[14px] text-[#7a7368]">Roles</p>
          <p className="mt-2 text-[18px] font-medium capitalize text-[#1f1f1f]">
            {profile?.roles.length ? profile.roles.join(", ") : "Customer"}
          </p>
        </article>
      </div>

      <div className="mt-8 rounded-[14px] border border-black/8 bg-[#faf8f4] p-5 md:p-6">
        <h3 className="font-display text-[26px] leading-[1.08] text-[#1f1f1f]">
          Account note
        </h3>
        <p className="mt-3 max-w-[720px] text-[15px] leading-[1.7] text-[#5b5b5b]">
          Your dashboard reads directly from the WordPress customer profile tied to the
          JWT login. Updates made in details are reflected in future sessions and
          support requests.
        </p>
      </div>
    </section>
  );
}
