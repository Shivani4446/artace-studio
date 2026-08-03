# Navbar Initials Avatar + Checkout Trust Points Design

## Goal

Two small, independent UI additions:
1. Show the logged-in user's initials in the desktop navbar's account trigger button, matching what the mobile menu already does.
2. Add a 5-item trust/reassurance list to the checkout page's order-summary sidebar.

## Current State

**Navbar (`components/navbar.tsx`):**
- Auth state comes from `useAuthSession()` (`AuthSessionProvider.tsx`); `isAuthenticated = authStatus === "authenticated"`.
- `accountDisplayName` and `accountInitials` are already derived (lines 277-285) from `session.user.name` (falling back to email, then `"Artace Account"` / `"A"`).
- The **mobile** slide-down menu already renders these initials in a solid circle (lines 1213-1226):
  ```tsx
  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-[14px] font-semibold uppercase tracking-[0.04em] text-white">
    {accountInitials}
  </span>
  ```
- The **desktop** trigger button (lines 904-929), however, always renders a static `/user.svg` image regardless of auth state:
  ```tsx
  <Image src="/user.svg" alt="" width={20} height={20} aria-hidden="true" className="h-5 w-5" />
  ```
  inside a button sized `h-9 w-9 ... md:h-10 md:w-10`.
- The dropdown menu, click handlers, and mobile behavior are unaffected by this change and already work correctly — only the desktop trigger's visual content needs updating for the authenticated case.

**Checkout (`app/checkout/checkout-client.tsx`):**
- Two-column layout: form (left) + order-summary `<aside>` sidebar (right, line 598).
- Sidebar order, top to bottom: subtotal card → coupon card → Pay button (lines 665-678) → a one-line Razorpay reassurance note (lines 680-682): payments are secure, card/UPI details aren't stored.
- Icons already in use on this page: `ArrowLeft`, `Lock` (inside the Pay button), `ShieldCheck` (next to the "Delivery details" heading) — all from `lucide-react`.
- Existing trust-badge precedents elsewhere in the codebase (`components/homepage/TrustBar.tsx`, `components/singleproduct/SingleProduct.tsx`) establish the visual language: warm neutral backgrounds (`#f7f6f3`, `#FAF9F6`), near-black text (`#1f1f1f`/`#2c2c2c`), muted body text (`#666`/`#6b6b6b`), rounded corners, `lucide-react` icons. `TrustBar.tsx` uses a single icon tone (`text-[#2f2f2f]`) rather than SingleProduct's multi-color badge set.
- `SingleProduct.tsx`'s existing "Satisfaction Guarantee" point currently says **15-day** — the checkout copy must match this (see Scope below).

## Scope

### 1. Navbar desktop initials avatar

When `isAuthenticated` is true, the desktop trigger button (`components/navbar.tsx:904-929`) renders an initials circle instead of `/user.svg`, sized to fit the existing button dimensions:

```tsx
{isAuthenticated ? (
  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1f1f] text-[11px] font-semibold uppercase tracking-[0.04em] text-white md:h-10 md:w-10 md:text-[12px]">
    {accountInitials}
  </span>
) : (
  <Image src="/user.svg" alt="" width={20} height={20} aria-hidden="true" className="h-5 w-5" />
)}
```

When not authenticated, the button renders exactly what it does today — no visual change for logged-out users. No changes to click handlers, the dropdown menu, or mobile behavior (mobile is already correct and untouched).

### 2. Checkout trust points

New component `components/checkout/CheckoutTrustPoints.tsx` — a small, presentational, prop-less component rendering a vertical list of 5 items (icon + bold title + muted description), placed in the checkout sidebar (`app/checkout/checkout-client.tsx`) immediately after the Pay button, **replacing** the existing one-line Razorpay reassurance note (lines 680-682) — removed as redundant with the new "Safe & Secure Shopping" point.

Content (icons from `lucide-react`, matching the existing library):

| Icon | Title | Description |
|---|---|---|
| `Receipt` | No Surprise Fees | No surprise charges or fees. The price you pay at checkout is final. Guaranteed. |
| `Star` | Thousands Of Five-Star Reviews | We deliver world-class customer service to all of our art buyers. |
| `BadgeCheck` | Satisfaction Guaranteed | Our 15-day satisfaction guarantee allows you to buy with confidence. |
| `ShieldCheck` | Safe & Secure Shopping | All payments and transactions are secure and encrypted. |
| `Paintbrush` | Support An Artist With Every Purchase | We pay our artists more on every sale than other galleries. |

Visual style: consistent with the sidebar's existing warm-neutral card language (`#1f1f1f` titles, `#6b6b6b` descriptions, `font-inter`), a single subtle icon tone (matching `TrustBar.tsx`'s `text-[#2f2f2f]`) rather than SingleProduct's multi-color badge set, since a denser 5-item list reads calmer in a narrow sidebar column with one consistent tone. Each item: small icon (~18-20px) + title (bold, ~13-14px) + description (regular, ~12-13px, muted) in an icon-left, text-right row layout, with reasonable vertical spacing between the 5 rows.

## Error Handling

Neither feature has meaningful error states:
- The avatar uses the same `accountInitials` value already computed and already rendering successfully on mobile — no new fallback logic needed (the existing derivation already falls back to `"A"` if no name/email is available).
- The trust points are static content with no data dependency — nothing can fail at runtime.

## Testing

No test framework exists in this repo (established pattern). Verification will be live, via the dev server:
- Confirm the desktop navbar shows the initials circle when logged in, and the original `/user.svg` icon when logged out, at both `md` breakpoint sizes.
- Confirm the mobile menu's existing initials avatar is unaffected (no shared code path was changed for it).
- Confirm the checkout sidebar renders the 5 trust points in order, with correct icons/copy, in the right position (after the Pay button, in place of the removed Razorpay note).
- `npx tsc --noEmit`, compared against the existing known-error baseline.

## Global Constraints

- No new npm dependencies — `lucide-react` is already a project dependency.
- No changes to `AuthSessionProvider.tsx`, the account dropdown menu's contents/behavior, or the mobile menu's existing avatar rendering.
- The Satisfaction Guaranteed copy must say **15 days**, matching `SingleProduct.tsx`'s existing guarantee period.
- The existing one-line Razorpay reassurance note is removed as part of this change (superseded by "Safe & Secure Shopping").
