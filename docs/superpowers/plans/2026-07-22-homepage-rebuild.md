# Homepage Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage per the approved 12-section copy doc — add the Trust Bar and Artace Studio Journey sections, fold in SEO-research findings, add a Framer Motion animation layer, and remove the discount banner — while deferring Shop by Room and hero-image rotation until photography is supplied.

**Architecture:** One blended, currency-aware homepage. New sections (`TrustBar`, `ArtaceJourney`) and two extracted single-panel sections (`AboutUsPanel`, `DesignTogetherPanel`, replacing the 3-panel `PromotionalBanner`) are added to `components/homepage/`; five existing components get copy/markup edits; `app/(home)/page.tsx` is reassembled in the new section order. Framer Motion (new dependency) drives scroll-triggered reveals; the existing `useCurrency()` hook drives the one region-varying piece of copy (the hero price anchor).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 4, Framer Motion 12 (new), `lucide-react` (existing). No test framework exists in this project — verification is `npx tsc --noEmit` for type correctness plus curling the local dev server and grepping rendered HTML for integration, the same convention used in prior plans (currency dropdown, chatbot redesign).

## Global Constraints

- Do **not** run `git commit` or `git push` at any point in this plan — the user handles all commits/pushes themselves in this project. Every task ends with a note confirming changes are left in the working tree, not a commit step.
- Single blended homepage — no geo-detection, no separate regional URLs/pages.
- The hero price-anchor line is the only region-varying content in this pass, via the existing `useCurrency()` hook (`components/currency/CurrencyProvider.tsx`), which exposes `formatPrice(amountInInr: number): string`.
- Framer Motion version: `^12.42.2` (confirmed compatible with React 19 via its `peerDependencies`: `react: "^18.0.0 || ^19.0.0"`).
- Headings use the `font-display` class (maps to the site's local Sentient serif font, globally available via `app/layout.tsx` — no per-component font import needed). Body text uses `font-inter` (also globally available). Do not import `next/font/google` fonts locally in new components — that's an existing outlier pattern in `ShopBestSellers.tsx` only, not the majority convention.
- The Cal.com booking link is the literal string `"https://cal.com/artace-studio"`, duplicated per-file — this matches the existing repo-wide pattern (no shared constant module exists for it anywhere in the codebase; do not introduce one).
- "See Collection" CTAs link to `/shop` — confirmed no generic `/collections` index route exists (`app/collections/` only has a `[slug]` dynamic route).
- All Framer Motion animations use `viewport={{ once: true }}` (never re-trigger on scroll-back-up) and are gated by `useReducedMotion()` so `prefers-reduced-motion` users get an immediate, non-animated render.
- Shop by Room and hero-image rotation are explicitly out of scope for this plan — both need photography the user will supply separately.
- No browser/visual-testing tool is available to agents in this environment — final verification is TypeScript correctness + rendered-HTML content checks via curl/grep, not a real browser. Interactive/visual/animation behavior is the user's own manual check.

---

### Task 1: Add Framer Motion dependency

**Files:**
- Modify: `package.json` (via `npm install`)

**Interfaces:**
- Produces: the `framer-motion` package available for `import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"` in all later tasks.

- [ ] **Step 1: Install the dependency**

Run (from `d:\Artace Studio\artace-studio`):

```bash
npm install framer-motion@^12.42.2
```

Expected: installs cleanly, no `ERESOLVE` peer-dependency errors (already confirmed `framer-motion@12.42.2`'s peer deps accept React 19).

- [ ] **Step 2: Verify `package.json` and `package-lock.json` updated**

```bash
grep -n "framer-motion" package.json
```

Expected: a line like `"framer-motion": "^12.42.2"` under `dependencies`.

- [ ] **Step 3: Verify the import resolves**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

Expected: no new errors related to `framer-motion` (the project may have pre-existing unrelated errors — compare against a baseline run before this change if unsure; a clean baseline should stay clean).

Do not commit — leave `package.json`/`package-lock.json`/`node_modules` changes in the working tree for the user.

---

### Task 2: Hero price-anchor line

**Files:**
- Create: `components/homepage/HeroPriceAnchor.tsx`
- Modify: `components/homepage/HeroSection.tsx`

**Interfaces:**
- Consumes: `useCurrency()` from `@/components/currency/CurrencyProvider` (already exists, exposes `{ currency, setCurrency, formatPrice }`, where `formatPrice(amountInInr: number): string`).
- Produces: `HeroPriceAnchor` default export, a small client component rendered inside `HeroSection`'s existing server-rendered markup.

- [ ] **Step 1: Write `components/homepage/HeroPriceAnchor.tsx`**

```tsx
"use client";

import React from "react";
import { useCurrency } from "@/components/currency/CurrencyProvider";

const HeroPriceAnchor = () => {
  const { formatPrice } = useCurrency();

  return (
    <p className="mt-4 font-inter text-[14px] text-white/75 md:mt-5 md:text-[15px]">
      Original pieces from {formatPrice(8500)} · Bespoke commissions from{" "}
      {formatPrice(15500)}
    </p>
  );
};

export default HeroPriceAnchor;
```

- [ ] **Step 2: Wire it into `components/homepage/HeroSection.tsx`**

Add the import at the top of the file (after the existing `lucide-react` import):

```tsx
import HeroPriceAnchor from "./HeroPriceAnchor";
```

Then insert `<HeroPriceAnchor />` immediately after the existing sub-headline paragraph and before the CTA buttons `<div>`. The relevant block currently reads:

```tsx
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/90 md:mt-5 md:text-[18px]">
                Buy handcrafted canvas paintings online in India, from spiritual wall art
                and abstract statements to custom commissions shaped around your space,
                palette, and story.
              </p>
              <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
```

Change it to:

```tsx
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/90 md:mt-5 md:text-[18px]">
                Buy handcrafted canvas paintings online in India, from spiritual wall art
                and abstract statements to custom commissions shaped around your space,
                palette, and story.
              </p>
              <HeroPriceAnchor />
              <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "HeroPriceAnchor\|HeroSection"
```

Expected: no output (no errors referencing either file).

- [ ] **Step 4: Verify it renders**

Start the dev server in the background, then curl the homepage:

```bash
npm run dev > /tmp/dev-server.log 2>&1 &
sleep 8
curl -s http://localhost:3000/ | grep -o "Original pieces from[^<]*"
kill %1
```

Expected: a line containing `Original pieces from ₹8,500` (or similar — INR is the default currency for a fresh request with no currency cookie set) `· Bespoke commissions from ₹15,500`.

Do not commit — leave both files in the working tree for the user.

---

### Task 3: Trust Bar section

**Files:**
- Create: `components/homepage/TrustBar.tsx`

**Interfaces:**
- Consumes: `motion`, `useReducedMotion` from `framer-motion` (Task 1); icons from `lucide-react` (already a dependency).
- Produces: `TrustBar` default export, a client component with no props, rendered directly in `page.tsx` (Task 11) immediately after `HeroSection`.

- [ ] **Step 1: Write `components/homepage/TrustBar.tsx`**

```tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Paintbrush, MessageCircle, PackageCheck, Star, Globe } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Paintbrush,
    label: "100% Handcrafted",
    detail: "Never printed, never duplicated",
  },
  {
    icon: MessageCircle,
    label: "Artist-Led Consultation",
    detail: "A real conversation, not a checkout form",
  },
  {
    icon: PackageCheck,
    label: "White-Glove Delivery",
    detail: "Packaged and delivered with care",
  },
  {
    icon: Star,
    label: "4.9★ on Google",
    detail: "From collectors across India and beyond",
  },
  {
    icon: Globe,
    label: "Worldwide Shipping",
    detail: "Your masterpiece, wherever home is",
  },
] as const;

const TrustBar = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full border-b border-black/5 bg-[#f7f6f3] py-8 md:py-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-start justify-center gap-x-8 gap-y-6 px-6 md:flex-nowrap md:justify-between md:gap-x-4 md:px-12">
        {TRUST_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex w-[calc(50%-1rem)] flex-col items-center gap-2 text-center sm:w-auto sm:items-start sm:text-left"
            >
              <Icon className="h-5 w-5 text-[#2f2f2f]" strokeWidth={1.75} />
              <p className="font-inter text-[13px] font-medium leading-tight text-[#2f2f2f] sm:text-[14px]">
                {item.label}
              </p>
              <p className="font-inter text-[11px] leading-snug text-[#767676] sm:text-[12px]">
                {item.detail}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustBar;
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "TrustBar"
```

Expected: no output.

- [ ] **Step 3: Verify it renders** (component isn't wired into `page.tsx` until Task 11 — this step just confirms the file compiles standalone via the type-check above; a rendered-HTML check happens in Task 11/12 once it's actually on the page).

Do not commit — leave the file in the working tree for the user.

---

### Task 4: Artace Studio Journey section

**Files:**
- Create: `components/homepage/ArtaceJourney.tsx`

**Interfaces:**
- Consumes: `motion`, `useReducedMotion`, `useScroll`, `useTransform` from `framer-motion`; icons from `lucide-react`.
- Produces: `ArtaceJourney` default export, a client component with no props, rendered in `page.tsx` (Task 11) after `TrustBar`.

- [ ] **Step 1: Write `components/homepage/ArtaceJourney.tsx`**

```tsx
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MessageCircle, PenTool, Palette, Paintbrush, PackageCheck } from "lucide-react";

const JOURNEY_STEPS = [
  {
    icon: MessageCircle,
    title: "The Vision Consultation",
    description: "We listen first. Your space, your story, your feelings.",
  },
  {
    icon: PenTool,
    title: "The Idea & Sketch",
    description: "Your concept, sketched and approved before a single brushstroke.",
  },
  {
    icon: Palette,
    title: "The Palette Confirmation",
    description: "Every color chosen to belong in your home.",
  },
  {
    icon: Paintbrush,
    title: "Creation with Milestone Updates",
    description: "Watch your masterpiece take shape, step by step.",
  },
  {
    icon: PackageCheck,
    title: "The Final Reveal & White-Glove Delivery",
    description: "Approved by you, delivered with care.",
  },
] as const;

const CAL_LINK = "https://cal.com/artace-studio";

const ArtaceJourney = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.5"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="w-full bg-[#efeeec] py-14 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <div className="max-w-2xl">
          <h2 className="font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[40px] md:text-[52px]">
            A Masterpiece Made With You, Not Just For You
          </h2>
          <p className="mt-5 font-inter text-[16px] leading-[1.7] text-[#4f4b45] md:mt-6 md:text-[18px]">
            Most galleries hand you a catalogue and leave you to choose alone. At
            Artace Studio, every bespoke piece is a collaboration, five phases, one
            shared vision.
          </p>
        </div>

        <div ref={timelineRef} className="relative mt-12 md:mt-16">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-black/10 md:left-[23px]" />
          {!shouldReduceMotion && (
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-[19px] top-2 w-px bg-[#2f2f2f] md:left-[23px]"
            />
          )}

          <ol className="flex flex-col gap-10 md:gap-12">
            {JOURNEY_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="relative flex items-start gap-5 md:gap-6"
                >
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2f2f2f]/15 bg-[#efeeec] font-display text-[15px] text-[#2f2f2f] md:h-12 md:w-12 md:text-[17px]">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#2f2f2f]/70" strokeWidth={1.75} />
                      <h3 className="font-display text-[19px] leading-[1.2] text-[#1f1f1f] md:text-[22px]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 max-w-md font-inter text-[14px] leading-[1.6] text-[#5b5b5b] md:text-[15px]">
                      {step.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <Link
          href={CAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 inline-flex items-center justify-center rounded-md bg-[#2f2f2f] px-8 py-3 text-[16px] font-medium text-white transition-colors hover:bg-[#1f1f1f] md:mt-14"
        >
          Book a Free Consultation
        </Link>
      </div>
    </section>
  );
};

export default ArtaceJourney;
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "ArtaceJourney"
```

Expected: no output.

Do not commit — leave the file in the working tree for the user.

---

### Task 5: Extract About Us and Design Together panels; remove the discount banner

**Files:**
- Create: `components/homepage/AboutUsPanel.tsx`
- Create: `components/homepage/DesignTogetherPanel.tsx`
- Delete: `components/homepage/PromotionalBanner.tsx`

**Interfaces:**
- Produces: `AboutUsPanel` and `DesignTogetherPanel`, both default-export server components (no client interactivity needed — no hooks used), each rendered standalone in `page.tsx` (Task 11) at two different, non-adjacent positions.

- [ ] **Step 1: Write `components/homepage/AboutUsPanel.tsx`**

(Extracted from `PromotionalBanner.tsx`'s 2nd campaign panel — same background image, copy, and sticky-scroll visual treatment, now standalone since it's no longer part of a 3-panel stacked group. The `zIndex`/array-mapping logic from the original is dropped since there's nothing left to stack against.)

```tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const AboutUsPanel = () => {
  return (
    <section className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden md:sticky md:top-0 md:h-screen md:justify-center">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/stack-2.webp"
          alt="Modern interior with abstract art and blue textured wall"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-6 py-10 md:justify-center md:px-12 md:py-0">
        <div className="max-w-3xl">
          <h2 className="mb-4 whitespace-pre-line font-display text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.1] lg:text-6xl">
            {"We Connect You With\nAuthentic, Handmade Art\nTo Give Your Space A\nSoul."}
          </h2>
          <p className="mb-8 max-w-xl font-inter text-[15px] font-normal leading-relaxed text-white/90 md:mb-10 md:text-lg">
            We invite you to explore. Not just to find a painting, but to discover a
            connection. Find the piece that speaks to you. Find the soul for your space.
          </p>
          <Link
            href="/about-us"
            className="inline-flex items-center gap-2 font-inter text-base font-medium text-white underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            More About Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutUsPanel;
```

- [ ] **Step 2: Write `components/homepage/DesignTogetherPanel.tsx`**

(Extracted from `PromotionalBanner.tsx`'s 3rd campaign panel — same background image and sticky-scroll treatment; header/body copy updated to match the approved copy doc's section 9 exactly.)

```tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CAL_LINK = "https://cal.com/artace-studio";

const DesignTogetherPanel = () => {
  return (
    <section className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden md:sticky md:top-0 md:h-screen md:justify-center">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/stack-3.webp"
          alt="Grey living room with gallery wall frames"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-6 py-10 md:justify-center md:px-12 md:py-0">
        <div className="max-w-3xl">
          <h2 className="mb-4 font-display text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.1] lg:text-6xl">
            Not Sure What You Need? Let&apos;s Design It Together
          </h2>
          <p className="mb-8 max-w-xl font-inter text-[15px] font-normal leading-relaxed text-white/90 md:mb-10 md:text-lg">
            At Artace Studio, our curation extends beyond the canvas. We believe the
            same authenticity, craftsmanship, and narrative power should apply to
            every element that makes your space your own.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[4px] bg-white px-8 py-3.5 font-inter text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Book a Call Now
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-inter text-sm font-medium text-white underline-offset-4 transition-all hover:underline"
            >
              See Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignTogetherPanel;
```

- [ ] **Step 3: Delete the old component**

```bash
rm components/homepage/PromotionalBanner.tsx
```

- [ ] **Step 4: Confirm nothing else imports the deleted file**

```bash
grep -rn "PromotionalBanner" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | grep -v .next
```

Expected: no output (it's only ever imported in `app/(home)/page.tsx`, which gets updated in Task 11 — if this task runs before Task 11, this grep will still show one hit in `page.tsx`'s import; that's expected and gets resolved there, not a failure of this task).

- [ ] **Step 5: Type-check the two new files**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "AboutUsPanel\|DesignTogetherPanel"
```

Expected: no output.

Do not commit — leave the two new files and the deletion in the working tree for the user.

---

### Task 6: Update Bestsellers copy

**Files:**
- Modify: `components/homepage/ShopBestSellers.tsx`

**Interfaces:**
- No new exports/props — pure copy and layout tweak inside the existing `ShopBestsellers` component.

- [ ] **Step 1: Update the header block**

Find this complete block:

```tsx
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-center md:justify-between">
          <h2 className="font-playfair text-3xl text-[#2C2C2C] uppercase tracking-wide md:text-5xl">
            Shop Bestsellers
          </h2>

          <Link
            href="/shop"
            className="group flex items-center gap-2 font-inter text-[#4A4846] text-sm font-medium border-b border-[#4A4846] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            SHOP ALL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
```

Replace it with:

```tsx
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-playfair text-3xl text-[#2C2C2C] uppercase tracking-wide md:text-5xl">
              Bestselling Handcrafted Canvas Paintings
            </h2>
            <p className="mt-3 font-inter text-[15px] text-[#666666] md:text-[16px]">
              The pieces our collectors return to again and again, devotional,
              abstract, and everything between.
            </p>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-2 font-inter text-[#4A4846] text-sm font-medium border-b border-[#4A4846] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            SHOP ALL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
```

Note: `md:items-center` changed to `md:items-start` on the outer flex container, since the left column now has two lines of text instead of one and top-alignment against the "SHOP ALL" link reads better than vertical centering. The `Link` itself (the "SHOP ALL" button) is unchanged — it's now a sibling of the new `<div className="max-w-2xl">` instead of a sibling of the bare `<h2>`, and the outer header `<div>` closes exactly as before.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "ShopBestSellers"
```

Expected: no output.

- [ ] **Step 3: Verify the copy renders**

```bash
npm run dev > /tmp/dev-server.log 2>&1 &
sleep 8
curl -s http://localhost:3000/ | grep -o "Bestselling Handcrafted Canvas Paintings"
kill %1
```

Expected: the string is found once.

Do not commit — leave the file in the working tree for the user.

---

### Task 7: Update Collections copy

**Files:**
- Modify: `components/homepage/DiscoverEssentials.tsx`

**Interfaces:**
- No new exports/props — copy tweak only.

- [ ] **Step 1: Update the header**

Find:

```tsx
        <h2 className="font-display text-[34px] leading-[1.04] tracking-tight text-[#2f2f2f] sm:text-[42px] md:text-[52px]">
          Discover Our Collections
        </h2>
```

Replace with:

```tsx
        <h2 className="font-display text-[34px] leading-[1.04] tracking-tight text-[#2f2f2f] sm:text-[42px] md:text-[52px]">
          Explore Our Collections, Radha Krishna, Abstract, Buddha & Beyond
        </h2>
        <p className="mt-4 max-w-2xl font-inter text-[16px] leading-[1.6] text-[#5b5b5b] md:text-[18px]">
          From the divine to the abstract, every collection at Artace Studio is
          handcrafted in-house, no two canvases are ever the same.
        </p>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "DiscoverEssentials"
```

Expected: no output.

- [ ] **Step 3: Verify the copy renders**

```bash
npm run dev > /tmp/dev-server.log 2>&1 &
sleep 8
curl -s http://localhost:3000/ | grep -o "Explore Our Collections, Radha Krishna, Abstract, Buddha &amp; Beyond"
kill %1
```

Expected: the string is found once (Next.js HTML-escapes `&` to `&amp;` in rendered output — the grep pattern accounts for that).

Do not commit — leave the file in the working tree for the user.

---

### Task 8: Animate True Artistry section on scroll

**Files:**
- Modify: `components/homepage/TrueArtistrySection.tsx`

**Interfaces:**
- Consumes: `motion`, `useReducedMotion` from `framer-motion` (Task 1). The file is already `"use client"` (has a `useRef`/`useEffect` for the video), so no new client-boundary change needed.

- [ ] **Step 1: Add the Framer Motion import**

Add to the existing imports:

```tsx
import { motion, useReducedMotion } from "framer-motion";
```

- [ ] **Step 2: Wrap the text block in a motion component**

Find:

```tsx
        <div className="max-w-2xl">
          <h2 className="font-display text-[34px] leading-[1.08] text-[#222222] sm:text-[40px] md:text-[52px]">
```

Replace the opening `<div className="max-w-2xl">` with a `motion.div`, and its matching closing `</div>` with `</motion.div>`. Also add this line inside the component body, before the `return`:

```tsx
  const shouldReduceMotion = useReducedMotion();
```

The text block becomes:

```tsx
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-[34px] leading-[1.08] text-[#222222] sm:text-[40px] md:text-[52px]">
            True Artistry. No Compromises.
          </h2>
          <p className="mt-5 font-inter text-[16px] leading-[1.75] text-[#3f3f3f] md:mt-6 md:text-[18px] md:leading-[1.8]">
            In a world flooded with digital prints and mass-produced decor, Artace
            Studio champions the soul of original art. We are not a marketplace; we
            are the artist&apos;s studio. Every piece we create is an authentic,
            handcrafted labor of love, utilizing premium oil and acrylic mediums
            that bring texture, depth, and life to your walls. Don&apos;t just
            decorate your home-invest in a piece of your own story.
          </p>
        </motion.div>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "TrueArtistrySection"
```

Expected: no output.

Do not commit — leave the file in the working tree for the user.

---

### Task 9: Shrink Artist Invitation

**Files:**
- Modify: `components/homepage/ArtistInvitation.tsx`

**Interfaces:**
- No new exports/props — this task replaces the entire component body with a smaller layout.

- [ ] **Step 1: Replace the full file contents**

```tsx
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const ArtistInvitation = () => {
  return (
    <section className="w-full bg-[#020304] py-6 text-white md:py-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 px-6 text-center md:flex-row md:justify-center md:gap-3 md:px-12">
        <p className="font-inter text-[14px] text-white/70 md:text-[15px]">
          We empower independent artists to share their stories with the world.
        </p>
        <Link
          href="/contact-us"
          className="inline-flex items-center gap-1 font-inter text-[14px] font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80 md:text-[15px]"
        >
          Partner With Us
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
};

export default ArtistInvitation;
```

This drops the previous two-column layout, the long paragraph, and the `/partner-with-us.svg` illustration entirely, per the copy doc's explicit "shrink to a single compact line + link, don't compete for homepage real estate" instruction.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "ArtistInvitation"
```

Expected: no output.

- [ ] **Step 3: Verify the old long-form copy is gone and the new compact copy is present**

```bash
npm run dev > /tmp/dev-server.log 2>&1 &
sleep 8
curl -s http://localhost:3000/ > /tmp/homepage.html
grep -c "An Invitation to Artists" /tmp/homepage.html
grep -o "We empower independent artists to share their stories with the world." /tmp/homepage.html
kill %1
```

Expected: the first `grep -c` returns `0` (old heading gone), the second returns the new compact line once.

Do not commit — leave the file in the working tree for the user.

---

### Task 10: Add new FAQ entries

**Files:**
- Modify: `app/(home)/homepage-schema.ts`

**Interfaces:**
- Modifies the existing `homepageFaqs` array (consumed by both `FAQSection` in `page.tsx` and the `FAQPage` entry inside `homepageSchema`'s `@graph` — both update automatically since the schema is generated from this same array via `homepageFaqs.map(...)`).

- [ ] **Step 1: Add the 3 new entries to `homepageFaqs`**

Find the end of the `homepageFaqs` array:

```ts
  {
    question: "How do I choose the right painting for my wall?",
    answer:
      "Start with the room, wall size, and mood you want to create. Artace Studio also offers direct guidance for custom orders, placement, sizing, and style selection.",
  },
] as const;
```

Replace with:

```ts
  {
    question: "How do I choose the right painting for my wall?",
    answer:
      "Start with the room, wall size, and mood you want to create. Artace Studio also offers direct guidance for custom orders, placement, sizing, and style selection.",
  },
  {
    question: "How much does a custom painting cost?",
    answer:
      "Bespoke commissions at Artace Studio typically start from ₹15,500, depending on size, medium, and detail. Every quote follows a personal consultation, so pricing always reflects your specific vision.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Ready-to-ship pieces are delivered within 5-7 days. Custom commissions follow our five-phase journey and are typically completed within 3-4 weeks, with milestone updates throughout.",
  },
  {
    question: "Do you ship across India and internationally?",
    answer:
      "Yes. Artace Studio ships pan-India and to collectors abroad, including the USA, Canada, UAE, and Australia, with secure, white-glove packaging for every piece.",
  },
] as const;
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "homepage-schema"
```

Expected: no output.

- [ ] **Step 3: Verify both the visible FAQ and the JSON-LD schema updated**

```bash
npm run dev > /tmp/dev-server.log 2>&1 &
sleep 8
curl -s http://localhost:3000/ > /tmp/homepage.html
grep -c "How much does a custom painting cost?" /tmp/homepage.html
kill %1
```

Expected: `2` (the question text appears twice in the rendered HTML — once in the visible `FAQSection` markup, once inside the `<script type="application/ld+json">` JSON-LD blob that embeds `homepageSchema`).

Do not commit — leave the file in the working tree for the user.

---

### Task 11: Reassemble the homepage in the new section order

**Files:**
- Modify: `app/(home)/page.tsx`

**Interfaces:**
- Consumes: `TrustBar` (Task 3), `ArtaceJourney` (Task 4), `AboutUsPanel` and `DesignTogetherPanel` (Task 5) — all default exports, all zero-prop components.
- This is the task that actually puts every other task's component onto the live homepage — nothing from Tasks 2-10 is visible on the site until this task runs.

- [ ] **Step 1: Update the imports**

Find:

```tsx
import HeroSection from "@/components/homepage/HeroSection";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
import TrueArtistrySection from "@/components/homepage/TrueArtistrySection";
// import ShopByArtist from "@/components/homepage/ShopByArtist";
import PromotionalBanner from "@/components/homepage/PromotionalBanner";
import Testimonials from "@/components/homepage/Testimonials";
import JournalSection from "@/components/homepage/JournalSection";
import ArtistInvitation from "@/components/homepage/ArtistInvitation";
```

Replace with:

```tsx
import HeroSection from "@/components/homepage/HeroSection";
import TrustBar from "@/components/homepage/TrustBar";
import ArtaceJourney from "@/components/homepage/ArtaceJourney";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
import TrueArtistrySection from "@/components/homepage/TrueArtistrySection";
import AboutUsPanel from "@/components/homepage/AboutUsPanel";
import Testimonials from "@/components/homepage/Testimonials";
import DesignTogetherPanel from "@/components/homepage/DesignTogetherPanel";
import JournalSection from "@/components/homepage/JournalSection";
import ArtistInvitation from "@/components/homepage/ArtistInvitation";
```

(The commented-out `ShopByArtist` import is dropped — it was already unused/commented out before this plan; not part of this rebuild's scope either way.)

- [ ] **Step 2: Reorder the JSX**

Find:

```tsx
      <HeroSection />
      <ShopBestSellers />
      <DiscoverEssentials categories={discoverCategories} />
      <TrueArtistrySection />
      {/* <ShopByArtist /> */}
      <Testimonials />
      <PromotionalBanner />
      <JournalSection />
      <FAQSection
```

Replace with:

```tsx
      <HeroSection />
      <TrustBar />
      <ArtaceJourney />
      <ShopBestSellers />
      <DiscoverEssentials categories={discoverCategories} />
      <TrueArtistrySection />
      <AboutUsPanel />
      <Testimonials />
      <DesignTogetherPanel />
      <JournalSection />
      <FAQSection
```

- [ ] **Step 3: Type-check the whole project**

```bash
npx tsc --noEmit --project tsconfig.json
```

Expected: no errors (or only pre-existing errors unrelated to any file touched in this plan — compare against a pre-plan baseline if any show up).

- [ ] **Step 4: Full production build**

```bash
npm run build
```

Expected: build completes successfully (exit code 0), no errors related to the homepage or any component touched in this plan.

Do not commit — leave the file in the working tree for the user.

---

### Task 12: Final end-to-end verification

**Files:** none created or modified — this task only runs verification commands.

**Interfaces:** none — this is a read-only check of the assembled homepage from Task 11.

- [ ] **Step 1: Start the dev server and confirm it's ready**

```bash
npm run dev > /tmp/dev-server-final.log 2>&1 &
sleep 10
grep -i "ready" /tmp/dev-server-final.log
```

Expected: a line confirming the server started (e.g. `✓ Ready in ...`).

- [ ] **Step 2: Fetch the homepage and check every new/changed section is present**

```bash
curl -s http://localhost:3000/ > /tmp/final-homepage.html

echo "--- Hero price anchor ---"
grep -c "Original pieces from" /tmp/final-homepage.html

echo "--- Trust Bar ---"
grep -c "Artist-Led Consultation" /tmp/final-homepage.html
grep -c "Worldwide Shipping" /tmp/final-homepage.html

echo "--- Journey ---"
grep -c "A Masterpiece Made With You, Not Just For You" /tmp/final-homepage.html
grep -c "Book a Free Consultation" /tmp/final-homepage.html

echo "--- Bestsellers ---"
grep -c "Bestselling Handcrafted Canvas Paintings" /tmp/final-homepage.html

echo "--- Collections ---"
grep -c "Explore Our Collections" /tmp/final-homepage.html

echo "--- True Artistry (unchanged) ---"
grep -c "True Artistry. No Compromises." /tmp/final-homepage.html

echo "--- About Us panel ---"
grep -c "More About Us" /tmp/final-homepage.html

echo "--- Design Together panel ---"
grep -c "Let&#x27;s Design It Together\|Let's Design It Together" /tmp/final-homepage.html

echo "--- Discount banner REMOVED ---"
grep -c "Flat 10% Off" /tmp/final-homepage.html

echo "--- Artist Invitation shrunk ---"
grep -c "An Invitation to Artists" /tmp/final-homepage.html

echo "--- New FAQs ---"
grep -c "How much does a custom painting cost?" /tmp/final-homepage.html
grep -c "How long does delivery take?" /tmp/final-homepage.html
```

Expected: every "present" check returns `1` or more (`2` for the FAQ entries, since they appear in both the visible section and the JSON-LD script), and both "removed" checks (`Flat 10% Off`, `An Invitation to Artists`) return `0`.

- [ ] **Step 3: Stop the dev server**

```bash
kill %1
```

- [ ] **Step 4: Report what still needs a human/browser check**

No browser is available in this environment. Note explicitly in the task report that the following need the user's own manual verification in an actual browser, since curl/grep can confirm content presence but not visual/interactive behavior:
- Framer Motion animations actually look right (Trust Bar stagger, Journey scroll-line fill and step reveals, True Artistry fade-in) — timing, easing, and the scroll-progress line specifically.
- Currency dropdown switching actually updates the hero price-anchor line live (content-presence check only confirmed the default INR render).
- The About Us and Design Together panels' sticky-scroll pinning behavior looks right at each breakpoint.
- Mobile layout of the Trust Bar's 5-item wrap and the Journey timeline.

This task produces no commit — it's verification only.

---

## Self-Review Notes

- **Spec coverage:** every numbered item in the design spec's section-by-section table (Hero price anchor, Trust Bar, Journey, Bestsellers copy, Collections copy, True Artistry animation, About Us panel, Design Together panel, Artist Invitation shrink, FAQ additions, page.tsx reassembly) has a corresponding task. Shop by Room and hero-image rotation are correctly excluded per the spec's Out of Scope section. The Marathi/Hindi devotional-cluster addition was scoped in the spec as conditional on a matching WooCommerce category existing, to be confirmed during implementation — no task forces a new Collections tile without that confirmation, avoiding a placeholder/invented category.
- **Placeholder scan:** no TBD/TODO; every code step is complete, runnable code; every verification step has an exact command and exact expected output.
- **Type/interface consistency:** `useCurrency()`'s `formatPrice` signature (Task 2) matches its real definition in `CurrencyProvider.tsx` exactly. All new components (`TrustBar`, `ArtaceJourney`, `AboutUsPanel`, `DesignTogetherPanel`, `HeroPriceAnchor`) are zero-prop default exports, consistent with how Task 11 renders them (no props passed). The Cal.com link and `/shop` "See Collection" destination are consistent across Tasks 4 and 5 (both resolved concretely during planning, not left as an open question for the implementer).
- **Workflow constraint:** every task ends with an explicit "do not commit" note instead of a commit step, per this project's established convention (the user handles all commits/pushes).
