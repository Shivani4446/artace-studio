import { ArrowUpRight, BadgeCheck, CreditCard, LayoutDashboard, Palette } from "lucide-react";
import { ARTIST_DASHBOARD_LINKS, withDashboardUtm } from "@/lib/artists/dashboard";

// Applying, plan choice, payment, artwork publishing and order management all
// live in the Artace artist dashboard (dashboard.artacestudio.com). This
// section replaces the old on-page application form so every applicant goes
// through the one flow that verifies email and takes payment.
const STEPS = [
  {
    icon: Palette,
    title: "Apply with 3 works",
    body: "Share three sample paintings and a few details. Takes about 3 minutes.",
  },
  {
    icon: CreditCard,
    title: "Choose your plan",
    body: "Verify your email, pick Standard or Premium and pay securely.",
  },
  {
    icon: BadgeCheck,
    title: "Get curated",
    body: "Our curators review your samples within 24–48 hours.",
  },
  {
    icon: LayoutDashboard,
    title: "Publish & sell",
    body: "List artworks on artacestudio.com and manage orders and payouts.",
  },
];

export default function SellPaintingsDashboardCta() {
  return (
    <section id="artist-register-form" className="px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1080px] rounded-[24px] bg-[#1f1f1f] px-6 py-10 text-white sm:px-10 md:px-14 md:py-14">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="font-display text-[28px] leading-[1.12] sm:text-[36px] md:text-[44px]">
            Apply to Join Artace Studio
          </h2>
          <p className="mt-3 font-inter text-[15px] leading-7 text-white/75 md:text-[16px]">
            Your application, plan, artworks, orders and payouts all live in one place: the
            Artace artist dashboard.
          </p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-[16px] border border-white/10 bg-white/[0.04] p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <step.icon className="h-5 w-5 text-[#E6C46A]" aria-hidden="true" />
                <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Step {index + 1}
                </span>
              </div>
              <p className="mt-3 font-display text-[18px] leading-snug">{step.title}</p>
              <p className="mt-1.5 font-inter text-[14px] leading-6 text-white/70">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.apply, "footer-apply")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-white px-7 py-3 font-inter text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90 sm:w-auto"
          >
            Start your application
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.signIn, "footer-sign-in")}
            className="inline-flex w-full items-center justify-center rounded-[12px] border border-white/30 px-7 py-3 font-inter text-[15px] font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10 sm:w-auto"
          >
            Artist sign in
          </a>
        </div>
      </div>
    </section>
  );
}
