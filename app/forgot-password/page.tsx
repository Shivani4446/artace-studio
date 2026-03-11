import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="bg-[#fcfaf7] px-4 py-10 sm:px-6 md:px-12 md:py-16 lg:px-[50px]">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="max-w-[640px]">
          <p className="text-[16px] uppercase tracking-[0.08em] text-[#7a7368]">
            Artace Account
          </p>
          <h2 className="mt-4 font-display text-[42px] leading-[1.02] text-[#1f1f1f] md:text-[56px]">
            Recover access without leaving the site.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.75] text-[#5b5b5b] md:text-[19px]">
            This page talks to your WordPress customer account and requests the same
            secure reset email WordPress would normally send from the default login
            screen.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
