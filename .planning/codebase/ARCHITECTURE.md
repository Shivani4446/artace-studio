# Architecture Overview

## Application Architecture

Artace Studio is a Next.js 16.1.4 e-commerce application built on the App Router paradigm. The architecture follows a modular, component-driven design with clear separation between presentation, business logic, and external integrations.

## Architecture Patterns

### 1. Server-Side Rendering (SSR) with Edge Runtime

Pattern: Server Components + Edge Functions

- Pages fetch data on the server using async components
- API routes use Edge runtime for low-latency responses
- Search, checkout, and auth routes execute on Edge

Files:
- app/(home)/page.tsx (130 lines) - Homepage with category discovery
- app/shop/[slug]/page.tsx (826 lines) - Product detail with variations/FAQs
- app/api/search/route.ts (73 lines) - Edge search endpoint
- app/api/checkout/route.ts (250 lines) - Edge checkout handler

### 2. Client-Side State Management

Pattern: React Context + LocalStorage

- CartProvider (components/cart/CartProvider.tsx, 183 lines) - Cart state with localStorage persistence
- WishlistProvider (components/wishlist/WishlistProvider.tsx) - Wishlist state
- AuthSessionProvider (components/auth/AuthSessionProvider.tsx, 104 lines) - User session state

State Flow:
User Action -> Context API -> Update State -> Sync to localStorage/API

### 3. Service Layer Pattern

Pattern: Utility modules as service adapters

Services:
- utils/auth.ts (308 lines) - WordPress JWT authentication
- utils/razorpay.ts (200 lines) - Payment gateway integration
- utils/woocommerce-checkout.ts (333 lines) - WooCommerce order management
- lib/search.ts (202 lines) - Unified search across products/blogs/collections

## Data Flow

### Request Flow

User Request -> Next.js Edge/Server Function -> External APIs (WooCommerce, WordPress, Supabase) -> Response to Client

### Checkout Flow

1. User adds item to cart (CartProvider)
2. User proceeds to checkout (/checkout)
3. POST /api/checkout with cart items + address
4. Server validates auth session
5. Creates WooCommerce order
6. Creates Razorpay payment order
7. Returns Razorpay config to client
8. Client completes payment
9. POST /api/razorpay/webhook confirms payment

Key Files:
- app/checkout/page.tsx - Checkout page
- app/api/checkout/route.ts - Order creation
- app/api/checkout/verify/route.ts - Payment verification
- app/api/razorpay/webhook/route.ts - Payment webhook

### Authentication Flow

1. User submits credentials to /api/auth/login
2. Server authenticates with WordPress JWT endpoint
3. Returns access token in HTTP-only cookie (artace_wp_session)
4. Client hydrates session via /api/auth/session
5. Protected routes check session via AuthSessionProvider

Key Files:
- app/api/auth/login/route.ts - Login endpoint
- app/api/auth/register/route.ts - Registration
- app/api/auth/session/route.ts - Session retrieval
- utils/auth.ts - Auth utilities

## Key Abstractions

### 1. Collection System (utils/collections.ts, 84 lines)

CollectionLinkItem -> getCollectionHref() -> /collections/{slug}

Provides theme mapping and link generation for painting collections (Ganapati, Radha Krishna, Buddha, Landscapes).

### 2. Search Service (lib/search.ts, 202 lines)

fetchSearchResults(query, { productLimit, blogLimit })
  -> WooCommerce Store API (products)
  -> WordPress REST API (blogs)
  -> Static collections/pages
  -> Returns unified SearchProduct[], SearchBlogPost[]

### 3. Checkout Utilities (utils/woocommerce-checkout.ts, 333 lines)

- createWooCommerceOrder() - Create order via WC REST API
- updateWooCommerceOrder() - Update order metadata
- parseAmountToMinorUnits() - Convert to paise
- sanitizeText() - Input validation

### 4. Payment Gateway (utils/razorpay.ts, 200 lines)

- createRazorpayOrder() - Create payment order
- verifyRazorpayPaymentSignature() - Client-side verification
- verifyRazorpayWebhookSignature() - Server-side verification

## External Integrations

Service | Purpose | API
--------|---------|-----
WooCommerce | Product catalog, orders, payments | REST API v3 / Store API v1
WordPress | Blog posts, authentication | REST API v2
Razorpay | Payment processing | Orders API
Supabase | Custom orders, image storage | Client SDK
Google Tag Manager | Analytics tracking | Third-party script

## Security Patterns

Auth Cookie:
- Name: artace_wp_session
- HttpOnly: true
- SameSite: lax
- Secure: production only
- Max-Age: 14 days

Input Sanitization (woocommerce-checkout.ts):
- sanitizeText(value: unknown) -> string
- ensurePositiveInt(value: unknown) -> number | null

Edge Runtime Security:
- All API routes use runtime = edge
- WebCrypto for HMAC-SHA256 signatures
- No server-side secrets exposed to client

## Component Architecture

Layout Components:
- app/layout.tsx (130 lines) - Root layout with providers
- components/navbar.tsx (1200+ lines) - Navigation with search/cart
- components/footer.tsx - Site footer

Feature Components (by domain):
- Homepage: HeroSection, ShopBestSellers, DiscoverEssentials, Testimonials
- Shop: ShopCatalog, SingleProduct
- Blog: BlogArchiveCatalog, SingleBlogContent
- Cart: CartProvider, AddToCartButton
- Account: DashboardShell, DashboardOrders, DashboardProfile

UI Components:
- components/ui/CustomDropdown.tsx
- components/ui/PromotionModal.tsx
- components/ui/ProtectedImage.tsx

## File Organization

app/                    # Next.js App Router
  (home)/              # Homepage route group
  api/                 # API routes
    auth/              # Authentication endpoints
    checkout/          # Checkout flow
    razorpay/          # Payment webhooks
  shop/               # Product pages
  blogs/              # Blog pages
  dashboard/          # User dashboard
  collections/        # Collection pages

components/            # React components
  homepage/           # Homepage sections
  shop/               # Shop components
  cart/               # Cart functionality
  auth/               # Auth components
  account/            # User dashboard

utils/                 # Business logic
  auth.ts             # Authentication
  razorpay.ts         # Payments
  woocommerce-checkout.ts  # E-commerce

lib/                   # Shared services
  search.ts           # Search service