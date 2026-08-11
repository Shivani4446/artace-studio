import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { User, Heart, Users, Baby, Palette, Award, Sparkles, ClipboardCheck } from "lucide-react";
import CustomPortraitForm from "@/components/custom-portraits/CustomPortraitForm";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Custom Portrait Paintings – Hand-Painted From Your Photo | Artace Studio",
  description:
    "Single, Couple, Family & Baby portraits hand-painted from your photo. Get an instant price estimate and pay just 10% to confirm — starting from ₹4,000.",
  alternates: {
    canonical: buildSiteUrl("/custom-portraits"),
  },
  openGraph: {
    title: "Custom Portrait Paintings – Hand-Painted From Your Photo | Artace Studio",
    description: "Get an instant estimate for your custom portrait — pay just 10% to confirm.",
    url: buildSiteUrl("/custom-portraits"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Portrait Paintings – Hand-Painted From Your Photo",
    description: "Single, Couple, Family & Baby portraits — starting from ₹4,000.",
  },
};

const PORTRAIT_SHOWCASE = [
  {
    type: "single",
    icon: User,
    title: "Single Portrait",
    text: "A beautifully hand-painted portrait of one person, in your choice of size.",
    price: 4500,
  },
  {
    type: "couple",
    icon: Heart,
    title: "Couple Portrait",
    text: "Celebrate a couple in a custom hand-painted piece made just for you.",
    price: 5500,
  },
  {
    type: "family",
    icon: Users,
    title: "Family Portrait",
    text: "Bring your whole family together in one timeless hand-painted artwork.",
    price: 6800,
  },
  {
    type: "baby",
    icon: Baby,
    title: "Baby Portrait",
    text: "A soft, keepsake portrait to celebrate your little one.",
    price: 4000,
  },
];

const WHY_HAND_PAINTED = [
  {
    icon: Palette,
    title: "100% Hand-Painted",
    text: "Every portrait is painted by hand on canvas — never printed, never AI-generated.",
  },
  {
    icon: Award,
    title: "Named, Credited Artists",
    text: "Your portrait is created by a real artist, not an anonymous production line.",
  },
  {
    icon: Sparkles,
    title: "Made Just For You",
    text: "Your reference photo, your size, your details — no two portraits are the same.",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How is my price estimate calculated?",
    answer:
      "We start from a real base price for your portrait type at our 12\" x 12\" reference size (Single from ₹4,500, Couple ₹5,500, Family ₹6,800, Baby ₹4,000), then scale it proportionally by the area of the size you choose. The price you see is the actual price — not a vague range.",
  },
  {
    question: "What sizes are available?",
    answer:
      "Choose from our popular presets (12\"x12\", 16\"x20\", 24\"x36\") or enter any custom size between 4\" and 72\" on each side — your estimate updates instantly.",
  },
  {
    question: "What happens after I pay the deposit?",
    answer:
      "Your 10% deposit confirms your spot in our artists' queue. Our team reviews your reference photo, confirms the final price, and reaches out within 24-48 hours before any painting begins.",
  },
  {
    question: "Is the deposit refundable?",
    answer:
      "Yes. If you review the final concept and decide not to go ahead, we'll refund your deposit in full.",
  },
  {
    question: "How long does a custom portrait take?",
    answer:
      "Timelines depend on the portrait's size and complexity. Once our team reviews your photo and confirms the final price, they'll also confirm your exact delivery timeline.",
  },
  {
    question: "What photo quality do I need to provide?",
    answer:
      "A clear, well-lit, in-focus photo works best — the higher the resolution, the more detail our artists can capture. You can upload up to 3 reference photos.",
  },
  {
    question: "Can I request changes before the final painting starts?",
    answer:
      "Yes — when our team confirms your final price after reviewing your photo, you'll have the chance to share any specific requests (pose, background, framing) before painting begins.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide. Shipping costs and timelines are confirmed along with your final price.",
  },
  {
    question: "What if I want more than one portrait?",
    answer:
      "Submit a separate request for each portrait so we can give you an accurate estimate and reference photo for every piece.",
  },
  {
    question: "Can I combine portrait types (e.g. a couple with their baby)?",
    answer:
      "Yes — choose the type that best fits your photo (for example, Family for a couple with their baby), and mention any specific combination in the notes field so our team can plan accordingly.",
  },
];

const CustomPortraitsPage = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="bg-[#f4f2ee] text-[#1f1f1f]">
        <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto max-w-[860px]">
            <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
              Custom Portraits
            </p>
            <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
              Custom Portrait Paintings, Painted By Hand From Your Photo
            </h1>
            <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
              Single, Couple, Family & Baby portraits. Get an instant price — pay just 10% to
              confirm.
            </p>
            <Link
              href="#estimator"
              className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90"
            >
              Get My Estimate
            </Link>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 md:px-12 md:py-14">
          <div className="mx-auto grid max-w-[900px] grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <p className="font-display text-[28px] text-[#1f1f1f] md:text-[34px]">20,000+</p>
              <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Global Collectors</p>
            </div>
            <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <Image
                src="/google-logo.png"
                alt="Google"
                width={28}
                height={28}
                className="mx-auto h-7 w-7"
              />
              <p className="mt-2 font-display text-[28px] text-[#1f1f1f] md:text-[34px]">5.0</p>
              <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Google Reviews</p>
            </div>
            <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <Image
                src="/trustpilot-logo.svg"
                alt="Trustpilot"
                width={90}
                height={22}
                className="mx-auto h-[18px] w-auto"
              />
              <p className="mt-2 font-display text-[28px] text-[#126849] md:text-[34px]">4.5</p>
              <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Excellent Rating</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Choose Your Portrait
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PORTRAIT_SHOWCASE.map(({ type, icon: Icon, title, text, price }) => (
                <div
                  key={type}
                  className="flex flex-col items-center rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                  <p className="mt-3 font-display text-[18px] text-[#1f1f1f]">
                    From ₹{price.toLocaleString("en-IN")}
                  </p>
                  <Link
                    href={`/custom-portraits?type=${type}#estimator`}
                    className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-[#1a1a1a] px-5 py-2 text-[14px] font-medium text-white transition-colors hover:bg-black"
                  >
                    Get My Estimate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px] text-center">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              How It Works
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "1", title: "Choose Type & Size", text: "Pick your portrait type and size — presets or fully custom." },
                { step: "2", title: "Get an Instant Estimate", text: "See your real, calculated price the moment you enter a size." },
                { step: "3", title: "Pay 10% to Confirm", text: "Confirm your spot with a 10% deposit. Change your mind after review? Full refund." },
                { step: "4", title: "We Paint It", text: "Our team reviews your photo, confirms the final price, and your artist gets to work." },
              ].map(({ step, title, text }) => (
                <div key={step} className="flex flex-col items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f] font-display text-[18px] text-white">
                    {step}
                  </span>
                  <h3 className="mt-4 font-display text-[19px] text-[#313131]">{title}</h3>
                  <p className="mt-2 max-w-[260px] text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="estimator" className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[900px]">
            <div className="text-center">
              <ClipboardCheck className="mx-auto h-8 w-8 text-[#1f1f1f]" />
              <h2 className="mt-4 font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[38px]">
                Get Your Instant Estimate
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[#595959] md:text-[16px]">
                Choose your type and size, upload a reference photo, and pay 10% to confirm your
                portrait.
              </p>
            </div>
            <div className="mt-8">
              <CustomPortraitForm />
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Why a Hand-Painted Portrait
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {WHY_HAND_PAINTED.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQSection title="Custom Portraits FAQ" items={FAQ_ITEMS} />

        <section className="px-4 py-12 text-center sm:px-6 md:px-12 md:py-16">
          <p className="text-[15px] text-[#595959]">
            Looking for a fully bespoke concept instead of a portrait?{" "}
            <Link href="/custom-order" className="font-medium text-[#1f1f1f] underline underline-offset-2">
              Visit Custom Paintings
            </Link>
          </p>
        </section>
      </main>
    </>
  );
};

export default CustomPortraitsPage;
