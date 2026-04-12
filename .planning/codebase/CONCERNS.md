# Concerns & Issues

## Overview
This document outlines identified issues, technical debt, and areas requiring attention in the Artace Studio codebase.

---

## Security Concerns

### 1. Environment Variable Exposure Risk
- **Issue**: Multiple API keys stored in environment variables without clear documentation
- **Files**: utils/auth.ts, utils/razorpay.ts, utils/woocommerce-checkout.ts
- **Risk**: WooCommerce consumer keys, Razorpay credentials, Supabase keys could be exposed in client bundles if not properly configured
- **Mitigation**: Ensure all sensitive keys use server-side only access

### 2. JWT Token Handling
- **Issue**: Token verification depends on optional WORDPRESS_JWT_SECRET_KEY
- **Files**: utils/jwt.ts, utils/auth.ts, middleware.ts
- **Concern**: If secret is not set, fallback validation via WordPress API may expose tokens to external requests

### 3. Client-Side Cart Storage
- **Issue**: Cart data stored in localStorage without encryption
- **Files**: components/cart/CartProvider.tsx
- **Risk**: Price manipulation possible by editing localStorage directly
- **Recommendation**: Validate cart prices server-side during checkout (already implemented in /api/checkout)

### 4. Webhook Signature Validation
- **Issue**: Webhook handler processes payments before order validation
- **Files**: pp/api/razorpay/webhook/route.ts
- **Status**: Implementation is correct - signature is validated before processing

---

## Technical Debt

### 1. Large Component Files
- **Issue**: Some components exceed 1000 lines
- **Files**:
  - components/navbar.tsx - 1240+ lines
  - components/shop/ShopCatalog.tsx - 1225 lines
  - pp/shop/[slug]/page.tsx - 826 lines
  - pp/checkout/page.tsx - 687 lines
- **Impact**: Difficult to maintain, test, and onboard new developers
- **Recommendation**: Extract into smaller composable components

### 2. Missing Error Boundaries
- **Issue**: No React error boundaries implemented
- **Impact**: Unhandled errors can crash entire page
- **Recommendation**: Add error boundary components

### 3. No Loading States for Some Routes
- **Issue**: Some pages lack loading.tsx or Suspense boundaries
- **Impact**: Poor UX during data fetching
- **Recommendation**: Add loading.tsx to all dynamic routes

### 4. Hardcoded Fallback URLs
- **Issue**: Multiple fallback URL patterns for WooCommerce/WordPress API
- **Files**: 
  - utils/wordpress-blog.ts
  - utils/woocommerce-checkout.ts
  - lib/search.ts
- **Impact**: Confusing configuration, potential for incorrect routing

### 5. Image Protection Implementation
- **Issue**: pp/product-image-protection.tsx uses DOM manipulation with hardcoded CSS selectors
- **Risk**: Brittle - breaks with any class name changes
- **Status**: Only skips blog pages, may not cover all product images
- **Recommendation**: Implement server-side watermarking or CSS-based solution

---

## Bugs & Inconsistencies

### 1. Cart Quantity Reset on Page Reload
- **Issue**: Cart uses localStorage, not synced with server/customer account
- **Impact**: Users lose cart on browser clear or different device
- **Status**: Known limitation, no persistent cart for guest users

### 2. Wishlist Not Persisted
- **Issue**: WishlistProvider uses localStorage only
- **Files**: components/wishlist/WishlistProvider.tsx
- **Impact**: No server-side wishlist storage

### 3. Auth Session Validation Frequency
- **Issue**: Middleware validates JWT on every protected route request
- **Files**: middleware.ts
- **Impact**: Potential performance issue with high traffic

### 4. Payment Verification Race Condition
- **Issue**: Client-side payment verification via /api/checkout/verify
- **Files**: pp/checkout/page.tsx
- **Risk**: If user closes browser after payment but before verification, order may remain unpaid
- **Mitigation**: Webhook handler (/api/razorpay/webhook) should handle this

### 5. Email Delivery Failure Handling
- **Issue**: Both custom-order and corporate-leads routes return error if email fails
- **Files**: pp/api/custom-order/route.ts, pp/api/corporate-leads/route.ts
- **Impact**: Lead/order saved to DB but user sees error message
- **Recommendation**: Return success to user, handle email async

---

## Missing Features

### 1. No Test Suite
- **Issue**: Zero unit or integration tests
- **Evidence**: No test files, no test scripts in package.json
- **Priority**: High for maintainability

### 2. No Rate Limiting on API Routes
- **Issue**: API routes lack rate limiting
- **Files**: All /api/* routes
- **Risk**: Brute force attacks on login, checkout abuse

### 3. No Order Cancellation/Refund Flow
- **Issue**: No API endpoints for order cancellation or refund requests
- **Impact**: Users must contact support manually

### 4. No Inventory Checking
- **Issue**: Products may show as available but be out of stock
- **Status**: Depends on WooCommerce product status

### 5. No Multi-Currency Support
- **Issue**: Hardcoded to INR (parseAmountToMinorUnits expects paise)
- **Files**: utils/razorpay.ts, utils/woocommerce-checkout.ts

### 6. No Guest Checkout
- **Issue**: Checkout requires authentication
- **Files**: pp/api/checkout/route.ts line 126-131
- **Impact**: May lose sales from non-registered users

---

## API & Integration Issues

### 1. WordPress/WooCommerce URL Confusion
- **Issue**: Multiple environment variables for different purposes:
  - WOOCOMMERCE_SITE_URL
  - WOOCOMMERCE_REST_URL
  - WORDPRESS_API_URL
  - NEXT_PUBLIC_WOOCOMMERCE_SITE_URL
- **Impact**: Difficult to debug when API calls fail

### 2. Fallback URL Pattern Is Fragile
- **Issue**: Code retries with ?rest_route= on 404, but not on 500/503
- **Files**: utils/woocommerce-checkout.ts lines 236-252
- **Impact**: Server timeouts don't trigger fallback

### 3. No Retry Logic for Failed Payments
- **Issue**: Failed payment creates failed WooCommerce order but no retry mechanism
- **Files**: pp/api/razorpay/webhook/route.ts

---

## Code Quality Issues

### 1. Inconsistent Error Handling
- **Issue**: Some routes return detailed errors, others return generic messages
- **Example**: 
  - /api/auth/login returns detailed 502 errors in dev mode
  - /api/custom-order exposes Supabase error details

### 2. Missing Input Sanitization
- **Issue**: Phone number fields accept any string
- **Files**: pp/checkout/page.tsx, pp/api/checkout/route.ts
- **Recommendation**: Add phone format validation

### 3. Type Safety Gaps
- **Issue**: Some s type assertions without validation
- **Example**: awText ? (JSON.parse(rawText) as unknown) : []
- **Files**: Multiple utility files

### 4. Unused Code
- **Issue**: utils/woocommerce-orders.ts may have unused functions
- **Files**: Need audit

---

## Performance Concerns

### 1. No Image Optimization
- **Issue**: Relying on external WooCommerce images
- **Recommendation**: Implement Next.js Image component with remote patterns

### 2. No Pagination on Some Views
- **Issue**: Blog archive loads all posts, no pagination
- **Files**: pp/blogs/page.tsx, components/blogarchive/

### 3. Large Bundle Size Risk
- **Issue**: No code splitting analysis performed
- **Recommendation**: Run bundle analysis

---

## Documentation Gaps

### 1. Environment Variables Not Documented
- **Issue**: No .env.example file
- **Impact**: Difficult for new developers to set up

### 2. No Architecture Decision Records (ADRs)
- **Issue**: No documentation for key decisions
- **Examples**: Why Razorpay? Why WordPress for auth?

---

## Priority Matrix

| Priority | Issue | Effort |
|----------|-------|--------|
| High | Add API rate limiting | Medium |
| High | Implement test suite | High |
| Medium | Extract large components | Medium |
| Medium | Add error boundaries | Low |
| Medium | Fix guest checkout | Medium |
| Low | Add pagination to blogs | Medium |
| Low | Document environment variables | Low |

---

*Generated from codebase analysis*
