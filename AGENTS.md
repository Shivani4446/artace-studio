# AGENTS.md

## Project Overview
- **Framework**: Next.js 16.1.4 with React 19
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

- TypeScript build errors in `.next/dev/types/` - these are pre-existing issues with API route type generation, not related to new features
- Some pre-existing lint errors in `app/blog-test/page.tsx`, `app/rentals/page.tsx`

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