import Link from "next/link";
import { ArrowUpRight, Coffee, RectangleHorizontal, ShoppingBag, Tag } from "lucide-react";

const CATEGORIES = [
  {
    name: "Tote Bags",
    icon: ShoppingBag,
    description:
      "Hand-finished jute and cotton totes built for everyday carry, with a texture no machine-made bag can copy.",
    accent: "bg-[#c1683d]",
  },
  {
    name: "Tea Coasters",
    icon: Coffee,
    description:
      "Handwoven and hand-painted coaster sets that protect your table while adding warmth to the everyday ritual of tea.",
    accent: "bg-[#8f9a6e]",
  },
  {
    name: "Trays",
    icon: RectangleHorizontal,
    description:
      "Serving and decor trays in wood and hand-finished ceramic, made for both the kitchen and the console table.",
    accent: "bg-[#7a5a3a]",
  },
  {
    name: "Name Plates",
    icon: Tag,
    description:
      "Personalized name plates for your home, handcrafted and finished with your name, house name, or custom design.",
    accent: "bg-[#c1683d]",
  },
];

const SamoraCraftCategories = () => {
  return (
    <section id="craft" className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
      <div className="max-w-[720px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          The Collection
        </p>
        <h2 className="font-samora-display mt-4 text-[32px] leading-[1.12] text-[#2b2420] sm:text-[38px] md:text-[46px]">
          Four crafts, one handmade philosophy
        </h2>
        <p className="mt-4 text-[16px] leading-[1.7] text-[#5c5344] md:text-[17px]">
          Every Samora category starts as a raw, natural material and ends as a finished piece
          made entirely by hand &mdash; no two pieces are perfectly identical, and that&apos;s the point.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(({ name, icon: Icon, description, accent }) => (
          <Link
            key={name}
            href="/samora/shop"
            className="group flex flex-col rounded-[20px] border border-[#2b2420]/10 bg-[#fbf6ef] p-6 transition-colors hover:border-[#c1683d]/40"
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${accent}`}
            >
              <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
            </span>
            <h3 className="font-samora-display mt-5 text-[21px] text-[#2b2420]">{name}</h3>
            <p className="mt-2.5 flex-1 text-[14px] leading-[1.65] text-[#5c5344]">{description}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-[13.5px] font-medium text-[#c1683d]">
              Explore
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SamoraCraftCategories;
