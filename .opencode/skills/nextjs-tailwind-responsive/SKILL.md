---
name: nextjs-tailwind-responsive
description: Apply when building layouts, grids, or responsive UI elements in Next.js with Tailwind CSS.
---

Build responsive layouts with predictable behavior across breakpoints.

## When To Use
- Use for page sections, grids, navbars, sidebars, and card systems.
- Use when converting static desktop layouts into mobile-first responsive UI.
- Use when tuning spacing, typography, and alignment per breakpoint.

## Instructions
- Start with mobile defaults, then scale with `sm`, `md`, `lg`, and `xl`.
- Use Tailwind flex/grid utilities over custom CSS when possible.
- Keep spacing and max-width constraints consistent across sections.
- Test component behavior at key breakpoints before finalizing.

## Example
```tsx
<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Grid items */}
</div>
```

## Guidelines
- Avoid breakpoint overload; add classes only when behavior truly changes.
- Prefer container patterns that prevent overly wide text lines.
- Keep interactive targets large enough on mobile.
