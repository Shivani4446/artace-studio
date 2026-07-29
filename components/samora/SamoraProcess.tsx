import { CheckCircle2, Hand, Leaf, Truck } from "lucide-react";

const STEPS = [
  {
    icon: Leaf,
    title: "Sourced Materials",
    description: "Jute, cotton, wood, and ceramic sourced from trusted, small-scale suppliers.",
  },
  {
    icon: Hand,
    title: "Handcrafted by Artisans",
    description: "Every piece is shaped, woven, or finished by hand — not mass-produced.",
  },
  {
    icon: CheckCircle2,
    title: "Finished & Checked",
    description: "Each item is quality-checked individually before it leaves the workshop.",
  },
  {
    icon: Truck,
    title: "Packed with Care",
    description: "Carefully packaged and shipped pan-India, the same way Artace Studio ships art.",
  },
];

const SamoraProcess = () => {
  return (
    <section className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
      <div className="max-w-[720px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          How It&apos;s Made
        </p>
        <h2 className="font-samora-display mt-4 text-[32px] leading-[1.12] text-[#2b2420] sm:text-[38px] md:text-[46px]">
          The Samora process
        </h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <div key={title} className="relative rounded-[20px] border border-[#2b2420]/10 p-6">
            <span className="text-[13px] font-semibold text-[#c1683d]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Icon className="mt-4 h-6 w-6 text-[#2b2420]" strokeWidth={1.5} />
            <h3 className="font-samora-display mt-4 text-[19px] text-[#2b2420]">{title}</h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-[#5c5344]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SamoraProcess;
