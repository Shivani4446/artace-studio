import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const SamoraHero = () => {
  return (
    <section className="relative aspect-[21/9] w-full min-h-[400px] overflow-hidden">
      <Image
        src="/samora-hero-bg.webp"
        alt="Handcrafted Samora tote bag, tea coasters, wooden tray, and accessories arranged together"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 mx-auto flex w-full max-w-[1320px] items-center px-5 md:px-10">
        <div className="max-w-[520px]">
          <h1 className="font-samora-display text-[38px] leading-[1.08] text-[#2b2420] sm:text-[46px] md:text-[58px]">
            Handcrafted home accessories, made slowly by hand
          </h1>
          <p className="mt-6 max-w-[480px] text-[16.5px] leading-[1.7] text-[#5c5344] md:text-[18px]">
            Samora is the handcrafted lifestyle sub-brand of Artace Studio &mdash; tote bags, tea
            coasters, trays, and personalized name plates, made in small batches from natural
            materials by skilled artisans.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#craft"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
            >
              Explore the Craft
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="#story"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#2b2420]/20 px-6 py-3 text-[14.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SamoraHero;
