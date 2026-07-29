import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Coffee, RectangleHorizontal, ShoppingBag, Tag } from "lucide-react";

const CATEGORIES = [
  { label: "Tote Bags", icon: ShoppingBag },
  { label: "Tea Coasters", icon: Coffee },
  { label: "Trays", icon: RectangleHorizontal },
  { label: "Name Plates", icon: Tag },
];

const SamoraSpotlight = () => {
  return (
    <section className="w-full bg-[#FAF9F6]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:gap-[50px]">
          {/* Left Column: Text Content */}
          <div className="flex w-full flex-col items-start justify-center py-14 md:py-16 lg:w-1/2">
            <Image
              src="/samroa-logo.svg"
              alt="Samora by Artace Studio"
              width={190}
              height={125}
              className="h-11 w-auto"
            />
            <h2 className="font-display mt-6 text-4xl leading-tight text-[#2C2C2C] md:text-5xl lg:text-6xl">
              Handcrafted Living, By <span className="text-[#460000]">Samora</span>
            </h2>
            <p className="font-inter mt-3 max-w-lg text-base leading-[1.7] text-[#555555] md:text-lg">
              Samora is Artace Studio&apos;s handcrafted lifestyle line &mdash; tote bags, tea
              coasters, trays, and personalized name plates, made by hand in small batches from
              natural materials.
            </p>

            <div className="mt-8 grid max-w-sm grid-cols-2 gap-x-6 gap-y-4">
              {CATEGORIES.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#460000]/10 text-[#460000]">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="font-inter text-[14px] text-[#2C2C2C]">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/samora"
              className="group mt-9 inline-flex items-center gap-2 rounded-[4px] bg-[#460000] px-8 py-3.5 font-inter text-sm font-semibold text-white transition-colors hover:bg-[#340000]"
            >
              Explore Samora
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Right Column: Image, flush with the section's full height */}
          <div className="relative h-[420px] w-full sm:h-[520px] lg:h-auto lg:w-1/2">
            <Image
              src="/samora-section-image.webp"
              alt="Samora handcrafted tote bag, coasters, tray, bookmark, and keychains displayed together"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SamoraSpotlight;
