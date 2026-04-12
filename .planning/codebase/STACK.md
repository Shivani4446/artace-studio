# Tech Stack

## Core Framework
- **Next.js**: 16.1.4 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x

## Styling
- **Tailwind CSS**: 4 (via @tailwindcss/postcss)
- **LightningCSS**: 1.31.1 (embedded in Tailwind v4)

## Database & Backend
- **Supabase**: 2.100.1 (@supabase/supabase-js)
  - PostgreSQL database
  - Storage bucket: reference-images
  - Custom orders table: custom_orders

## Key Libraries
- **@next/third-parties**: 16.1.4 (Google Third Party libraries)
- **lucide-react**: 0.563.0 (Icons)
- **eslint**: 9, eslint-config-next: 16.1.4

## Project Structure

### Components (~51 files)
- /components - React components organized by feature
- Key folders: homepage/, shop/, singleproduct/, blog/, auth/, cart/, account, custom-order, corporate, ui

### App Routes (63+ files)
- /app - Next.js 16 App Router structure
- API routes: /api/
- Pages: homepage, shop, blogs, checkout, cart, account, dashboard, custom-order

### Utils (/utils)
- auth.ts - WordPress JWT authentication
- razorpay.ts - Payment processing
- wordpress-blog.ts - WordPress REST API integration
- woocommerce-checkout.ts - WooCommerce order management
- gtm.ts - Google Tag Manager tracking
- jwt.ts - JWT token handling
- wordpress-auth.ts - WP authentication helpers
- collections.ts - Collection data

## Environment Configuration

| Variable | Purpose |
|----------|---------|
| WOOCOMMERCE_SITE_URL | E-commerce backend |
| WOOCOMMERCE_CONSUMER_KEY | WooCommerce API key |
| WOOCOMMERCE_CONSUMER_SECRET | WooCommerce API secret |
| RAZORPAY_KEY_ID | Payment gateway |
| RAZORPAY_KEY_SECRET | Payment gateway secret |
| WORDPRESS_API_URL | Blog/CMS backend |
| WORDPRESS_JWT_SECRET_KEY | WP auth verification |
| SUPABASE_URL | Database and storage |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin access |
| NEXT_PUBLIC_GTM_ID | Analytics tracking ID |

---
*Generated from codebase analysis*
