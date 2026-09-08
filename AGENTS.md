# AGENTS.md

> **Related project docs:** [Website-pages.md](Website-pages.md) is the most current, actively-maintained running log of this engagement's work — check there first. [features-context.md](features-context.md) has deeper session conventions and WooCommerce API notes. [PROJECT-RESUME.md](PROJECT-RESUME.md) is a business/product overview. [Samora-context.md](Samora-context.md) covers the separate Samora sub-brand. [suggestion.md](suggestion.md) tracks the SEO/technical/feature improvement backlog. If any two docs disagree on a fact, trust Website-pages.md and this file's own git history over either.

## Project Overview
- **Framework**: Next.js 15.5.2 with React 19
- **Styling**: Tailwind CSS 4
- **Backend**: Headless WooCommerce (REST API)
- **Payments**: Razorpay




## Developer Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Key Directories

| Path | Purpose |
|------|---------|
| `app/shop/[slug]/` | Product detail pages |
| `lib/schema/` | Schema generators (product, offer, rating, review, breadcrumb) |
| `lib/api-route-handlers/` | API routes (checkout, auth, orders) |
| `components/` | React components |

## WooCommerce Integration

- **Store API**: `/wc/store/v1/products` (public, no auth)
- **REST API**: `/wc/v3/products/*` (requires `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET`)
- API config: `app/shop/[slug]/page.tsx` (lines 150-161)

## Known Issues

- TypeScript noise in `.next/dev/types/`/`.next/types/` — stale dev-cache artifacts, not real errors; they clear on a fresh `next build`.
- ~~Some pre-existing lint errors in `app/blog-test/page.tsx`, `app/rentals/page.tsx`~~ — fixed (see `suggestion.md` §2.1). `next.config.ts` now enforces both `tsc` and lint at build time (`ignoreBuildErrors`/`ignoreDuringBuilds` are both `false`) — a real error fails the build again instead of shipping silently.

## Schema Module

Schema files are in `lib/schema/`:
- `types.ts` - TypeScript interfaces
- `product.ts` - Main product schema
- `offer.ts` - Price/availability
- `aggregate-rating.ts` - Star ratings
- `review.ts` - Individual reviews
- `breadcrumb.ts` - Navigation breadcrumbs

Product schema is integrated via `generateMetadata` in `app/shop/[slug]/page.tsx`.

## Skills

This repo uses Superpowers skills from `C:/Users/sahil/AppData/Roaming/opencode/plugins/superpowers/skills`. Check for relevant skills before implementing features.