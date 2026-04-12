# Code Conventions

## Overview
This document outlines the code conventions, patterns, and structural guidelines used in the Artace Studio codebase.

## Technology Stack
- **Framework**: Next.js 16.1.4 (App Router with TypeScript)
- **Styling**: Tailwind CSS 4 with @tailwindcss/postcss
- **Language**: TypeScript (strict mode enabled)
- **Linting**: ESLint 9 with eslint-config-next
- **Icons**: Lucide React 0.563.0

## File Structure

### App Router (Next.js)
```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Homepage (uses (home) route group)
├── (home)/
│   └── page.tsx
│   └── homepage-schema.ts  # JSON-LD schema
├── shop/
│   ├── page.tsx          # Shop catalog
│   └── [slug]/
│       └── page.tsx       # Single product page
├── api/                   # API routes
│   ├── auth/
│   ├── checkout/
│   ├── store/
│   └── ...
└── [section]/
    └── page.tsx          # Route-based page
```

### Components
```
components/
├── navbar.tsx             # Root components
├── footer.tsx
├── shop/
│   ├── ShopCatalog.tsx   # 1225 lines
│   └── types.ts
├── singleproduct/
│   └── SingleProduct.tsx
├── auth/
│   ├── AuthSessionProvider.tsx
│   ├── LoginForm.tsx
│   ├── LoginPageShell.tsx
│   ├── SignupForm.tsx
│   ├── SignupPageShell.tsx
│   ├── ResetPasswordForm.tsx
│   ├── ResetPasswordPageShell.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── LogoutButton.tsx
│   └── ...
├── cart/
│   ├── CartProvider.tsx    # Context provider
│   └── AddToCartButton.tsx
├── wishlist/
│   └── WishlistProvider.tsx
├── account/
│   ├── DashboardShell.tsx
│   ├── DashboardOverview.tsx
│   ├── DashboardProfile.tsx
│   ├── DashboardOrders.tsx
│   ├── DashboardDetails.tsx
│   └── AccountDetailsForm.tsx
├── homepage/             # Feature-scoped
│   ├── HeroSection.tsx
│   ├── ShopBestSellers.tsx
│   ├── DiscoverEssentials.tsx
│   ├── JournalSection.tsx
│   ├── ArtistInvitation.tsx
│   ├── Testimonials.tsx
│   ├── ShopByArtist.tsx
│   ├── TrueArtistrySection.tsx
│   └── PromotionalBanner.tsx
├── blog/
├── blogarchive/
├── singleblog/
├── article/
├── collections/
├── corporate/
├── custom-order/
├── about/
└── ui/                   # Reusable UI
    ├── CustomDropdown.tsx
    ├── PromotionModal.tsx
    └── ProtectedImage.tsx
```

### Utilities
```
utils/
├── auth.ts               # 308 lines - WordPress JWT auth
├── jwt.ts               # JWT verification
├── wordpress-auth.ts   # WordPress API client
├── woocommerce-checkout.ts
├── woocommerce-orders.ts
├── razorpay.ts
├── checkout-client.ts
├── collections.ts
├── text.ts
├── article.ts
├── gtm.ts
└── search.ts
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `ShopCatalog.tsx`, `AddToCartButton.tsx`)
- **Utilities**: kebab-case (e.g., `auth.ts`, `woocommerce-checkout.ts`)
- **Types**: co-located with components or in `types.ts` files (e.g., `components/shop/types.ts`)
- **API Routes**: kebab-case directories (e.g., `app/api/auth/login/route.ts`)

### Components
- **React Components**: PascalCase
- **Props Types**: `{ComponentName}Props` (e.g., `ShopCatalogProps`)
- **Event Handlers**: `handle{Event}` (e.g., `handleSearchSubmit`)

### Variables & Functions
- **Variables**: camelCase
- **Constants**: PascalCase for enum-like values, kebab-case for config objects
- **Functions**: camelCase with action prefixes (`get`, `fetch`, `build`, `parse`, `normalize`)

## Code Patterns

### TypeScript Strict Mode
- All strict checks enabled in `tsconfig.json`
- Explicit return types on exported functions
- Type guards for runtime checks

```typescript
// Example: Type guard pattern
type ShopCatalogApiResponse = {
  products?: ShopProduct[];
  error?: string;
};

const isValidResponse = (data: unknown): data is ShopCatalogApiResponse => {
  return typeof data === "object" && data !== null && "products" in data;
};
```

### Client/Server Components
- Server Components default (no "use client")
- Client Components marked with "use client" at file top
- Route handlers in `app/api/*/route.ts`

### React Patterns
- Context for global state (Cart, Wishlist, Auth)
- Custom hooks in provider components
- Memoization with `useMemo` for expensive computations
- Event cleanup with cleanup functions in `useEffect`

### CSS/Tailwind
- Tailwind utility classes for styling
- Custom design tokens (colors in hex: #1f1f1f, #f4f2ee)
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Conditional classes with template literals

```typescript
// Example: Conditional classes
className={`grid ${
  isSingleRowLayout
    ? "grid-cols-[42%_58%]"
    : ""
}`}
```

### API Integration
- WooCommerce Store API v1 for products
- WooCommerce REST API v3 for admin operations
- WordPress REST API for blog/content
- JWT-based authentication with WordPress

## Key Patterns

### Data Fetching (Server Components)
```typescript
const getSingleProduct = async (slug: string): Promise<WooStoreProduct | null> => {
  const payload = await fetchStoreProducts(`slug=${encodeURIComponent(slug)}&per_page=1`);
  return Array.isArray(payload) && payload.length > 0 ? payload[0] : null;
};
```

### Error Handling
```typescript
try {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return [];
  const payload = await response.json() as TypeName;
  return payload;
} catch {
  return [];
}
```

### URL Resolution
```typescript
const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};
```

### Authentication Flow
- JWT token stored in HTTP-only cookie (`artace_wp_session`)
- 14-day max age
- Local JWT verification when secret is configured
- Fallback to WordPress user validation

### State Management
- React Context for: Cart, Wishlist, Auth Session
- URL search params for catalog filters
- Local component state for UI interactions

## ESLint Configuration
- Uses `eslint-config-next` core-web-vitals preset
- TypeScript rules from `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`

## Line Counts (Notable Files)
- `components/shop/ShopCatalog.tsx`: 1225 lines
- `components/navbar.tsx`: 1240+ lines
- `app/shop/[slug]/page.tsx`: 826 lines
- `utils/auth.ts`: 308 lines
- `components/shop/types.ts`: 26 lines
