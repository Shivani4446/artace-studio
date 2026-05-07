# Coding Conventions

**Analysis Date:** 2026-04-17

## Technology Stack

- **Framework**: Next.js 16.1.4 with React 19.2.3
- **Styling**: Tailwind CSS 4 with @tailwindcss/postcss
- **Language**: TypeScript 5 (strict mode enabled)
- **Linting**: ESLint 9 with eslint-config-next/typescript
- **Icons**: Lucide React 0.563.0

## File Structure

### App Router (Next.js)
```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Homepage (uses (home) route group)
├── (home)/
│   └── page.tsx
├── shop/
│   ├── page.tsx          # Shop catalog
│   └── [slug]/
│       └── page.tsx       # Single product page
├── api/                   # API routes (auth, checkout, store)
├── blog-test/
├── rentals/
└── [section]/
    └── page.tsx          # Route-based page
```

### Components
```
components/
├── navbar.tsx             # Root navigation (1240+ lines)
├── footer.tsx
├── shop/
│   ├── ShopCatalog.tsx   # 1225 lines
│   └── types.ts
├── singleproduct/
│   └── SingleProduct.tsx
├── auth/                  # Auth flow components
│   ├── AuthSessionProvider.tsx
│   ├── LoginForm.tsx
│   ├── LoginPageShell.tsx
│   ├── SignupForm.tsx
│   ├── SignupPageShell.tsx
│   ├── ResetPasswordForm.tsx
│   ├── ResetPasswordPageShell.tsx
│   ├── ForgotPasswordForm.tsx
│   └── LogoutButton.tsx
├── cart/
│   ├── CartProvider.tsx   # Context provider (183 lines)
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
├── homepage/              # Feature-scoped
│   ├── HeroSection.tsx
│   ├── ShopBestSellers.tsx
│   ├── DiscoverEssentials.tsx
│   ├── JournalSection.tsx
│   ├── ArtistInvitation.tsx
│   ├── Testimonials.tsx
│   ├── ShopByArtist.tsx
│   ├── TrueArtistrySection.tsx
│   └── PromotionalBanner.tsx
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
├── jwt.ts                # JWT verification
├── wordpress-auth.ts    # WordPress API client
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

### Schema Module
```
lib/schema/
├── types.ts              # TypeScript interfaces
├── product.ts           # Main product schema
├── offer.ts             # Price/availability
├── aggregate-rating.ts  # Star ratings
├── review.ts            # Individual reviews
└── breadcrumb.ts       # Navigation breadcrumbs
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `ShopCatalog.tsx`, `AddToCartButton.tsx`)
- **Utilities**: camelCase (e.g., `auth.ts`, `gtm.ts`, `collections.ts`)
- **Types**: co-located with components or in `types.ts` files
- **API Routes**: kebab-case directories (e.g., `app/api/auth/login/route.ts`)

### Components
- **React Components**: PascalCase (e.g., `Navbar`, `CartProvider`)
- **Props Types**: `{ComponentName}Props` (e.g., `ShopCatalogProps`)
- **Event Handlers**: `handle{Event}` (e.g., `handleSearchSubmit`)
- **Custom Hooks**: `use{Noun}` (e.g., `useCart`, `useWishlist`, `useAuthSession`)

### Variables & Functions
- **Variables**: camelCase (e.g., `items`, `subtotal`, `isMobileMenuOpen`)
- **Constants**: PascalCase for enum-like values
- **Functions**: camelCase with action prefixes (`get`, `fetch`, `build`, `parse`, `normalize`)

### Types
- **TypeScript interfaces**: PascalCase (e.g., `CartProduct`, `CartItem`, `SearchSuggestion`)
- **Type aliases**: PascalCase (e.g., `DesktopMenuId`, `MobileMenuLink`, `CartContextValue`)

## Code Patterns

### TypeScript Strict Mode
All strict checks enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "target": "ES2017"
  }
}
```

### Client/Server Components
- Server Components default (no "use client" directive)
- Client Components marked with `"use client"` at file top
- Route handlers in `app/api/*/route.ts`

### React Patterns
- Context for global state (Cart, Wishlist, Auth Session)
- Custom hooks co-located with provider components
- Memoization with `useMemo` for expensive computations
- Event cleanup with cleanup functions in `useEffect` return
- try/catch for JSON parsing with empty state returns

### CSS/Tailwind
- Tailwind utility classes for styling
- Custom design tokens (colors in hex: #1f1f1f, #f4f2ee)
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Conditional classes with template literals

```typescript
className={`grid ${
  isSingleRowLayout
    ? "grid-cols-[42%_58%]"
    : ""
}`}
```

### Error Handling

**Context providers throw if used outside:**
```typescript
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
```

**try/catch for JSON parsing:**
```typescript
const parseStoredCart = (value: string | null): CartItem[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(...).map(...);
  } catch {
    return [];
  }
};
```

**Empty state returns:**
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

### API Integration
- WooCommerce Store API v1 (`/wc/store/v1/products`) for products
- WooCommerce REST API v3 (`/wc/v3/products/*`) for admin operations
- WordPress REST API for blog/content
- JWT-based authentication with WordPress
- Google Tag Manager for tracking via utility functions

### State Management
- React Context for: Cart, Wishlist, Auth Session
- URL search params for catalog filters
- Local component state for UI interactions
- localStorage for persistence (Cart, Wishlist)

## Import Organization

**Order:**
1. React imports: `useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`, `useRef`, `createContext`, `React`
2. Next.js imports: `Link`, `Image`, `useRouter` from `next/navigation`
3. Third-party: `lucide-react` icons
4. Internal components: `@/components/...`
5. Internal utilities: `@/utils/...`

**Path Aliases:**
- `@/*` maps to project root: `"./*"`

**Example from `components/navbar.tsx`:**
```typescript
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, ShoppingCart, Heart, Menu, X, Plus, Minus, ... } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { collectionLinkItems, getCollectionHref } from "@/utils/collections";
```

## ESLint Configuration

**Config in `eslint.config.mjs`:**
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

- Uses `eslint-config-next/core-web-vitals` preset
- Uses `eslint-config-next/typescript` for TypeScript rules
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Line Counts (Notable Files)
- `components/navbar.tsx`: 1240+ lines
- `components/shop/ShopCatalog.tsx`: 1225 lines
- `app/shop/[slug]/page.tsx`: 826 lines
- `utils/auth.ts`: 308 lines
- `components/cart/CartProvider.tsx`: 183 lines

---

*Convention analysis: 2026-04-17*