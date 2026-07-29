import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Coffee, RectangleHorizontal, ShoppingBag, Tag } from "lucide-react";

const TITLE = "Samora Shop | Handcrafted Tote Bags, Coasters, Trays & Name Plates";
const DESCRIPTION =
  "The Samora shop is being onboarded. Get in touch for early access to handcrafted tote bags, tea coasters, trays, and personalized name plates.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/shop",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'd like early access to the shop.");

const CATEGORIES = [
  { name: "Tote Bags", icon: ShoppingBag },
  { name: "Tea Coasters", icon: Coffee },
  { name: "Trays", icon: RectangleHorizontal },
  { name: "Name Plates", icon: Tag },
];

const SamoraShopPage = () => {
  return (
    <main className="mx-auto max-w-[900px] px-5 py-20 text-center md:px-10 md:py-28">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#c1683d]">
        The Samora Shop
      </p>
      <h1 className="font-samora-display mt-5 text-[34px] leading-[1.12] text-[#2b2420] sm:text-[42px] md:text-[52px]">
        Our full catalog is on its way
      </h1>
      <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.7] text-[#5c5344] md:text-[17px]">
        We&apos;re onboarding the Samora collection &mdash; handcrafted tote bags, tea coasters,
        trays, and personalized name plates. Reach out for early access, pricing, and
        availability.
      </p>

      <div className="mx-auto mt-10 grid max-w-[520px] grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(({ name, icon: Icon }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2.5 rounded-[16px] border border-[#2b2420]/10 p-4"
          >
            <Icon className="h-5 w-5 text-[#c1683d]" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-[#3f382f]">{name}</span>
          </div>
        ))}
      </div>

      <Link
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
      >
        Get Early Access
        <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </main>
  );
};

export default SamoraShopPage;
