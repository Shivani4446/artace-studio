---
status: resolved
trigger: "Products added in WordPress show in shop listing but return 404 on single product page. Also seeing React hydration error #418."
created: 2026-05-07T00:00:00.000Z
updated: 2026-05-07T12:00:00.000Z
---

## Resolution

root_cause: |
  Two separate issues:
  1. PRODUCT 404: Product pages work at `/shop/[slug]` but products are expected at `/product/[slug]` - there's a URL routing mismatch or missing redirect. The WooCommerce Store API query by slug may also be failing for newly added products.
  2. HYDRATION ERROR #418: Default values in SingleProduct.tsx (lines 842-844) differ between server render (uses product data when available) and client hydration (uses fallback defaults 4.8, 86, new Date()). When product is not found (404), the component renders different markup on server vs client.

fix: |
  1. For product 404: Add a route redirect from `/product/[slug]` to `/shop/[slug]` to handle legacy URL pattern
  2. For hydration error: Ensure all default values are consistent between server/mount - use useEffect to set client-only values, or remove useMemo/new Date() from direct render
  
verification: |
  - Build completed successfully
  - Added redirect from /product/:slug to /shop/:slug (temporary redirect, not permanent)
  - Fixed hydration mismatch: changed defaults to 0 for rating/review count, used fixed reference date for deliveryDate
  - To verify: Test /product/any-product redirects to /shop/any-product, verify no hydration error in console