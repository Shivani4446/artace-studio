import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Online Art Exhibition | Virtual Gallery | Artace Studio",
  description: "Explore Artace Studio's online art exhibition. View our virtual gallery showcasing curated paintings and contemporary artworks.",
  keywords: "art exhibition, virtual gallery, online gallery, contemporary art, curated paintings",
  openGraph: {
    title: "Online Art Exhibition | Artace Studio",
    description: "Explore our virtual gallery exhibition.",
    url: "https://artacestudio.com/exhibition",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Art Exhibition | Artace Studio",
    description: "Virtual gallery exhibition.",
  },
};

const focusRegions = [
  {
    region: "India",
    title: "City-led showcases rooted in culture and conversation",
    copy:
      "From collector previews to design-focused pop-ups, Artace is building exhibitions that feel intimate, tactile, and deeply connected to Indian homes and hospitality spaces.",
    cities: ["Mumbai", "New Delhi", "Bengaluru", "Pune"],
  },
  {
    region: "Middle East & Europe",
    title: "Design-forward presentations for global audiences",
    copy:
      "Our next chapter includes exhibitions shaped for international buyers, curated interiors, and cross-border collaborations that appreciate original Indian artistry.",
    cities: ["Dubai", "London", "Amsterdam", "Milan"],
  },
  {
    region: "Worldwide",
    title: "A growing route for collectors, galleries, and collaborators",
    copy:
      "This page will continue evolving as Artace announces new venues, featured collections, and city dates across a wider global exhibition circuit.",
    cities: ["Singapore", "New York", "Sydney", "Toronto"],
  },
];

const exhibitionFormats = [
  {
    title: "Gallery Exhibitions",
    copy:
      "Curated wall stories, statement canvases, designed to slow visitors down .",
  },
  {
    title: "Design & Hospitality Showcases",
    copy:
      "Room-like presentations that help architects, hoteliers, and tastemakers see how each painting lives.",
  },
  {
    title: "Collector Previews",
    copy:
      "Smaller private presentations where scale, palette, and commissioning possibilities can be discussed with context and care.",
  },
];

const participatedExhibitions = [
  {
    title: "Trishakti Art Exhibition",
    host: "Hosted by Trishakti",
    location: "Ahmedabad, Gujarat",
    dateLabel: "Recent Participation",
    description:
      "Artace recently participated in a Trishakti-hosted exhibition in Ahmedabad, Gujarat, presenting original hand-painted works in a space where visitors could experience the richness of color, texture, and devotional storytelling up close.",
    supportingCopy:
      "Alongside the live showcase, local press coverage and on-ground conversations helped spotlight the diversity of artists and the emotional pull of handcrafted Indian art.",
    highlights: [
      "Original hand-painted works on display",
      "Live visitor engagement inside the gallery",
      "Featured in regional press coverage",
    ],
    leadImage: {
      src: "/exhibitions/trishakti-gallery.jpeg",
      alt: "Visitors engaging with Artace artworks during the Trishakti-hosted exhibition in Gujarat",
    },
    pressImages: [
      {
        src: "/exhibitions/trishakti-press-1.jpeg",
        alt: "Newspaper coverage highlighting the Trishakti exhibition featuring Artace artworks",
      },
      {
        src: "/exhibitions/trishakti-press-2.jpeg",
        alt: "Press clipping and exhibition collage from the Trishakti showcase featuring Artace paintings",
      },
    ],
  },
];

const exhibitionFlow = [
  {
    step: "01",
    title: "Curate the city edit",
    copy:
      "Each exhibition begins with a collection narrative, balancing devotional, contemporary, and interior-ready works for the audience in focus.",
  },
  {
    step: "02",
    title: "Shape the spatial story",
    copy:
      "We adapt size, rhythm, and artwork pairings so the exhibition feels immersive whether it sits in a gallery, design fair, or hospitality setting.",
  },
  {
    step: "03",
    title: "Extend the conversation",
    copy:
      "Every showcase is built to open conversations with collectors, partners, and curators looking for original Indian art with depth and presence.",
  },
];

const showcaseNotes = [
  "New cities, dates, and featured collections will be updated here as exhibitions are announced.",
  "Every showcase centers original hand-painted works, not mass-produced prints.",
  "Artace exhibitions are designed to travel well across Indian and international audiences.",
];

export default function ExhibitionPage() {
  return (
    <main className="bg-[#f4f2ee] text-[#181818]">
      <section className="relative isolate overflow-hidden bg-[#111111] text-white">
        <Image
          src="/hero-bg.webp"
          alt="Dark exhibition-inspired Artace backdrop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,10,10,0.88),rgba(10,10,10,0.62),rgba(10,10,10,0.78))]" />

        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 pb-16 pt-20 sm:pt-24 md:px-12 md:pb-20 md:pt-28 lg:grid lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:gap-12 lg:pb-24">
          <div className="max-w-4xl">
            <h1 className="font-display text-[2.4rem] leading-[1.02] text-white sm:text-[3.1rem] md:max-w-[12ch] md:text-[4.25rem]">
              Exhibition
            </h1>
            <p className="mt-5 max-w-[42rem] font-inter text-[1rem] leading-[1.8] text-white/82 sm:text-[1.05rem] md:text-[1.125rem]">
              A growing Artace exhibition journey across India and the world. This
              is where we will share city-led showcases, featured collections, and
              venue stories as our paintings move through galleries, design spaces,
              hospitality projects, and collector-facing presentations.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/contact-us"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-inter text-[0.95rem] font-medium text-[#181818] transition-colors hover:bg-[#f2eee7]"
              >
                Plan an exhibition collaboration
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/blogs"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 font-inter text-[0.95rem] font-medium text-white transition-colors hover:bg-white/14"
              >
                Explore the Artace journal
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-white/14 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
            <div className="space-y-4">
              {showcaseNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-[1.1rem] border border-white/10 bg-black/18 px-4 py-4"
                >
                  <p className="font-inter text-[0.95rem] leading-[1.7] text-white/84">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#e9dfd2]">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-6 py-6 md:px-12 md:py-8 lg:grid-cols-3">
          <div className="rounded-[1rem] bg-white/72 px-5 py-5">
            <p className="font-inter text-[0.95rem] font-normal text-[#6f675d]">
              India First
            </p>
            <p className="mt-3 font-display text-[0.95rem] leading-[1.22] text-[#1e1e1e] md:text-[1.05rem]">
              Built for galleries, residences, and design communities across the country.
            </p>
          </div>
          <div className="rounded-[1rem] bg-white/72 px-5 py-5">
            <p className="font-inter text-[0.95rem] font-normal text-[#6f675d]">
              Global Outlook
            </p>
            <p className="mt-3 font-display text-[0.95rem] leading-[1.22] text-[#1e1e1e] md:text-[1.05rem]">
              Curated to travel into international design destinations with confidence.
            </p>
          </div>
          <div className="rounded-[1rem] bg-white/72 px-5 py-5">
            <p className="font-inter text-[0.95rem] font-normal text-[#6f675d]">
              Original Canvases
            </p>
            <p className="mt-3 font-display text-[0.95rem] leading-[1.22] text-[#1e1e1e] md:text-[1.05rem]">
              Every showcase centers authentic hand-painted work with texture and presence.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="max-w-[32rem]">
            <h2 className="font-display text-[2.2rem] leading-[1.06] text-[#1c1c1c] sm:text-[2.7rem] md:text-[3.3rem]">
              Artace is building an exhibition in India with global reach.
            </h2>
          </div>

          <div className="rounded-[2rem] border border-[#ddd5ca] bg-white/75 p-6 sm:p-7">
            <p className="font-inter text-[1rem] leading-[1.85] text-[#5b564f]">
              Rather than treating exhibitions like one-off events, we are shaping a
              longer journey of curated appearances. The goal is simple: put original
              paintings in rooms where collectors, collaborators, and tastemakers can
              experience texture, scale, and story in person.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {focusRegions.map((item) => (
            <article
              key={item.region}
              className="rounded-[2rem] border border-[#ddd5ca] bg-white px-5 py-6 shadow-[0_20px_60px_rgba(42,34,24,0.05)] sm:px-6"
            >
              <p className="font-inter text-[0.92rem] font-normal text-[#7e7468]">
                {item.region}
              </p>
              <h3 className="mt-4 font-display text-[1.7rem] leading-[1.1] text-[#1d1d1d]">
                {item.title}
              </h3>
              <p className="mt-4 font-inter text-[0.98rem] leading-[1.8] text-[#5f5951]">
                {item.copy}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {item.cities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full bg-[#f4efe7] px-3 py-2 font-inter text-[0.78rem] font-medium text-[#4d463d]"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#151515] text-white">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-14 md:px-12 md:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-[15rem] overflow-hidden rounded-[1.1rem] sm:row-span-2 sm:min-h-[33rem]">
              <Image
                src="/about-us-img-1.webp"
                alt="Hand-painted Artace canvas in a styled interior setting"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
                className="object-cover"
              />
            </div>
            <div className="relative min-h-[15rem] overflow-hidden rounded-[1.1rem]">
              <Image
                src="/shiv-ganesh-lifestyle.webp"
                alt="Close view of Artace paintings arranged for editorial display"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                className="object-cover"
              />
            </div>
            <div className="relative min-h-[15rem] overflow-hidden rounded-[1.1rem]">
              <Image
                src="/shri-krishna.webp"
                alt="Artist portrait representing the people behind Artace exhibitions"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-[2.2rem] leading-[1.06] text-white sm:text-[2.7rem] md:text-[3.15rem]">
              Each art is designed to feel warm, immersive, and easy to remember.
            </h2>
            <div className="mt-8 divide-y divide-white/10">
              {exhibitionFormats.map((format) => (
                <div
                  key={format.title}
                  className="py-5 first:pt-0 last:pb-0"
                >
                  <h3 className="font-inter text-[1.3rem] font-medium leading-[1.2] text-white">
                    {format.title}
                  </h3>
                  <p className="mt-3 font-inter text-[0.98rem] leading-[1.8] text-white/74">
                    {format.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f0e7db] text-[#181818]">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
          <div className="max-w-[44rem]">
            <h2 className="font-display text-[2.2rem] leading-[1.06] text-[#1c1c1c] sm:text-[2.7rem] md:text-[3.15rem]">
              Recent Artace participation, captured through the gallery and the press.
            </h2>
            <p className="mt-5 font-inter text-[1rem] leading-[1.85] text-[#5d564d]">
              As Artace grows its exhibition presence, this section will document the
              showcases we have already participated in, the audiences we met, and
              the stories that travelled beyond the venue walls.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            {participatedExhibitions.map((exhibition) => (
              <article
                key={exhibition.title}
                className="overflow-hidden rounded-[2rem] border border-[#d7cec2] bg-white shadow-[0_22px_70px_rgba(42,34,24,0.06)]"
              >
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                  <div className="relative min-h-[20rem] bg-[#ddd2c6] sm:min-h-[26rem] lg:min-h-full">
                    <Image
                      src={exhibition.leadImage.src}
                      alt={exhibition.leadImage.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 52vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/28 to-transparent px-5 py-5 text-white sm:px-6">
                      <p className="font-inter text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/68">
                        Gallery Moment
                      </p>
                      <p className="mt-2 max-w-[24rem] font-display text-[1.55rem] leading-[1.08]">
                        Visitors experienced Artace works in a live exhibition setting.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 px-5 py-6 sm:px-6 sm:py-7">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f4efe7] px-3 py-2 font-inter text-[0.76rem] font-medium text-[#4f473d]">
                        {exhibition.dateLabel}
                      </span>
                      <span className="rounded-full bg-[#f4efe7] px-3 py-2 font-inter text-[0.76rem] font-medium text-[#4f473d]">
                        {exhibition.host}
                      </span>
                      <span className="rounded-full bg-[#f4efe7] px-3 py-2 font-inter text-[0.76rem] font-medium text-[#4f473d]">
                        {exhibition.location}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-[2rem] leading-[1.04] text-[#1e1e1e] sm:text-[2.35rem]">
                        {exhibition.title}
                      </h3>
                      <p className="mt-4 font-inter text-[1rem] leading-[1.85] text-[#5d564d]">
                        {exhibition.description}
                      </p>
                      <p className="mt-4 font-inter text-[0.98rem] leading-[1.82] text-[#5d564d]">
                        {exhibition.supportingCopy}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {exhibition.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="rounded-[1.3rem] border border-[#e5ddd2] bg-[#fbf8f3] px-4 py-4"
                        >
                          <p className="font-inter text-[0.9rem] leading-[1.6] text-[#47413a]">
                            {highlight}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {exhibition.pressImages.map((image, index) => (
                        <div key={image.src} className="space-y-3">
                          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-[#e2d8cb] bg-[#f3ecdf]">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                              className="object-cover"
                            />
                          </div>
                          <p className="font-inter text-[0.85rem] leading-[1.7] text-[#6a6258]">
                            {index === 0
                              ? "Press feature carrying the exhibition story and artwork highlights."
                              : "Additional published coverage and artwork collage from the showcase."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-[7.5rem]">
            <p className="font-inter text-[0.75rem] font-medium uppercase tracking-[0.24em] text-[#85796c]">
              How We Build It
            </p>
            <h2 className="mt-4 font-display text-[2.2rem] leading-[1.06] text-[#1c1c1c] sm:text-[2.7rem] md:text-[3.2rem]">
              From curation to conversation, every exhibition is treated like a story in space.
            </h2>
            <p className="mt-5 max-w-[28rem] font-inter text-[1rem] leading-[1.85] text-[#5f5951]">
              Artace exhibitions are not only about displaying paintings. They are
              about revealing the atmosphere around them: the wall, the lighting, the
              sequence, and the feeling a collector carries home.
            </p>
          </div>

          <div className="space-y-5">
            {exhibitionFlow.map((item) => (
              <article
                key={item.step}
                className="rounded-[2rem] border border-[#ddd5ca] bg-white px-6 py-6 shadow-[0_18px_50px_rgba(42,34,24,0.04)]"
              >
                <p className="font-inter text-[0.82rem] font-medium uppercase tracking-[0.24em] text-[#8a7f72]">
                  Step {item.step}
                </p>
                <h3 className="mt-4 font-display text-[2rem] leading-[1.08] text-[#1d1d1d]">
                  {item.title}
                </h3>
                <p className="mt-3 font-inter text-[1rem] leading-[1.85] text-[#5f5951]">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e7ddd0]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-14 md:px-12 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[42rem]">
            <p className="font-inter text-[0.75rem] font-medium uppercase tracking-[0.24em] text-[#85796c]">
              Collaboration
            </p>
            <h2 className="mt-4 font-display text-[2.2rem] leading-[1.06] text-[#1b1b1b] sm:text-[2.7rem] md:text-[3.15rem]">
              Planning an exhibition, collector preview, or hospitality art story?
            </h2>
            <p className="mt-5 font-inter text-[1rem] leading-[1.85] text-[#5d564d]">
              Artace can collaborate on curated presentations, venue-ready painting
              selections, and exhibition concepts that feel distinctive from the first
              look to the final wall.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact-us"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#1c1c1c] px-6 py-3 font-inter text-[0.95rem] font-medium text-white transition-colors hover:bg-black"
            >
              Talk to the studio
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/team"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#1c1c1c]/12 bg-white px-6 py-3 font-inter text-[0.95rem] font-medium text-[#1c1c1c] transition-colors hover:bg-[#f6f1ea]"
            >
              Meet the Artace team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
