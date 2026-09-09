import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Hand, Leaf, Truck } from "lucide-react";

// Same 4 real steps as the homepage's condensed SamoraProcess section —
// deliberately not adding new specific claims (which artisans, which
// regions, which techniques) that aren't actually confirmed. This page goes
// deeper on what's already true, not wider into what isn't verified.
const STEPS = [
  {
    icon: Leaf,
    title: "Sourced Materials",
    description:
      "Jute, cotton, wood, and clay — chosen from trusted, small-scale suppliers the same way Artace Studio chooses its artists: slowly, and on merit. Nothing here is picked for being the cheapest option; it's picked for holding up to years of everyday use.",
  },
  {
    icon: Hand,
    title: "Handcrafted by Artisans",
    description:
      "Every tote is woven, every coaster is hand-painted, every tray is hand-finished. Nothing at Samora comes off an assembly line — each piece passes through actual hands before it's ever offered for sale, which is also why no two pieces are perfectly identical.",
  },
  {
    icon: CheckCircle2,
    title: "Finished & Checked",
    description:
      "Before anything is listed, it's checked individually — for finish, for stitching, for the small details that separate a piece worth keeping from one that just looks fine in a photo. Sampadaa is personally hands-on with this stage, not just the sourcing.",
  },
  {
    icon: Truck,
    title: "Packed with Care",
    description:
      "Every order is packed to survive the trip, then shipped pan-India the same way Artace Studio ships its artwork — with the same attention, whether it's one tote or a full corporate hamper.",
  },
];

const SamoraOurProcess = () => {
  return (
    <main className="bg-[#fbf6ef]">
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-10 md:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          How It&apos;s Made
        </p>
        <h1 className="font-samora-display mt-4 text-[32px] leading-[1.15] text-[#2b2420] sm:text-[38px] md:text-[44px]">
          The Samora Process
        </h1>
        <p className="mt-5 text-[16.5px] leading-[1.75] text-[#5c5344] md:text-[18px]">
          Four steps, the same for every piece — from a raw, natural material to something that
          arrives at your door ready to use.
        </p>

        <div className="mt-14 space-y-12">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="flex gap-6">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c1683d]">
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </span>
                {index < STEPS.length - 1 ? (
                  <span className="mt-2 w-px flex-1 bg-[#2b2420]/10" />
                ) : null}
              </div>
              <div className="pb-2">
                <span className="text-[13px] font-semibold text-[#c1683d]">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-samora-display mt-2 text-[22px] text-[#2b2420] md:text-[25px]">
                  {title}
                </h2>
                <p className="mt-3 text-[15.5px] leading-[1.75] text-[#5c5344]">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] p-6 md:p-8">
          <h2 className="font-samora-display text-[19px] text-[#2b2420]">
            Curious About the Person Behind It?
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[#5c5344]">
            Every step above runs through Sampadaa Mahalley, from sourcing to the courier at the
            door.
          </p>
          <Link
            href="/samora/our-story"
            className="mt-5 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-[#c1683d] transition-colors hover:text-[#a8552f]"
          >
            Meet the Maker
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SamoraOurProcess;
