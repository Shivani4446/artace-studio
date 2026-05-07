# External Integrations

**Analysis Date:** 2026-04-17

## APIs & External Services

**E-commerce (Backend):**
- **WooCommerce (Headless)**
  - Integration: REST API + Store API
  - Store API: `/wc/store/v1/products` (public, no auth)
  - REST API: `/wc/v3/products/*` (requires consumer key/secret)
  - Configuration: `utils/woocommerce-checkout.ts`
  - Payment method: razorpay (configured in env)
  - Env vars: `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, `WOOCOMMERCE_SITE_URL`

**Payments:**
- **Razorpay** - Payment gateway integration
  - Integration file: `utils/razorpay.ts`
  - API routes: `lib/api-route-handlers/checkout/route.ts`, `lib/api-route-handlers/razorpay/webhook/route.ts`
  - Creates orders in both WooCommerce and Razorpay
  - Env vars: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

**Content Management:**
- **WordPress** - Blog content and authentication
  - API: WordPress REST API at `WORDPRESS_API_URL` (default: `https://api.artacestudio.com/`)
  - Blog posts via: `lib/api-route-handlers/blogs/route.ts`
  - Authentication: JWT-based via `utils/wordpress-auth.ts`, `utils/jwt.ts`
  - Auth middleware: `middleware.ts` validates JWT tokens

## Data Storage

**Database:**
- **Supabase (PostgreSQL)**
  - Tables defined in `supabase/`:
    - `custom_orders` - Custom art order submissions
    - `rental_inquiries` - Art rental inquiries
  - RLS enabled for security
  - Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**File Storage:**
- **Supabase Storage**
  - Bucket: `reference-images` - Stores customer reference images for custom orders
  - Integration: `lib/api-route-handlers/upload-image/route.ts`
  - Max file size: 10MB
  - Allowed types: PNG, JPG, WEBP, HEIC, HEIF

## Authentication & Identity

**Auth Provider:**
- **WordPress with JWT**
  - Implementation: Custom JWT-based authentication
  - Auth utilities: `utils/auth.ts`, `utils/jwt.ts`, `utils/wordpress-auth.ts`
  - Cookie name: `AUTH_COOKIE_NAME` (imported from utils)
  - Protected routes: `/dashboard/*`, `/account/*` (enforced via `middleware.ts`)
  - API routes: `lib/api-route-handlers/auth/*` (login, register, logout, reset-password, forgot-password, session)

## Analytics & Tracking

**Google Tag Manager:**
- Env var: `NEXT_PUBLIC_GTM_ID`
- Implementation: `utils/gtm.ts` - Client-side GTM event tracking
- Events tracked:
  - `add_to_cart` - When items added to cart
  - `begin_checkout` - When checkout initiated
  - `purchase` - When order completed
  - Includes deduplication to prevent double-tracking

**Image CDN:**
- WordPress CDN: `i0.wp.com`, `i1.wp.com`, `i2.wp.com`
- Configured in `next.config.ts` remotePatterns for optimization

## Environment Configuration

**Required env vars:**
- `SITE_URL` - Primary site URL
- `WORDPRESS_URL` - WordPress installation URL
- `WORDPRESS_API_URL` - WordPress REST API endpoint
- `WORDPRESS_JWT_SECRET_KEY` - JWT signing secret
- `WOOCOMMERCE_SITE_URL` - WooCommerce site URL
- `WOOCOMMERCE_CONSUMER_KEY` - WooCommerce API consumer key
- `WOOCOMMERCE_CONSUMER_SECRET` - WooCommerce API consumer secret
- `RAZORPAY_KEY_ID` - Razorpay key ID (public)
- `RAZORPAY_KEY_SECRET` - Razorpay key secret (private)
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook verification
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin)

**Secrets location:**
- `.env.local` - Local development (not committed)
- Supabase dashboard - Database and storage credentials

## Webhooks & Callbacks

**Incoming:**
- `lib/api-route-handlers/razorpay/webhook/route.ts` - Razorpay payment webhook

**Outgoing:**
- WooCommerce webhook triggers on order status changes

## API Routes Summary

| Route | Purpose |
|-------|---------|
| `/api/store/products` | Product catalog |
| `/api/blogs` | Blog posts |
| `/api/checkout` | Order creation + Razorpay payment |
| `/api/checkout/status` | Payment status |
| `/api/checkout/verify` | Signature verification |
| `/api/checkout/coupon` | Coupon validation |
| `/api/razorpay/webhook` | Payment webhooks |
| `/api/auth/login` | User login |
| `/api/auth/register` | User registration |
| `/api/auth/session` | Session check |
| `/api/auth/logout` | User logout |
| `/api/auth/reset-password` | Password reset |
| `/api/auth/forgot-password` | Password recovery |
| `/api/custom-order` | Custom order submission |
| `/api/upload-image` | Image upload to Supabase |
| `/api/contact` | Contact form |
| `/api/corporate-leads` | Corporate bulk orders |
| `/api/rentals` | Art rental inquiries |
| `/api/orders` | Order history |
| `/api/account/profile` | User profile management |
| `/api/search` | Product search |

---

*Integration audit: 2026-04-17*