# Art Care Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Not subagent-driven-development for this project — that workflow assumes commits between tasks, and this project's standing rule is that the user handles all commits/pushes themselves.)

**Goal:** Ship `/art-care`, an SEO-rich content page covering general art care, India-climate care, and medium-specific guidance (canvas/photography/custom portraits), with an FAQ — and link it in from the navbar, footer, every product page's Care Instructions tab, and the About Us page.

**Architecture:** A single new content page (no form, no new backend, no payment) built on the same stacked-section + `FAQSection` + `FAQPage` JSON-LD pattern already used by `/reviews`, `/trade`, and `/custom-portraits`. Four small, independent edits to existing files add the cross-site links.

**Tech Stack:** Next.js App Router (Server Component page, no client interactivity needed), TypeScript, Tailwind CSS 4.

## Global Constraints

- No `git commit`/`git push` — the user reviews and commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit` and live dev-server checks on a fresh port, checking `netstat -ano | grep ":3000"` first and never touching that PID.
- The new page's general care advice must stay consistent with the existing product-page Care Instructions tab copy (`components/singleproduct/SingleProduct.tsx:1472-1483`) — dust monthly with a dry cloth, damp cloth every 6 months, no soap/detergents/solvents, avoid direct sunlight and damp walls.
- No named/linked restoration or reframing service anywhere on the page — "consult a professional conservator" stays generic.

---

### Task 1: `/art-care` page

**Files:**
- Create: `app/art-care/page.tsx`

**Interfaces:**
- Consumes: `FAQSection`, `type FAQItem` from `components/seo/FAQSection.tsx` (existing, unmodified); `buildSiteUrl` from `@/lib/site` (existing).

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Sun,
  Truck,
  Archive,
  CloudRain,
  Bug,
  Frame,
  Camera,
  Heart,
  ShieldAlert,
} from "lucide-react";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Art Care Guide – How to Clean, Store & Protect Your Paintings | Artace Studio",
  description:
    "How to care for hand-painted artwork in India: cleaning, sunlight, monsoon humidity, pest prevention, and medium-specific tips for canvas, framed photography, and custom portraits.",
  alternates: {
    canonical: buildSiteUrl("/art-care"),
  },
  openGraph: {
    title: "Art Care Guide – How to Clean, Store & Protect Your Paintings | Artace Studio",
    description: "Simple steps to keep your hand-painted artwork looking beautiful for years.",
    url: buildSiteUrl("/art-care"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Care Guide | Artace Studio",
    description: "Simple steps to keep your hand-painted artwork looking beautiful for years.",
  },
};

const GENERAL_CARE = [
  {
    icon: Sparkles,
    title: "Cleaning",
    text: "Dust gently with a soft, dry cloth about once a month. A lightly damp cloth every 6 months removes finer dust. Never use soap, detergents, disinfectants, or solvents — they can damage pigments and varnish.",
  },
  {
    icon: Sun,
    title: "Sunlight & Placement",
    text: "Keep artwork away from direct sunlight and away from walls prone to dampness or leakage. Prolonged UV exposure fades pigments over time.",
  },
  {
    icon: Truck,
    title: "Transport & Handling",
    text: "Hold artwork by the frame edges or stretcher bars, never the painted surface. For larger pieces, two people carrying it is best.",
  },
  {
    icon: Archive,
    title: "Storage",
    text: "Don't leave a painting rolled in its packaging tube long-term — unroll and mount or frame it as soon as you can to avoid surface cracking or creasing.",
  },
];

const CLIMATE_CARE = [
  {
    icon: CloudRain,
    title: "Humidity & Monsoon Care",
    text: "Keep artwork away from exterior or damp-prone walls during humid months. A dehumidifier or silica packs in humid rooms help, and it's worth checking framed backing for trapped moisture periodically.",
  },
  {
    icon: Bug,
    title: "Pest Prevention",
    text: "Keep artwork away from furniture prone to wood-boring insects, inspect frames and backing periodically, and avoid storing pieces in damp basements or attics where pests thrive.",
  },
];

const MEDIUM_CARE = [
  {
    icon: Frame,
    title: "Canvas Paintings",
    text: "Never frame a canvas painting under glass — canvas needs to breathe, and glass traps moisture that can damage the surface over time. For mid-to-large pieces, extra stretcher-bar support helps prevent warping and cracking.",
  },
  {
    icon: Camera,
    title: "Framed Photography & Prints",
    text: "Non-glare, UV-protective glass is best, paired with acid-free mats and backing to prevent yellowing or moisture damage over time.",
  },
  {
    icon: Heart,
    title: "Custom Portraits",
    text: "Follow the same canvas or paper guidance above depending on what your portrait was painted on. Since a portrait is usually a one-off, sentimental piece, a little extra care around placement and handling goes a long way toward keeping it as a lasting heirloom.",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How often should I clean my painting or framed artwork?",
    answer:
      "Dust it gently with a soft, dry cloth about once a month. A lightly damp cloth every 6 months is enough to remove finer dust for most pieces.",
  },
  {
    question: "Can I clean my artwork with water or cleaning products?",
    answer:
      "No — avoid soap, detergents, disinfectants, and solvents, as they can damage pigments and varnish. Use only a dry or lightly damp soft cloth.",
  },
  {
    question: "Where's the best place to hang a painting?",
    answer:
      "Away from direct sunlight and away from walls prone to dampness or leakage. Prolonged UV exposure fades pigments over time.",
  },
  {
    question: "How do I protect artwork during India's monsoon season?",
    answer:
      "Keep it away from exterior or damp-prone walls, use a dehumidifier or silica packs in humid rooms, and check framed backing for trapped moisture periodically.",
  },
  {
    question: "How do I prevent pests from damaging my artwork?",
    answer:
      "Keep artwork away from furniture prone to wood-boring insects, inspect frames and backing periodically, and avoid storing pieces in damp basements or attics where pests thrive.",
  },
  {
    question: "Can canvas paintings be framed under glass?",
    answer:
      "No — canvas needs to breathe. Framing it under glass traps moisture and can damage the surface over time.",
  },
  {
    question: "What's the right glass for framed photography or prints?",
    answer:
      "Non-glare, UV-protective glass, paired with acid-free mats and backing to prevent yellowing or moisture damage over time.",
  },
  {
    question: "How should I transport or move a painting?",
    answer:
      "Hold it by the frame edges or stretcher bars, never the painted surface. For larger pieces, two people carrying it is best.",
  },
  {
    question: "What should I do if my artwork is damaged or shows signs of mold or flaking paint?",
    answer: "Don't attempt a DIY repair — consult a professional art conservator or restorer.",
  },
  {
    question: "How long can I leave a painting rolled in its packaging tube?",
    answer:
      "Not long-term — unroll and mount or frame it as soon as you can to avoid surface cracking or creasing.",
  },
];

const ArtCarePage = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="bg-[#f4f2ee] text-[#1f1f1f]">
        <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto max-w-[860px]">
            <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
              Art Care Guide
            </p>
            <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
              How to Care for Your Hand-Painted Artwork
            </h1>
            <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
              Simple steps to keep your artwork looking beautiful for years to come.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              General Care Basics
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {GENERAL_CARE.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Caring for Art in India's Climate
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {CLIMATE_CARE.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Care by Medium
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {MEDIUM_CARE.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[900px]">
            <div className="flex flex-col items-center rounded-[16px] border border-[#1f1f1f]/10 bg-white p-8 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-[24px] leading-[1.15] text-[#1f1f1f] md:text-[30px]">
                When to Call a Professional
              </h2>
              <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
                If your artwork is damaged, or shows signs of mold, tears, or flaking paint, don't
                attempt a DIY repair. Consult a professional art conservator or restorer.
              </p>
            </div>
          </div>
        </section>

        <FAQSection title="Art Care FAQ" items={FAQ_ITEMS} />

        <section className="px-4 py-12 text-center sm:px-6 md:px-12 md:py-16">
          <p className="text-[15px] text-[#595959]">
            Shopping for a new piece?{" "}
            <Link href="/shop" className="font-medium text-[#1f1f1f] underline underline-offset-2">
              Browse the Shop
            </Link>
            {" "}· Commissioning something custom?{" "}
            <Link
              href="/custom-portraits"
              className="font-medium text-[#1f1f1f] underline underline-offset-2"
            >
              Explore Custom Portraits
            </Link>
          </p>
        </section>
      </main>
    </>
  );
};

export default ArtCarePage;
```

- [ ] **Step 2: `npx tsc --noEmit`**

Expect only the pre-existing known errors (`.next/types/**` stale noise, `app/samora/shop/[slug]/page.tsx:352`, `app/warli-paintings/page.tsx:129`, `components/navbar.tsx:1171`) — nothing new.

- [ ] **Step 3: Live verification**

Check port 3000 first (`netstat -ano | grep ":3000"`, record PID, do not touch it). Start the dev server on a fresh port. Request `/art-care` and confirm `HTTP 200` with real content (e.g. `grep -o "Art Care Guide"` on the response body, not an error page). Confirm port 3000's PID is unchanged, then stop the fresh dev server.

---

### Task 2: Sitewide link placements

**Files:**
- Modify: `components/navbar.tsx`
- Modify: `components/footer.tsx`
- Modify: `components/singleproduct/SingleProduct.tsx`
- Modify: `components/About/OurCommitment.tsx`

**Interfaces:**
- Consumes: the `/art-care` route from Task 1 (must be merged first, or at least this task's `tsc` step run after Task 1's page exists — Next.js doesn't type-check route existence, so ordering isn't strictly required, but do Task 1 first regardless since these links point at it).

- [ ] **Step 1: Navbar — add to the Resources dropdown**

In `components/navbar.tsx`, find the `resourceLinks` array (currently ends with the "Warli Paintings" entry, right after "Blogs"):

```ts
  {
    name: "Blogs",
    href: "/blogs",
    description: "Ideas on styling art, gifting, collecting, and choosing the right piece.",
  },
  {
    name: "Warli Paintings",
```

Change to:

```ts
  {
    name: "Blogs",
    href: "/blogs",
    description: "Ideas on styling art, gifting, collecting, and choosing the right piece.",
  },
  {
    name: "Art Care Guide",
    href: "/art-care",
    description: "Simple steps to keep your artwork looking beautiful for years.",
  },
  {
    name: "Warli Paintings",
```

- [ ] **Step 2: Footer — add to the Resources section**

In `components/footer.tsx`, find the `"Resources"` section's `links` array:

```ts
  {
    title: "Resources",
    links: [
      { label: "Blogs", href: "/blogs" },
      { label: "Exhibition", href: "/exhibition" },
```

Change to:

```ts
  {
    title: "Resources",
    links: [
      { label: "Blogs", href: "/blogs" },
      { label: "Art Care Guide", href: "/art-care" },
      { label: "Exhibition", href: "/exhibition" },
```

- [ ] **Step 3: Product page — link from the Care Instructions tab**

In `components/singleproduct/SingleProduct.tsx`, find the end of the Care Instructions tab content:

```tsx
          <p>
            To preserve the beauty of your artwork for years to come, keep it away from direct sunlight and avoid placing it on walls with moisture or water leakage. With just a little care, your artwork will remain vibrant and beautiful for a long time. ✨
          </p>
        </div>
      );
    }
```

Change to:

```tsx
          <p>
            To preserve the beauty of your artwork for years to come, keep it away from direct sunlight and avoid placing it on walls with moisture or water leakage. With just a little care, your artwork will remain vibrant and beautiful for a long time. ✨
          </p>
          <p>
            <Link href="/art-care" className="font-medium text-[#1f1f1f] underline underline-offset-2">
              Read our full Art Care Guide
            </Link>{" "}
            for more tips, including how to care for artwork in India's climate. →
          </p>
        </div>
      );
    }
```

(`Link` from `next/link` is already imported in this file — confirmed at the top of the file — no new import needed.)

- [ ] **Step 4: About Us — link from the "Our Commitment" section**

In `components/About/OurCommitment.tsx`, add the import:

```tsx
import React from 'react';
import Link from 'next/link';
import { Playfair_Display, Inter } from 'next/font/google';
```

Then change:

```tsx
          {/* Body Text */}
          <p className="max-w-2xl font-inter text-[16px] leading-7 text-[#555555] md:text-[1.125rem] md:leading-[1.7]">
            Whether you&apos;re seeking a statement piece for your home or a custom artwork that captures your unique vision, our team of skilled artists ensures that each creation meets our exacting standards of excellence.
          </p>

        </div>
```

to:

```tsx
          {/* Body Text */}
          <p className="max-w-2xl font-inter text-[16px] leading-7 text-[#555555] md:text-[1.125rem] md:leading-[1.7]">
            Whether you&apos;re seeking a statement piece for your home or a custom artwork that captures your unique vision, our team of skilled artists ensures that each creation meets our exacting standards of excellence.
          </p>
          <Link
            href="/art-care"
            className="mt-4 inline-block font-inter text-[15px] font-medium text-[#2C2C2C] underline underline-offset-2 md:text-[16px]"
          >
            Learn how to care for your artwork →
          </Link>

        </div>
```

- [ ] **Step 5: `npx tsc --noEmit`**

Expect only the pre-existing known errors — nothing new in any of the 4 files touched.

- [ ] **Step 6: Live verification**

Check port 3000 first, start the dev server on a fresh port. Confirm:
- `/` (or wherever the navbar renders) shows "Art Care Guide" in the Resources dropdown.
- Any page's footer shows "Art Care Guide" under "Resources," linking to `/art-care`.
- A product page's Care Instructions tab shows the new "Read our full Art Care Guide" link.
- `/about-us` shows the new "Learn how to care for your artwork →" link under Our Commitment.

Confirm port 3000's PID is unchanged throughout, then stop the fresh dev server.

## Self-review notes

- **Spec coverage:** every section of the design spec (route/metadata, all 9 content sections, FAQ, all 4 link placements) maps to a task/step above.
- **No placeholders:** none — all content, all 10 FAQ items, and all 4 edit diffs are written out in full.
- **Consistency check:** the page's General Care Basics copy (cleaning, sunlight, transport, storage) matches the existing product-page Care Instructions tab's advice verbatim in substance — confirmed no contradictions.
