# Checkout "Need More Help?" Chips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Need More Help?" block with two link chips (Art Advisory, Customer Support) to the bottom of the checkout sidebar.

**Architecture:** One new presentational component rendering a heading and two styled link chips, wired into the existing checkout sidebar right after the trust points.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, `lucide-react` (already a dependency), `next/link` (already used in this file).

## Global Constraints

- No new npm dependencies.
- The external Art Advisory link (`https://cal.com/artace-studio`) must open in a new tab: `target="_blank" rel="noopener noreferrer"`.
- The internal Customer Support link (`/contact-us`) must use Next.js's `Link` component for client-side navigation, not a plain `<a>`.
- Visual style must match the existing chip pattern in `components/chat/ChatHomeTab.tsx` (`rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/35 hover:bg-[#ece8df]`), not a new chip style.
- This project has no test framework. Verification is `npx tsc --noEmit` (compare against the known pre-existing baseline: errors in `.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`) plus live checks against the real dev server.
- The project owner handles all `git commit`/`git push` in this repo — do not run `git commit` or `git add`; leave changes in the working tree.

---

### Task 1: "Need More Help?" chips component + wiring

**Files:**
- Create: `components/checkout/CheckoutNeedMoreHelp.tsx`
- Modify: `app/checkout/checkout-client.tsx:681` (render the new component after `<CheckoutTrustPoints />`)

**Interfaces:**
- Produces: `CheckoutNeedMoreHelp` — a default-exported, prop-less React component (`() => JSX.Element`). Rendered directly with no props: `<CheckoutNeedMoreHelp />`.

- [ ] **Step 1: Create the component file**

Create `components/checkout/CheckoutNeedMoreHelp.tsx` with this exact content:

```tsx
import Link from "next/link";
import { Palette, MessageCircleQuestion } from "lucide-react";

const CHIP_CLASSES =
  "inline-flex items-center gap-1.5 rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/35 hover:bg-[#ece8df]";

export default function CheckoutNeedMoreHelp() {
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-[#1f1f1f]">Need More Help?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href="https://cal.com/artace-studio"
          target="_blank"
          rel="noopener noreferrer"
          className={CHIP_CLASSES}
        >
          <Palette className="h-3.5 w-3.5" />
          Contact Art Advisory
        </a>
        <Link href="/contact-us" className={CHIP_CLASSES}>
          <MessageCircleQuestion className="h-3.5 w-3.5" />
          Contact Customer Support
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the checkout sidebar**

In `app/checkout/checkout-client.tsx`, add the import alongside the existing ones (near line 11, right after the `CheckoutTrustPoints` import):

```tsx
import CheckoutNeedMoreHelp from "@/components/checkout/CheckoutNeedMoreHelp";
```

Then find this exact block (currently lines 681-682):

```tsx
          <CheckoutTrustPoints />
        </aside>
```

Replace it with:

```tsx
          <CheckoutTrustPoints />
          <CheckoutNeedMoreHelp />
        </aside>
```

Do not change anything else in this file.

- [ ] **Step 3: Verify live against the real dev server**

Start the dev server (`npm run dev`) if it isn't already running. Navigate to the checkout page with at least one item in the cart. Confirm:
- A "Need More Help?" heading and two pill-style chips appear at the very bottom of the sidebar, after the 5 trust points.
- The chips visually match the checkout page's existing style and the chatbot's chip pattern (rounded pill, thin border, small icon + text).
- Clicking "Contact Art Advisory" opens `https://cal.com/artace-studio` in a **new tab**, leaving the checkout page open.
- Clicking "Contact Customer Support" navigates to `/contact-us` **within the same tab** (client-side navigation, not a full page reload — you can confirm this by checking the Network tab shows no full-document request, or simply that it behaves like other in-app links).
- The two chips wrap cleanly (don't overflow or get cut off) at both mobile and desktop sidebar widths.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline (see Global Constraints).

- [ ] **Step 5: Leave the change in the working tree**

Per the Global Constraints, do not run `git add` or `git commit` — leave the new file and `app/checkout/checkout-client.tsx` as uncommitted changes.

---

## Self-Review Notes

- **Spec coverage:** The spec's only requirement (heading + 2 link chips, correct destinations, correct link semantics, placement after trust points, matching chip style) is fully covered by this one task.
- **Type consistency:** `CheckoutNeedMoreHelp` is defined once and consumed identically at its one call site — no signature drift possible.
- **No placeholder scan issues found** — the step contains complete, real code.
