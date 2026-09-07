import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Hand, Leaf, PackageCheck } from "lucide-react";

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I loved reading Sampadaa's story and wanted to say hello.");

const VALUES = [
  {
    icon: Hand,
    title: "Handmade in Small Batches",
    description:
      "Nothing at Samora is mass-produced. Every tote, coaster, tray, and name plate is made by hand, a few pieces at a time.",
  },
  {
    icon: Leaf,
    title: "Natural Materials, Sourced with Care",
    description:
      "Jute, cotton, wood, and clay, chosen the same way Artace Studio chooses its artists — slowly, and on merit.",
  },
  {
    icon: PackageCheck,
    title: "Every Order, Personally Seen Through",
    description:
      "From the workshop floor to the courier at the door, Sampadaa is hands-on with what leaves Samora — not just what's made, but how it travels.",
  },
];

const SamoraOurStory = () => {
  return (
    <main className="bg-[#fbf6ef]">
      {/* Intro */}
      <section className="mx-auto max-w-[1320px] px-5 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-16">
          <div className="order-2 md:order-1">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#2b2420]/10 bg-[#f3ead9] shadow-[0_24px_48px_-24px_rgba(43,36,32,0.35)] md:mx-0">
              <Image
                src="/sampadaa-mahalley-profile.webp"
                alt="Sampadaa Mahalley, the maker behind Samora, by the coast at sunset"
                fill
                priority
                sizes="(min-width: 768px) 420px, 90vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
              Our Story
            </p>
            <h1 className="font-samora-display mt-4 text-[34px] leading-[1.1] text-[#2b2420] sm:text-[42px] md:text-[52px]">
              One Maker. One Workshop. Every Piece by Hand.
            </h1>
            <p className="mt-6 text-[16.5px] leading-[1.75] text-[#5c5344] md:text-[18px]">
              Samora is a one-woman operation at heart. Sampadaa Mahalley runs it out of Pune
              &mdash; from choosing the jute and the clay, to the artisans who shape it, to the
              parcel that eventually reaches your door.
            </p>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="bg-[#2b2420] py-16 text-[#f3ead9] md:py-24">
        <div className="mx-auto max-w-[760px] px-5 md:px-10">
          <div className="space-y-6 text-[16px] leading-[1.85] text-[#e4d4b8] md:text-[18px]">
            <p>
              Artace Studio has spent years working with artists across India, bringing
              handcrafted canvas paintings into homes and offices. Samora grew out of that same
              studio floor &mdash; and out of Sampadaa&apos;s conviction that the artisans,
              weavers, and makers she already knew had far more to offer than the canvas alone.
            </p>
            <p>
              Where Artace Studio is about what goes on your walls, Samora is about what you
              hold, use, and live with every day &mdash; a tote you carry to work, a coaster
              under your morning tea, a tray on the console table, a name plate at your front
              door. Sampadaa runs this side of the business herself, from Pune: sourcing the raw,
              natural materials, working directly with the hands that shape them, and keeping
              every batch small enough that nothing about it feels rushed.
            </p>
            <p>
              It doesn&apos;t stop at the workshop door, either. Sampadaa is the same person who
              signs off on the packaging, the same person the courier calls to collect a parcel,
              the same person who&apos;d want to know if something arrived less than perfect.
              That&apos;s the part that&apos;s hard to scale &mdash; and the part Samora has no
              interest in giving up.
            </p>
          </div>

          <p className="font-samora-display mt-12 border-l-2 border-[#c1683d] pl-6 text-[24px] leading-[1.4] text-white sm:text-[28px] md:text-[32px]">
            Handmade, done properly, takes time &mdash; and someone who cares enough to give it
            that time.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
        <div className="max-w-[640px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
            What She Stands For
          </p>
          <h2 className="font-samora-display mt-4 text-[30px] leading-[1.15] text-[#2b2420] sm:text-[34px] md:text-[40px]">
            The principles behind every Samora piece
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#c1683d]">
                <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
              </span>
              <h3 className="font-samora-display mt-5 text-[19px] text-[#2b2420]">{title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.65] text-[#5c5344]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
        <div className="flex flex-col items-start gap-6 rounded-[24px] bg-[#c1683d] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="font-samora-display text-[26px] leading-[1.15] sm:text-[30px] md:text-[34px]">
              Ready to bring one home?
            </h2>
            <p className="mt-3 max-w-[520px] text-[15px] leading-[1.65] text-white/85 md:text-[16px]">
              Every piece in the shop passed through Sampadaa&apos;s hands, or the hands of
              someone she trusts, before it reached the page.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/samora/shop"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2b2420] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#1c1712]"
            >
              Shop the Collection
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/40 px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:border-white"
            >
              Say Hello
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SamoraOurStory;
