# Checkout "Need More Help?" Chips Design

## Goal

Add a small "Need More Help?" block with two link chips (Art Advisory, Customer Support) to the checkout page, giving a shopper an easy escape hatch to get help before completing payment.

## Current State

- `app/checkout/checkout-client.tsx`'s sidebar (`<aside>`) currently ends with, in order: subtotal card → coupon card → Pay button → `<CheckoutTrustPoints />` (added in a prior change, right after the Pay button).
- The site already has an established chip pattern in `components/chat/ChatHomeTab.tsx`: `rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/35 hover:bg-[#ece8df]`.
- "Art Advisory" consistently links to `https://cal.com/artace-studio` (a Cal.com booking page) across `components/singleproduct/SingleProduct.tsx` and `components/collections/CollectionLandingPage.tsx` — this is the site-wide convention for "book a call with an art advisor."
- `app/contact-us/page.tsx` is the existing internal contact page; its own metadata (`keywords: "... customer support, reach us, ..."`) confirms it's the right destination for a "Customer Support" link.
- `lucide-react` is already the icon library used throughout the app (including elsewhere on this exact checkout page).

## Scope

New component `components/checkout/CheckoutNeedMoreHelp.tsx` — a small, presentational, prop-less component:
- Heading: "Need More Help?" (small, matching the sidebar's existing text hierarchy).
- Two pill-style chip links, wrapping on narrow widths, styled to match `ChatHomeTab.tsx`'s existing chip pattern:
  - **Contact Art Advisory** — `<a href="https://cal.com/artace-studio" target="_blank" rel="noopener noreferrer">`, `Palette` icon.
  - **Contact Customer Support** — `<Link href="/contact-us">` (internal Next.js route), `MessageCircleQuestion` icon.

Placement: rendered in `app/checkout/checkout-client.tsx`'s sidebar, immediately after `<CheckoutTrustPoints />` (last element in the sidebar).

## Error Handling

None needed — both links are static, no data dependency, nothing can fail at runtime.

## Testing

No test framework exists in this repo (established pattern). Verification is live, via the dev server:
- Confirm the block renders at the bottom of the checkout sidebar, after the trust points.
- Confirm "Contact Art Advisory" opens `https://cal.com/artace-studio` in a new tab.
- Confirm "Contact Customer Support" navigates to `/contact-us` within the app (no new tab).
- `npx tsc --noEmit`, compared against the existing known-error baseline.

## Global Constraints

- No new npm dependencies — `lucide-react` and `next/link` are already available.
- The external Art Advisory link must open in a new tab (`target="_blank" rel="noopener noreferrer"`); the internal Customer Support link must use Next.js's `Link` component for client-side navigation, not a plain `<a>`.
- Visual style must match the existing chip pattern already established in `components/chat/ChatHomeTab.tsx`, not invent a new chip style.
