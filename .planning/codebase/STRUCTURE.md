# Codebase Structure

**Analysis Date:** 2026-04-17

## Directory Layout

```
E:/ARTACE-STUDIOS/artace-studio/artace-studio/
├── app/                    # Next.js App Router (pages, layouts, API)
├── components/            # React components by feature
├── utils/                 # Business logic and service adapters
├── lib/                   # Shared services, schemas, route handlers
├── public/                # Static assets
├── supabase/              # Database schemas
├── .planning/codebase/    # Documentation
└── .agents/skills/        # Custom skills
```

## Directory Purposes

**app/:**
- Purpose: All routes - pages, layouts, API endpoints
- Contains: 40+ page.tsx files, layout.tsx files, API route files
- Key files: `app/(home)/page.tsx`, `app/shop/[slug]/page.tsx`, `app/layout.tsx`

**components/:**
- Purpose: React UI components organized by feature domain
- Contains: ~55 component files in 15+ feature subdirectories
- Key files: `navbar.tsx`, `footer.tsx`, `cart/CartProvider.tsx`

**utils/:**
- Purpose: Business logic and external service integrations
- Contains: 12 modules (auth, razorpay, woocommerce-checkout, etc.)
- Key files: `auth.ts` (308 lines), `woocommerce-checkout.ts` (333 lines)

**lib/:**
- Purpose: Shared services, JSON-LD schema generation, API route handlers
- Contains: search service, schema/ (product, offer, rating), api-route-handlers/
- Key files: `search.ts` (202 lines), `schema/product.ts` (112 lines)

## Key File Locations

**Entry Points:**
- Homepage: `app/(home)/page.tsx` - Main landing with category discovery
- Product Detail: `app/shop/[slug]/page.tsx` - Product page with variations/FAQs (826 lines)
- Checkout: `app/checkout/page.tsx` - Checkout flow initiation
- Dashboard: `app/dashboard/page.tsx` - User account management

**Configuration:**
- Root Layout: `app/layout.tsx` - Providers and global layout (130 lines)
- Tailwind: `tailwind.config.*` - CSS styling
- Env vars: `.env.local` - WooCommerce, Razorpay, Supabase credentials

**Core Logic:**
- Auth: `utils/auth.ts` (308 lines) - WordPress JWT authentication
- Payments: `utils/razorpay.ts` (200 lines) - Razorpay integration
- Checkout: `utils/woocommerce-checkout.ts` (333 lines) - WooCommerce order management
- Search: `lib/search.ts` (202 lines) - Unified product/blog search

**Testing:**
- No formal test suite - linting only via `npm run lint`

## Naming Conventions

**Files:**
- Components: PascalCase (`HeroSection.tsx`, `CartProvider.tsx`)
- Pages: kebab-case with route parameters (`[slug]/page.tsx`)
- Utils: camelCase (`auth.ts`, `razorpay.ts`)
- API Routes: kebab-case (`auth/login/route.ts`)

**Directories:**
- Feature folders: lowercase (`components/homepage/`, `components/cart/`)
- API handlers: kebab-case (`lib/api-route-handlers/auth/login/route.ts`)

## Where to Add New Code

**New Feature:**
- Primary code: `components/{feature-name}/`
- API routes: `app/api/{feature}/route.ts`
- Utilities: `utils/{feature}.ts`

**New Component/Module:**
- UI components: `components/ui/`
- Feature components: `components/{domain}/`
- Shared logic: `lib/` or `utils/`

**Utilities:**
- Business logic: `utils/`
- API handlers: `lib/api-route-handlers/`
- Schema generation: `lib/schema/`

## Special Directories

**app/(home)/:**
- Purpose: Homepage route group (allows different root layout)
- Generated: No
- Committed: Yes

**app/api/:**
- Purpose: All API endpoints (Edge runtime)
- Generated: No
- Committed: Yes

**lib/schema/:**
- Purpose: JSON-LD structured data for SEO
- Generated: No
- Committed: Yes

**lib/api-route-handlers/:**
- Purpose: Centralized route handler logic
- Generated: No
- Committed: Yes

**supabase/:**
- Purpose: Database schema definitions
- Generated: No
- Committed: Yes