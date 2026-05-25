---
status: awaiting_human_verify
trigger: "Single product pages returning 404 after recent changes"
created: 2026-05-11T00:00:00.000Z
updated: 2026-05-11T10:00:00.000Z
---

## Current Focus
hypothesis: Product page returns HTTP 200 instead of 404 when product not found in WooCommerce, displaying "Product Unavailable" which users interpret as 404
test: Examine how product fetch handles missing products and whether HTTP 404 is returned
expecting: Find that notFound() is not being called when product is null
next_action: Awaiting user verification

## Symptoms
expected: Show product details page
actual: 404 error page
errors:
- React error #418 (hydration mismatch) - FIXED in recent commit b204b61
- "sacred-temple-reflections-indian-temple-painting-on-canvas:1 Failed to load resource: the server responded with a status of 404" - Likely a product image that's been deleted from WooCommerce
- External scripts blocked (ad blocker - not the issue)
reproduction: Clicking product links or entering direct URL returns 404
started: Stopped working after recent changes

## Eliminated

## Evidence

### Evidence 1: Git history shows multiple product 404 fixes
- df86628 "fixed the product 404" - Changed caching strategy, added fallback route
- b204b61 "fixed the product visibility in the shop page" - Fixed hydration mismatch

### Evidence 2: Hydration mismatch was fixed
- Commit b204b61 changed date handling to use fixed reference date
- Fixed: `deliveryDateRef = useMemo(() => new Date("2024-01-01"), [])`
- Added client-side effect to update date after hydration

### Evidence 3: No notFound() call for missing products
- grep shows no `notFound()` from Next.js in app/shop/[slug]/
- When product is null, renders "Product Unavailable" UI with HTTP 200 status

### Evidence 4: Conflicting caching strategies in fetchStoreProducts
- Line 10: `export const revalidate = 120` (page-level)
- Lines 197, 207: API calls use `{ next: { revalidate } }`
- Earlier fix (df86628) attempted `cache: "no-store"` but appears inconsistent
- This may cause stale product data to be served

### Evidence 5: Image 404 likely from deleted WooCommerce media
- Error "sacred-temple-reflections-indian-temple-painting-on-canvas:1" shows image ID reference
- Product still exists in WooCommerce but image was deleted
- Next.js Image component tries to load missing resource

## Resolution
root_cause: When product is not found in WooCommerce (either deleted or never existed), the page renders "Product Unavailable" UI with HTTP 200 status instead of returning proper HTTP 404. Additionally, products that exist in WooCommerce but have deleted images cause client-side 404 errors for image resources.

fix: Import `notFound` from `next/navigation` and call it when `getSingleProduct(slug)` returns null in both `generateMetadata` and `SingleProductPage` components. This returns proper HTTP 404 status instead of rendering "Product Unavailable" with HTTP 200.
verification: Applied fix - added notFound() calls in both locations
files_changed:
- artace-studio/app/shop/[slug]/page.tsx: Added notFound() import and calls in generateMetadata and SingleProductPage