import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AccountDetailsForm from "@/components/account/AccountDetailsForm";
import { authOptions } from "@/utils/auth";
import { getWordPressProfile } from "@/utils/wordpress-auth";

export default async function DashboardDetailsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/login?callbackUrl=/dashboard/details");
  }

  const profile = await getWordPressProfile(session.accessToken);

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
          Your account is signed in, but WordPress did not return a profile record for
          editing. Please try again shortly or contact support if the issue continues.
        </p>
      </section>
    );
  }

  return <AccountDetailsForm profile={profile} />;
}
