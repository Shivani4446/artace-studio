import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'm interested in corporate or festive gifting.");

const SamoraGiftingBanner = () => {
  return (
    <section className="mx-auto max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
      <div className="flex flex-col items-start gap-6 rounded-[24px] bg-[#c1683d] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 className="font-samora-display text-[26px] leading-[1.15] sm:text-[30px] md:text-[34px]">
            Looking for corporate or festive gifting?
          </h2>
          <p className="mt-3 max-w-[520px] text-[15px] leading-[1.65] text-white/85 md:text-[16px]">
            Tote bags, coasters, trays, and name plates make thoughtful, handmade gifts &mdash;
            in bulk, with personalization on request.
          </p>
        </div>
        <Link
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#2b2420] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#1c1712]"
        >
          Talk to Us
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
};

export default SamoraGiftingBanner;
