import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

const SamoraPromoBanner = () => {
  return (
    <Link
      href="/samora/shop"
      className="flex h-10 w-full items-center justify-center gap-2 bg-[#460000] px-4 text-white transition-colors hover:bg-[#340000]"
    >
      <Gift className="h-3.5 w-3.5 shrink-0 text-[#e8c07d]" strokeWidth={1.75} />
      <p className="truncate text-[12px] sm:text-[13.5px]">
        <span className="sm:hidden">
          <span className="font-semibold text-[#e8c07d]">This Rakhi</span>
          {" — Flat 10% Off. Code "}
          <span className="font-semibold tracking-wide">RAKHI10</span>
        </span>
        <span className="hidden sm:inline">
          <span className="font-semibold text-[#e8c07d]">This Rakhi, Gift Handmade</span>
          {" — Flat 10% Off Sitewide. Use Code "}
          <span className="font-semibold tracking-wide">RAKHI10</span>
          {" at Checkout. Ends Aug 28."}
        </span>
      </p>
      <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
    </Link>
  );
};

export default SamoraPromoBanner;
