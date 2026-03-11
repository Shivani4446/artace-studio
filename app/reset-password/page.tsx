import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const runtime = "edge";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    key?: string;
    login?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const login = typeof params.login === "string" ? params.login : "";
  const resetKey = typeof params.key === "string" ? params.key : "";
  const hasResetParams = Boolean(login && resetKey);

  return (
    <main className="bg-[#fcfaf7] px-4 py-10 sm:px-6 md:px-12 md:py-16 lg:px-[50px]">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="max-w-[640px]">
          <p className="text-[16px] uppercase tracking-[0.08em] text-[#7a7368]">
            Artace Account
          </p>
          <h2 className="mt-4 font-display text-[42px] leading-[1.02] text-[#1f1f1f] md:text-[56px]">
            Finish your WordPress password reset.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.75] text-[#5b5b5b] md:text-[19px]">
            Open the link from your reset email here to set a new password and return
            to your dashboard.
          </p>
        </div>

        {hasResetParams ? (
          <ResetPasswordForm login={login} resetKey={resetKey} />
        ) : (
          <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-8">
            <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
              Invalid Reset Link
            </p>
            <h1 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[42px]">
              Request a fresh password reset email.
            </h1>
            <p className="mt-4 text-[16px] leading-[1.7] text-[#5b5b5b]">
              This page needs the `login` and `key` values from a valid WordPress
              reset link. Request a new email if this link is missing or expired.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex rounded-[10px] bg-[#1f1f1f] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
            >
              Request new link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
