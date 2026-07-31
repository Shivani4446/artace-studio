import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SamoraProductCard, { type SamoraProduct } from "@/components/samora/SamoraProductCard";
import { SamoraFestiveBunting, SamoraRakhiRosette } from "@/components/samora/SamoraFestiveIcons";

const SamoraFestiveSpecial = ({ products }: { products: SamoraProduct[] }) => {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#460000] via-[#5a1810] to-[#2b2420] py-16 md:py-24">
      {/* Bunting along the top edge */}
      <div className="absolute inset-x-0 top-0 h-7 w-full overflow-hidden opacity-90">
        <SamoraFestiveBunting className="h-full w-full" />
      </div>

      {/* Faint rosette watermarks for texture */}
      <SamoraRakhiRosette className="pointer-events-none absolute -left-10 top-16 h-48 w-48 text-[#e8c07d] opacity-[0.07]" />
      <SamoraRakhiRosette className="pointer-events-none absolute -right-14 bottom-0 h-64 w-64 text-[#e8c07d] opacity-[0.06]" />

      <div className="relative mx-auto max-w-[1320px] px-5 pt-6 md:px-10">
        <div className="max-w-[640px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#e8c07d]">
            <SamoraRakhiRosette className="h-4 w-4" />
            Raksha Bandhan Collection
          </span>

          <h2 className="font-samora-display mt-5 text-[32px] leading-[1.14] text-white sm:text-[38px] md:text-[46px]">
            This Rakhi, Tie the Bond with Something Handmade
          </h2>

          <p className="mt-4 text-[16px] leading-[1.7] text-white/75 md:text-[17px]">
            Celebrate the thread that ties you together with handcrafted gifts made to be
            cherished &mdash; tote bags, coasters, trays, and more from Samora&apos;s small-batch
            collection, ready for the season of siblings.
          </p>

          <Link
            href="/samora/shop"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#c1683d] px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
          >
            Shop Rakhi Gifts
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
