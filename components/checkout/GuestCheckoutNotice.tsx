"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

// Shown under the email field to signed-out shoppers. Checkout no longer
// requires an account: the order is attached to (or creates) the account for
// this email — see lib/checkout/guest-account.ts.
export default function GuestCheckoutNotice({ callbackPath }: { callbackPath: string }) {
  const { status } = useAuthSession();
  if (status !== "unauthenticated") return null;

  return (
    <p className="flex items-start gap-2 rounded-[10px] bg-[#f5f0e8] px-4 py-3 text-[13px] leading-5 text-[#5f5a52]">
      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#1f1f1f]" aria-hidden="true" />
      <span>
        No account needed. We&apos;ll create one with this email so you can track your order
        and earn rewards.{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackPath)}`}
          className="font-semibold text-[#1f1f1f] underline underline-offset-2"
        >
          Already have an account? Sign in
        </Link>
      </span>
    </p>
  );
}
