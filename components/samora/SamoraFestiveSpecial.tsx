import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SamoraProductCard, { type SamoraProduct } from "@/components/samora/SamoraProductCard";
import {
  SamoraFestiveBunting,
  SamoraDiyaIcon,
  SamoraMandalaIcon,
} from "@/components/samora/SamoraFestiveIcons";

// Kept as constants rather than inline strings so the ribbon, the code chip and
// any future copy edit stay in sync — and so there is exactly one place to
// change when the campaign ends.
const COUPON_CODE = "NAVRATRI2026";
const OFFER_PERCENT = 20;

// The two marquee halves must render an identical sequence, because the
// animation is a translateX(-50%). Change one and you have to change the other.
const RIBBON_ITEMS = [
  "Navratri Special",
  `Flat ${OFFER_PERCENT}% Off Every Order`,
  `Use Code ${COUPON_CODE}`,
  "Nine Nights of Maa",
  "Handmade in Small Batches",
];

const RibbonItem = ({ label }: { label: string }) => (
  <span className="flex items-center gap-3 whitespace-nowrap px-5">
    <span className="text-[#e8c07d]">✦</span>
    <span className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-[12px]">
      {label}
    </span>
  </span>
);

const OfferRibbon = () => (
  <div
    className="samora-gentle-drift relative z-10 mt-7 overflow-hidden border-y border-[#e8c07d]/30 bg-black/25 py-2.5"
    style={{ animationDelay: "-3s" }}
  >
    <div className="flex w-max animate-[marquee_34s_linear_infinite] items-center">
      <div className="flex items-center">
        {RIBBON_ITEMS.map((item, index) => (
          <RibbonItem key={index} label={item} />
        ))}
      </div>
      <div className="flex items-center" aria-hidden="true">
        {RIBBON_ITEMS.map((item, index) => (
          <RibbonItem key={index} label={item} />
        ))}
      </div>
    </div>
  </div>
);

const SamoraFestiveSpecial = ({ products }: { products: SamoraProduct[] }) => {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#4a0d12] via-[#9b2226] to-[#2b2420] py-14 md:py-20">
      {/* Bunting along the top edge */}
      <div className="absolute inset-x-0 top-0 z-10 h-7 w-full overflow-hidden opacity-90">
        <SamoraFestiveBunting className="samora-gentle-drift h-full w-full" />
      </div>

      {/* Drifting light. Two blobs on offset delays so they never travel in
          lockstep, which is what makes the movement read as depth rather than
          as one sliding layer. */}
      <div
        aria-hidden="true"
        className="samora-glow-drift pointer-events-none absolute -left-28 -top-28 h-[24rem] w-[24rem] rounded-full bg-[#e8c07d]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="samora-glow-drift pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#c1683d]/30 blur-3xl"
        style={{ animationDelay: "-9s" }}
      />

      {/* Rotating mandala. The positioning wrapper carries the centring
          translate and the inner <svg> carries the rotation — putting both on
          one element would make the animation's `transform` win and drop the
          wrapper off its vertical centre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:block"
      >
        <SamoraMandalaIcon className="samora-mandala-turn -mr-40 h-[38rem] w-[38rem] text-[#e8c07d] opacity-[0.07]" />
      </div>

      {/* Diya watermarks for texture — no flame animation at this size */}
      <SamoraDiyaIcon className="pointer-events-none absolute -left-12 top-40 h-52 w-52 -rotate-12 text-[#e8c07d] opacity-[0.08]" />
      <SamoraDiyaIcon className="pointer-events-none absolute -bottom-10 right-24 hidden h-64 w-64 rotate-6 text-[#e8c07d] opacity-[0.07] lg:block" />

      <OfferRibbon />

      <div className="relative mx-auto mt-10 max-w-[1320px] px-5 md:mt-14 md:px-10">
        <div className="max-w-[660px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8c07d]/30 bg-[#e8c07d]/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#e8c07d]">
            <SamoraDiyaIcon className="h-4 w-4" flameClassName="samora-flame" />
            Navratri Special
          </span>

          <h2 className="font-samora-display mt-5 text-[32px] leading-[1.14] text-white sm:text-[38px] md:text-[46px]">
            Nine Nights of Maa. <span className="text-[#e8c07d]">Nine Handmade Gifts.</span>
          </h2>

          <p className="mt-4 max-w-[38rem] text-[16px] leading-[1.7] text-white/75 md:text-[17px]">
            Light a diya each evening of Navratri and welcome Maa home with something made
            by hand. Take a flat{" "}
            <span className="font-semibold text-white">{OFFER_PERCENT}% off every order</span>{" "}
            with code <span className="font-semibold text-[#e8c07d]">{COUPON_CODE}</span>.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="inline-flex items-center gap-3 rounded-xl border border-dashed border-[#e8c07d]/60 bg-black/25 px-4 py-2.5">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/55">
                Code
              </span>
              <span className="font-mono text-[16px] font-semibold tracking-[0.12em] text-[#e8c07d] sm:text-[17px]">
                {COUPON_CODE}
              </span>
            </div>
            <span className="text-[14px] text-white/70">
              Flat {OFFER_PERCENT}% off, ends 20th October
            </span>
          </div>

          <Link
            href="/samora/shop"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#2b2420] px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#1c1712]"
          >
            Shop the Collection
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <SamoraProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SamoraFestiveSpecial;
