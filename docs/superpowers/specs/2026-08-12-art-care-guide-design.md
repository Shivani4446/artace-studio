# Art Care Guide Landing Page — Design

## Context

The user asked for an SEO-rich Art Care landing page, referencing
`crafttatva.com/pages/art-care` for inspiration, with links placed across
the site wherever relevant. This is a pure content/SEO page — no form, no
payment, no new backend — the simplest category of feature built this
engagement.

Two things discovered during research, before any content was written:

- `SEO-audit.txt` already lists **"Painting Care & Maintenance Guide"** as
  a recommended SEO quick-win (low effort, customer-retention + SEO
  value) — this page is literally executing a gap the site's own audit
  already flagged.
- Every product page already has a short, live **"Care Instructions"**
  tab (`components/singleproduct/SingleProduct.tsx:1469-1486`): dust
  monthly with a dry soft cloth, a lightly damp cloth every 6 months,
  avoid soap/detergents/chemicals, keep away from direct sunlight and
  damp walls. The new page must stay consistent with this existing copy,
  not contradict it, and is the natural place to link out to the fuller
  guide.

The reference page (`crafttatva.com/pages/art-care`, fetched and
summarized before designing) is a thin, 3-section guide: General Wall
Art, Canvas Wall Art, Artworks on Paper — covering storage, cleaning,
framing, transport, and a "consult a professional, don't DIY-restore"
note. Useful as a structural starting point; this page goes further.

Decisions reached with the user before writing this spec:

- **Medium-specific sections** (Canvas / Framed Photography & Prints /
  Custom Portraits), not one undifferentiated guide — matches how the
  site's own product pages already differ by type and gives more SEO
  surface area than the reference page's approach.
- **Add India-specific content** not present on the reference page:
  monsoon humidity/climate control and pest prevention — genuinely useful
  to this market and a real differentiator.
- **No specific restoration/reframing service to promote.** "If your
  artwork is damaged, consult a professional conservator" stays generic —
  no named or linked service, per the user's explicit choice.

## Decisions

### 1. Route and metadata

`/art-care` — new top-level route, sibling to `/reviews`, `/trade`,
`/custom-portraits`.

- Title: "Art Care Guide – How to Clean, Store & Protect Your Paintings |
  Artace Studio"
- Description targets "how to care for paintings/canvas art in India,"
  mentions cleaning, framing, humidity.
- `alternates.canonical` via `buildSiteUrl("/art-care")`, matching every
  other content page.
- `FAQPage` JSON-LD built from the same `FAQ_ITEMS` array the page
  renders (same `<script type="application/ld+json"
  dangerouslySetInnerHTML>` pattern already live on
  `app/rooms/bedroom/page.tsx` and used again on `app/custom-portraits/page.tsx`).

### 2. Page sections (top to bottom, all stacked — no tabs)

Stacked sections rather than an interactive tab switcher (like the
reference page effectively uses): keeps every word of content in the DOM
and crawlable, matches how every other content page this engagement
(`/reviews`, `/trade`, `/custom-portraits`) is built, and needs no new
interactive component.

1. **Hero** — "Art Care Guide," same dark branded hero pattern as
   `/reviews` / `/trade` / `/custom-portraits`. Sub-line: "Simple steps to
   keep your hand-painted artwork looking beautiful for years."
2. **General Care Basics** — cleaning (dry soft cloth monthly, lightly
   damp cloth every 6 months, never soap/detergents/solvents — verbatim
   consistent with the existing product-page Care Instructions tab),
   sunlight/UV placement, careful transport/handling (frame edges or
   stretcher bars, never the painted surface; two people for large
   pieces), storage (don't leave rolled in a packaging tube long-term).
3. **Caring for Art in India's Climate** — monsoon humidity control,
   avoiding exterior/damp walls, silica packs/dehumidifiers in humid
   rooms, periodic backing checks; pest prevention (keep away from
   wood-boring-insect-prone furniture, inspect frames periodically, avoid
   damp storage areas where pests thrive).
4. **Canvas Paintings** — never frame under glass (canvas needs to
   breathe), extra stretcher-bar support for mid-to-large pieces to
   prevent warping/cracking.
5. **Framed Photography & Prints** — non-glare, UV-protective glass,
   acid-free mats and backing to prevent yellowing/moisture damage.
6. **Custom Portraits** — same medium-specific guidance as above
   (canvas or paper, depending on what was ordered), plus a short note on
   long-term/heirloom care since portraits are typically a one-off,
   sentimental piece.
7. **When to Call a Professional** — damage, mold, tears, or flaking
   paint → don't DIY-repair, consult a professional art conservator
   (generic advice, no service named/linked, per the user's decision).
8. **FAQ** — reuses `components/seo/FAQSection.tsx`, 10 questions (listed
   in full below).
9. **Cross-link CTA** — "Shopping for a new piece?" → `/shop`;
   "Commissioning something custom?" → `/custom-portraits`.

### 3. FAQ content (final, to be used verbatim)

1. **How often should I clean my painting or framed artwork?** — Dust it
   gently with a soft, dry cloth about once a month. A lightly damp cloth
   every 6 months is enough to remove finer dust for most pieces.
2. **Can I clean my artwork with water or cleaning products?** — No —
   avoid soap, detergents, disinfectants, and solvents, as they can
   damage pigments and varnish. Use only a dry or lightly damp soft
   cloth.
3. **Where's the best place to hang a painting?** — Away from direct
   sunlight and away from walls prone to dampness or leakage. Prolonged
   UV exposure fades pigments over time.
4. **How do I protect artwork during India's monsoon season?** — Keep it
   away from exterior or damp-prone walls, use a dehumidifier or silica
   packs in humid rooms, and check framed backing for trapped moisture
   periodically.
5. **How do I prevent pests from damaging my artwork?** — Keep artwork
   away from furniture prone to wood-boring insects, inspect frames and
   backing periodically, and avoid storing pieces in damp basements or
   attics where pests thrive.
6. **Can canvas paintings be framed under glass?** — No — canvas needs to
   breathe. Framing it under glass traps moisture and can damage the
   surface over time.
7. **What's the right glass for framed photography or prints?**
   — Non-glare, UV-protective glass, paired with acid-free mats and
   backing to prevent yellowing or moisture damage over time.
8. **How should I transport or move a painting?** — Hold it by the frame
   edges or stretcher bars, never the painted surface. For larger pieces,
   two people carrying it is best.
9. **What should I do if my artwork is damaged or shows signs of mold or
   flaking paint?** — Don't attempt a DIY repair — consult a professional
   art conservator or restorer.
10. **How long can I leave a painting rolled in its packaging tube?**
    — Not long-term — unroll and mount or frame it as soon as you can to
    avoid surface cracking or creasing.

## Link placements across the site

- **Navbar** — add `{ name: "Art Care Guide", href: "/art-care",
  description: "Simple steps to keep your artwork looking beautiful for
  years." }` to the existing `resourceLinks` array
  (`components/navbar.tsx:36-63`), right after "Blogs."
- **Footer** — add `{ label: "Art Care Guide", href: "/art-care" }` to
  the `"Resources"` section's `links` array (`components/footer.tsx`),
  alongside About Us / Team / Painting Categories / Warli Paintings.
- **Product page "Care Instructions" tab**
  (`components/singleproduct/SingleProduct.tsx:1469-1486`) — append one
  new line/link after the existing 4 paragraphs: "Read our full [Art
  Care Guide](/art-care) for more tips →". Highest-intent placement:
  shown only to people already reading care information.
- **About Us — `OurCommitment` section**
  (`components/About/OurCommitment.tsx`) — one small link line under the
  existing paragraph: "Learn how to care for your artwork →" pointing to
  `/art-care`. Minimal, additive change to an already-short section, not
  a rewrite.

## Out of scope

- No interactive tab UI for the medium-specific sections (stacked
  instead, per the Decisions section).
- No named/linked restoration or reframing service — generic
  "consult a professional" advice only, per the user's explicit choice.
- No changes to the existing product-page Care Instructions copy itself
  beyond appending one link line — the existing 4 paragraphs stay as-is
  since the new guide is written to stay consistent with them.
- No blog post — this is a standalone landing page, not journal content,
  matching how `/reviews`, `/trade`, and `/custom-portraits` were built.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit` and live
  dev-server checks on a fresh port, never touching port 3000 (check
  `netstat -ano | grep ":3000"` first).
