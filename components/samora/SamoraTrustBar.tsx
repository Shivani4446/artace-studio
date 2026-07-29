import { Hand, Leaf, Package, Sparkles } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Hand, label: "100% Handcrafted" },
  { icon: Leaf, label: "Natural Materials" },
  { icon: Package, label: "Made in Small Batches" },
  { icon: Sparkles, label: "Part of Artace Studio" },
];

const SamoraTrustBar = () => {
  return (
    <section className="border-y border-[#2b2420]/10 bg-[#f3ead9]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4 md:gap-4 md:px-10 md:py-7">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0 text-[#c1683d]" strokeWidth={1.75} />
            <span className="text-[13.5px] font-medium text-[#3f382f] md:text-[14px]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SamoraTrustBar;
