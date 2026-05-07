# Architecture

**Analysis Date:** 2026-04-17

## Pattern Overview

**Overall:** Next.js App Router with Hybrid Rendering and Component Composition

**Key Characteristics:**
- Server Components for data fetching (async/await in page components)
- Client Components for interactivity (useState, useEffect)
- API routes integrated within app directory using Route Handlers
- Schema-first approach for SEO and structured data generation
- Context providers for cross-cutting state management (auth, cart, wishlist)

## Layers

**Presentation Layer:**
- Purpose: Handles UI rendering and user interactions
- Location: `app/` and `components/`
- Contains: React components, page layouts, UI elements
- Depends on: Business logic layer, data access layer, utility functions
- Used by: End users via browser

**Business Logic Layer:**
- Purpose: Encapsulates application rules and workflows
- Location: `lib/` directory and utility functions within components
- Contains: API route handlers, schema generators, data processing functions
- Depends on: Data access layer, external services (WooCommerce)
- Used by: Presentation layer, API routes

**Data Access Layer:**
- Purpose: Manages communication with external data sources
- Location: `app/api/` (API routes), `lib/api-route-handlers/`, `lib/schema/`
- Contains: WooCommerce API clients, data fetchers, schema generators
- Depends on: External APIs (WooCommerce REST/Store API, WordPress REST API)
- Used by: Business logic layer, presentation layer

**Infrastructure Layer:**
- Purpose: Provides foundational services and configurations
- Location: `lib/` utilities, `next.config.ts`, middleware
- Contains: Site utilities, authentication providers, configuration helpers
- Depends on: External services (environment variables, third-party APIs)
- Used by: All other layers

## Data Flow

**[Product Detail Page Flow]:**

1. **Request:** User navigates to `/shop/[slug]` (e.g., `/shop/handmade-painting`)
2. **Route Resolution:** Next.js matches dynamic route `app/shop/[slug]/page.tsx`
3. **Data Fetching:** Server Component executes `getSingleProduct()` to fetch from WooCommerce Store API
4. **Enrichment:** Additional data fetched in parallel:
   - Product variations (WooCommerce REST API)
   - FAQs (WooCommerce REST API)
   - Product information (multiple ACF/WooCommerce sources)
   - Related products (WooCommerce Store API)
   - Latest blog posts (WordPress REST API)
5. **Schema Generation:** `generateProductSchema()` creates JSON-LD for SEO
6. **Rendering:** Server Component renders HTML with embedded schema
7. **Hydration:** Client-side React takes over for interactivity
8. **Response:** Complete page delivered to browser

**[Form Submission Flow (e.g., Contact Form)]:**

1. **User Action:** Form submission in UI component
2. **Client Handler:** Form validation and state update
3. **API Call:** POST request to `app/api/contact/route.ts`
4. **Processing:** API route handler validates and processes data
5. **External Integration:** May send email via third-party service
6. **Response:** Success/error returned to client
7. **UI Update:** Component reflects submission status

**State Management:**
- Primarily React state (useState, useReducer) at component level
- Context providers for cross-cutting concerns:
  - `CartProvider`: Shopping cart state
  - `WishlistProvider`: User wishlist state
  - `AuthSessionProvider`: Authentication state
- Server-side state limited to request scope (no global state)
- Client-side state managed within individual components or contexts

## Key Abstractions

**[WooCommerce Abstraction]:**
- Purpose: Encapsulates all WooCommerce API interactions
- Examples: 
  - `app/api-route-handlers/` - Route-specific API handlers
  - `lib/schema/` - Schema generation abstractions
  - Functions in `app/shop/[slug]/page.tsx` - Product data fetching
- Pattern: Service functions that map internal data models to WooCommerce API responses
- Centralized configuration via `getWooServerConfig()` and `getApiBaseUrl()`

**[Schema Abstraction]:**
- Purpose: Generates structured data for SEO and rich snippets
- Examples: `lib/schema/product.ts`, `lib/schema/offer.ts`, etc.
- Pattern: Generator functions that accept product data and return JSON-LD objects
- Used in: `generateMetadata()` in page components via `generateProductSchema()`

**[Utility Abstraction]:**
- Purpose: Common functions reused across the application
- Examples: `utils/text.ts` (HTML decoding, string manipulation)
- Pattern: Pure functions with clear inputs/outputs, minimal side effects
- Organization: Grouped by concern in `utils/` directory

## Entry Points

**[Root Layout]:**
- Location: `app/layout.tsx`
- Triggers: Every page request (root layout)
- Responsibilities: 
  - Provides global providers (Auth, Cart, Wishlist)
  - Sets up metadata and SEO tags
  - Loads global styles and fonts
  - Wraps children with shared UI components (Navbar, Footer)

**[Page Routes]:**
- Location: `app/*/page.tsx` (e.g., `app/(home)/page.tsx`, `app/shop/[slug]/page.tsx`)
- Triggers: Navigation to specific URL path
- Responsibilities:
  - Fetch data required for the route
  - Generate metadata (title, description, OpenGraph)
  - Compose and render page-specific UI
  - Handle route-specific logic (revalidation, dynamic params)

**[API Routes]:**
- Location: `app/api/*/route.ts` (e.g., `app/api/contact/route.ts`)
- Triggers: HTTP requests to `/api/*` endpoints
- Responsibilities:
  - Process HTTP requests (GET, POST, etc.)
  - Validate and sanitize input data
  - Interact with external services or databases
  - Return appropriate HTTP responses
  - Handle errors and edge cases

**[Middleware]:**
- Location: `middleware.ts`
- Triggers: Every request before route resolution
- Responsibilities:
  - Request preprocessing (redirects, rewrites)
  - Authentication/authorization checks
  - Header manipulation
  - Logging and monitoring

## Error Handling

**Strategy:** Layered approach with boundary-specific handling

**Patterns:**
- **API Routes:** Try/catch blocks returning appropriate HTTP status codes (400, 500) with JSON error responses
- **Server Components:** Error boundaries via `try/catch` around data fetching, graceful degradation to empty states/fallbacks
- **Client Components:** React error boundaries where applicable, console.error for development
- **Validation:** Input validation at API layer with specific error messages
- **External Services:** Fallback values and empty arrays when services fail (e.g., WooCommerce API downtime)

## Cross-Cutting Concerns

**Logging:** 
- Console.log statements in development for debugging
- Third-party analytics (Google Tag Manager, Ahrefs, Facebook Pixel) in layout
- No centralized logging infrastructure detected

**Validation:**
- Form validation in UI components (client-side)
- API route validation (server-side)
- WooCommerce data validation in fetchers
- Zod or similar validation library not detected - manual validation patterns

**Authentication:**
- AuthSessionProvider context manages auth state
- Protected routes check authentication status
- WooCommerce API endpoints require consumer key/secret from environment
- No detected authentication middleware for Next.js routes

---
*Architecture analysis: 2026-04-17*