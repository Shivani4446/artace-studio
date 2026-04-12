# Artace Studio - E-Commerce Art Gallery

A full-featured e-commerce website for an Indian art gallery featuring handcrafted paintings, sculptures, and bespoke art pieces. The platform showcases traditional Indian art forms including Ganapati, Radha Krishna, Buddha, and landscape collections.

## Website Overview

**Website**: [artacestudio.com](https://artacestudio.com)  
**Type**: E-commerce art gallery with blog integration  
**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4

---

## What It Is

Artace Studio is a sophisticated e-commerce platform designed for selling traditional Indian artwork online. The website provides:

- **Product Catalog**: Browse and purchase handcrafted paintings by category (Ganapati, Radha Krishna, Buddha, Landscapes)
- **Product Details**: Detailed product pages with variations, FAQs, and related products
- **Shopping Cart**: Persistent cart with localStorage sync
- **Checkout Flow**: Integrated Razorpay payment processing
- **User Accounts**: Account creation, order history, profile management
- **Blog/Content**: WordPress-powered blog for art education and marketing
- **Custom Orders**: Bespoke art commission requests
- **Corporate Sales**: Bulk ordering for corporate gifting
- **Contact & Support**: Contact forms and inquiry management

---

## Technical Architecture

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | App Router framework |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Styling |
| LightningCSS | 1.31.1 | CSS processing |

### Database & Backend

| Service | Purpose | Integration |
|---------|---------|------------|
| Supabase | PostgreSQL database, file storage | Custom orders, image uploads |
| WordPress | CMS, blog content, user auth | REST API v2 |

### External Integrations

| Service | API | Purpose |
|---------|-----|---------|
| WooCommerce | REST API v3 | Product catalog, orders |
| Razorpay | Orders API v1 | Payment processing |
| Google Tag Manager | Third-party | Analytics tracking |

---

## Key Features Implementation

### 1. Product Catalog & Collections

```
- Homepage with category discovery
- Collection pages (/collections/:slug)
- Product detail pages (/shop/:slug)
- Best sellers, featured products
- Search functionality
```

**Location**: `app/shop/`, `app/collections/`, `components/shop/`

### 2. Shopping Cart

- React Context-based state management
- localStorage persistence
- Add/remove/update quantities
- Cart icon with item count

**Location**: `components/cart/CartProvider.tsx`

### 3. Checkout & Payments

- Multi-step checkout flow
- Razorpay integration (India's leading payment gateway)
- Order creation via WooCommerce
- Payment verification webhooks
- Order status tracking

**Location**: `app/checkout/`, `app/api/checkout/`, `utils/razorpay.ts`

### 4. User Authentication

- WordPress JWT-based authentication
- HTTP-only session cookies (14-day expiry)
- Login, registration, password reset
- Account dashboard with order history

**Location**: `app/api/auth/`, `components/auth/`, `utils/auth.ts`

### 5. Blog & Content

- WordPress REST API integration
- Blog archive and single post pages
- Related posts
- Categories and tags

**Location**: `app/blogs/`, `components/blog*/`, `utils/wordpress-blog.ts`

### 6. Additional Features

- **Custom Orders**: Bespoke art commission forms with image uploads to Supabase
- **Corporate Bulk Orders**: Lead generation for corporate gifting
- **Wishlist**: Saved products (local storage)
- **Search**: Unified search across products and blogs

---

## API Routes (20 endpoints)

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/*` | Login, register, session, logout, password reset |
| `/api/checkout/*` | Order creation, verification, coupon validation |
| `/api/razorpay/webhook` | Payment webhook handling |
| `/api/store/products` | Product catalog proxy |
| `/api/blogs` | Blog posts proxy |
| `/api/search` | Unified search |
| `/api/custom-order` | Custom order submissions |
| `/api/corporate-leads` | Corporate lead capture |
| `/api/contact` | Contact form submissions |
| `/api/upload-image` | Image uploads to Supabase |

**All API routes use Edge Runtime for optimal performance**

---

## Component Architecture

### 55+ React Components organized by domain:

| Domain | Components |
|--------|------------|
| Homepage | HeroSection, ShopBestSellers, DiscoverEssentials, Testimonials, JournalSection, ArtistInvitation |
| Shop | ShopCatalog, SingleProduct |
| Cart | CartProvider, AddToCartButton |
| Auth | LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm |
| Account | DashboardShell, DashboardOrders, DashboardProfile, DashboardDetails |
| Blog | BlogArchiveCatalog, BlogContentWithProducts, SingleBlogContent |
| Collections | CollectionLandingPage, CollectionEditorialLoop |
| Custom Order | CustomOrderForm, ImageUpload |
| Corporate | CorporateLeadForm, BulkOrderingProcess |
| UI | CustomDropdown, PromotionModal, ProtectedImage |

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Pages | 39 |
| API Routes | 20 |
| Components | 55+ |
| Utility Modules | 12 |
| Key Files (LOC) | 3000+ |

---

## Directory Structure

```
artace-studio/
├── app/                    # Next.js App Router
│   ├── (home)/            # Homepage
│   ├── shop/             # Product pages
│   ├── collections/       # Collection pages
│   ├── blogs/            # Blog pages
│   ├── checkout/         # Checkout flow
│   ├── account/          # User account
│   ├── dashboard/        # User dashboard
│   ├── api/              # API routes (20 endpoints)
│   ├── layout.tsx        # Root layout
│   └── globals.css        # Global styles
├── components/            # React components (~55 files)
│   ├── homepage/
│   ├── shop/
│   ├── cart/
│   ├── auth/
│   ├── account/
│   ├── blog/
│   └── ...
├── utils/                 # Business logic
│   ├── auth.ts           # JWT authentication
│   ├── razorpay.ts      # Payment gateway
│   ├── woocommerce-checkout.ts
│   ├── wordpress-blog.ts
│   └── ...
├── lib/                   # Shared services
│   └── search.ts         # Search service
├── supabase/             # Database schema
├── public/               # Static assets
└── .planning/            # Documentation
```

---

## Security Implementation

### Authentication
- WordPress JWT with HTTP-only cookies
- 14-day session expiry
- SameSite: Lax policy
- Secure: Production only

### API Security
- Edge Runtime for all API routes
- Server-side secrets (no exposed keys)
- Input sanitization
- HMAC-SHA256 signature verification (Razorpay)

### Image Protection
- Right-click disabled on product images
- Watermarked previews
- ProtectedImage component

---

## Development & Deployment

### Scripts
```bash
npm run dev      # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint   # ESLint
```

### Environment Variables Required
```
WOOCOMMERCE_SITE_URL
WOOCOMMERCE_CONSUMER_KEY
WOOCOMMERCE_CONSUMER_SECRET
WORDPRESS_API_URL
WORDPRESS_JWT_SECRET_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_GTM_ID
```

### Deployment
- Platform: Vercel (recommended for Next.js)
- Build: Next.js 16 production build
- Edge: All API routes configured for Edge Runtime

---

## Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Tailwind CSS 4**: Modern CSS utility framework
- **Performance**: Server components, Edge runtime, image optimization

---

## Key Achievements

1. **Multi-vendor Integration**: Successfully integrated 4 external services (WooCommerce, WordPress, Razorpay, Supabase)
2. **Full E-commerce Flow**: Complete shopping experience from product browse to payment
3. **User Management**: JWT-based authentication with account dashboard
4. **Content Strategy**: WordPress blog integration for SEO and marketing
5. **Custom Features**: Custom orders, corporate bulk orders, wishlist
6. **Responsive Design**: Mobile-first with Tailwind CSS 4
7. **SEO Optimized**: Schema.org structured data, sitemap, robots.txt

---

## About the Art

The website showcases India's rich artistic heritage:

- **Ganapati Collection**: Lord Ganesha paintings
- **Radha Krishna**: Divine love artwork
- **Buddha Collection**: Spiritual meditation art
- **Landscape Collection**: Indian scenic paintings
- **Custom/Bespoke Orders**: Commissioned artwork

---

*Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4*
*Integrations: WooCommerce, WordPress, Razorpay, Supabase*