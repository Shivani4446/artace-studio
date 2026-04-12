# Integrations

## External Services & APIs

### 1. WooCommerce (E-commerce)
**Purpose**: Product catalog, shopping cart, order management
**API**: WooCommerce REST API v3 (/wc/v3/)
**Files**:
- utils/woocommerce-checkout.ts (333 lines)
- utils/woocommerce-orders.ts

**Configuration**:
- Site URL: WOOCOMMERCE_SITE_URL (default: https://api.artacestudio.com/)
- Credentials: WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET
- Payment: WOOCOMMERCE_PAYMENT_METHOD (razorpay), WOOCOMMERCE_PAYMENT_METHOD_TITLE

**Features**:
- Product fetching via API
- Order creation, retrieval, update
- Payment method configuration
- Order status mapping to payment states

---

### 2. WordPress (CMS / Blogs)
**Purpose**: Blog content management, article delivery
**API**: WordPress REST API (/wp/v2/)
**Files**:
- utils/wordpress-blog.ts (247 lines)
- utils/wordpress-auth.ts
- utils/article.ts

**Configuration**:
- API URL: WORDPRESS_API_URL (default: https://api.artacestudio.com/)
- Revalidation: 120 seconds (WORDPRESS_BLOG_REVALIDATE_SECONDS)

**Features**:
- Post fetching with pagination
- Category and tag resolution
- Featured media extraction
- Blog page and single post pages

---

### 3. Razorpay (Payments)
**Purpose**: Payment processing, order validation
**API**: Razorpay Orders API v1
**Files**:
- utils/razorpay.ts (200 lines)
- pp/api/razorpay/webhook/route.ts

**Configuration**:
- Key ID: RAZORPAY_KEY_ID
- Secret: RAZORPAY_KEY_SECRET
- Webhook: RAZORPAY_WEBHOOK_SECRET

**Features**:
- Order creation via API
- Payment signature verification (HMAC-SHA256)
- Webhook signature validation
- Currency: INR

---

### 4. Supabase (Database & Storage)
**Purpose**: Custom order storage, file uploads
**Services**:
- PostgreSQL database
- Storage bucket: reference-images
**Files**:
- supabase/custom_orders.sql (42 lines)
- pp/api/upload-image/route.ts (83 lines)

**Configuration**:
- URL: SUPABASE_URL
- Service Role Key: SUPABASE_SERVICE_ROLE_KEY

**Features**:
- Custom orders table with RLS policies
- Image upload for reference images
- Edge runtime support for uploads

---

### 5. Google Tag Manager (Analytics)
**Purpose**: E-commerce event tracking
**Files**:
- utils/gtm.ts (182 lines)
- Environment: NEXT_PUBLIC_GTM_ID

**Events Tracked**:
- add_to_cart
- begin_checkout
- purchase

**Data**:
- Cart items with ID, name, variant, price, quantity
- Order transaction details (ID, total, currency, payment type, coupon)

---

### 6. WordPress JWT Authentication
**Purpose**: User login/registration via WordPress
**Files**:
- utils/auth.ts (308 lines)
- utils/jwt.ts
- utils/wordpress-auth.ts
- pp/api/auth/* routes

**Configuration**:
- JWT Endpoint: WORDPRESS_JWT_AUTH_URL
- Secret Key: WORDPRESS_JWT_SECRET_KEY
- Cookie: artace_wp_session (14-day expiry)

**Features**:
- Username/password authentication
- JWT token validation
- Session management with cookies

---

### 7. Next.js Image Optimization
**Purpose**: Remote image optimization
**Configured Domains** (next.config.ts):
- images.unsplash.com
- artacestudio.com
- api.artacestudio.com
- i0.wp.com, i1.wp.com, i2.wp.com (WordPress CDN)

---

## API Routes Summary

| Route | Purpose |
|-------|---------|
| /api/store/products | Product catalog |
| /api/blogs | Blog posts |
| /api/checkout | Order creation |
| /api/checkout/status | Payment status |
| /api/checkout/verify | Signature verification |
| /api/razorpay/webhook | Payment webhooks |
| /api/auth/login | User login |
| /api/auth/register | User registration |
| /api/auth/session | Session check |
| /api/auth/logout | User logout |
| /api/custom-order | Custom order submission |
| /api/upload-image | Image upload to Supabase |
| /api/contact | Contact form |
| /api/corporate-leads | Corporate bulk orders |

---
*Generated from codebase analysis*
