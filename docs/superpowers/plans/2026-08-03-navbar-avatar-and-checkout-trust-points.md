# Navbar Initials Avatar + Checkout Trust Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the logged-in user's initials in the desktop navbar's account button (matching what the mobile menu already does), and add a 5-item trust/reassurance list to the checkout page's sidebar.

**Architecture:** Two small, independent UI changes. Task 1 modifies one conditional render inside the existing desktop account button in `components/navbar.tsx`, reusing the `accountInitials` value already computed and already used by the mobile menu. Task 2 adds one new presentational component and wires it into the checkout sidebar in place of an existing one-line note.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, `lucide-react` (already a dependency).

## Global Constraints

- No new npm dependencies — `lucide-react` is already a project dependency.
- No changes to `AuthSessionProvider.tsx`, the account dropdown menu's contents/behavior, or the mobile menu's existing avatar rendering.
- The Satisfaction Guaranteed copy must say **15 days**, matching `components/singleproduct/SingleProduct.tsx`'s existing guarantee period (its "Why Artace" 15-day satisfaction guarantee point).
- This project has no test framework. Verification is `npx tsc --noEmit` (compare against the known pre-existing baseline: errors in `.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`) plus live checks against the real dev server.
- The project owner handles all `git commit`/`git push` in this repo — do not run `git commit` or `git add`; leave changes in the working tree.

---

### Task 1: Navbar desktop initials avatar

**Files:**
- Modify: `components/navbar.tsx:921-928`

**Interfaces:**
- Consumes: `isAuthenticated` (already defined at `components/navbar.tsx:255`, a boolean) and `accountInitials` (already defined at `components/navbar.tsx:279-285`, a string — e.g. `"JD"` or `"A"` as a fallback). Both are already in scope at the point being modified; no new imports or props needed.

- [ ] **Step 1: Read the current code to confirm the exact block**

Open `components/navbar.tsx` and find this exact block (inside the desktop account trigger `<button>`, currently spanning lines 921-928):

```tsx
                <Image
                  src="/user.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className="h-5 w-5"
                />
```

- [ ] **Step 2: Replace it with a conditional render**

Replace that exact block with:

```tsx
                {isAuthenticated ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1f1f] text-[11px] font-semibold uppercase tracking-[0.04em] text-white md:h-10 md:w-10 md:text-[12px]">
                    {accountInitials}
                  </span>
                ) : (
                  <Image
                    src="/user.svg"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                )}
```

Do not touch anything else in this file — the surrounding `<button>` element (its `onClick`, `aria-label`, `className`), the dropdown menu that follows it, and the mobile menu's own separate avatar rendering (around line 1215) are all unrelated and must stay exactly as they are.

- [ ] **Step 3: Verify live against the real dev server**

Start the dev server (`npm run dev`) if it isn't already running. In a browser:
- While logged out, confirm the navbar's account icon (top right, desktop width ≥768px) still shows the original user silhouette icon exactly as before.
- Log in with a real test account. Confirm the desktop account icon now shows a solid dark circle with the user's initials (e.g. two letters, uppercase), matching the same visual style already used in the mobile menu's avatar.
- Confirm clicking the button still opens/closes the account dropdown menu exactly as before (this behavior is untouched, but confirm nothing broke).
- Shrink the browser to mobile width and confirm the mobile slide-down menu's own avatar circle (a separate, already-existing piece of code) still renders correctly and is unaffected.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline (see Global Constraints).

- [ ] **Step 5: Leave the change in the working tree**

Per the Global Constraints, do not run `git add` or `git commit` — leave `components/navbar.tsx` as a modified, uncommitted file.

---

### Task 2: Checkout trust points

**Files:**
- Create: `components/checkout/CheckoutTrustPoints.tsx`
- Modify: `app/checkout/checkout-client.tsx:6` (add an import), `app/checkout/checkout-client.tsx:680-682` (replace the existing Razorpay note)

**Interfaces:**
- Produces: `CheckoutTrustPoints` — a default-exported, prop-less React component (`() => JSX.Element`). Rendered directly with no props: `<CheckoutTrustPoints />`.

- [ ] **Step 1: Create the component file**

Create `components/checkout/CheckoutTrustPoints.tsx` (the `components/checkout/` directory does not exist yet — create it) with this exact content:

```tsx
import { Receipt, Star, BadgeCheck, ShieldCheck, Paintbrush } from "lucide-react";

type TrustPoint = {
  icon: typeof Receipt;
  title: string;
  description: string;
};

const TRUST_POINTS: TrustPoint[] = [
  {
    icon: Receipt,
    title: "No Surprise Fees",
    description:
      "No surprise charges or fees. The price you pay at checkout is final. Guaranteed.",
  },
  {
    icon: Star,
    title: "Thousands Of Five-Star Reviews",
    description: "We deliver world-class customer service to all of our art buyers.",
  },
  {
    icon: BadgeCheck,
    title: "Satisfaction Guaranteed",
    description: "Our 15-day satisfaction guarantee allows you to buy with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure Shopping",
    description: "All payments and transactions are secure and encrypted.",
  },
  {
    icon: Paintbrush,
    title: "Support An Artist With Every Purchase",
    description: "We pay our artists more on every sale than other galleries.",
  },
];

export default function CheckoutTrustPoints() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {TRUST_POINTS.map((point) => {
        const Icon = point.icon;
        return (
          <div key={point.title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#2f2f2f]" />
            <div>
              <p className="text-sm font-semibold text-[#1f1f1f]">{point.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-[#666]">{point.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the checkout sidebar**

In `app/checkout/checkout-client.tsx`, add the import alongside the existing ones (near line 6-10):

```tsx
import CheckoutTrustPoints from "@/components/checkout/CheckoutTrustPoints";
```

Then find this exact block (currently lines 680-682, immediately after the Pay button's closing `</button>`):

```tsx
          <p className="mt-4 text-sm leading-6 text-[#666]">
            Your payment details are handled by Razorpay. We do not store card or UPI credentials.
          </p>
```

Replace it with:

```tsx
          <CheckoutTrustPoints />
```

Do not change anything else in this file — the Pay button above it, the subtotal/coupon cards above that, and the rest of the page are unrelated to this task.

- [ ] **Step 3: Verify live against the real dev server**

Start the dev server (`npm run dev`) if it isn't already running. Navigate through the site to the checkout page with at least one item in the cart. Confirm:
- The order-summary sidebar shows, in order after the Pay button: No Surprise Fees, Thousands Of Five-Star Reviews, Satisfaction Guaranteed, Safe & Secure Shopping, Support An Artist With Every Purchase — each with its icon, bold title, and description exactly as specified in Step 1.
- The old one-line Razorpay note ("Your payment details are handled by Razorpay...") no longer appears anywhere on the page.
- The Satisfaction Guaranteed line reads "15-day", not "14-day".
- The layout doesn't overflow or look cramped in the sidebar at both mobile and desktop widths.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline (see Global Constraints).

- [ ] **Step 5: Leave the change in the working tree**

Per the Global Constraints, do not run `git add` or `git commit` — leave the new file and `app/checkout/checkout-client.tsx` as uncommitted changes.

---

## Self-Review Notes

- **Spec coverage:** Both spec requirements (navbar desktop avatar, checkout trust points) are covered, one task each. The 15-day guarantee correction and the Razorpay-note removal are both folded into their respective tasks rather than treated as separate tasks, since each is a small part of the same deliverable.
- **Type consistency:** `CheckoutTrustPoints` is defined once (Task 2, Step 1) and consumed identically at its one call site (Task 2, Step 2) — no signature drift possible since there's only one producer and one consumer.
- **No placeholder scan issues found** — every step contains complete, real code.
