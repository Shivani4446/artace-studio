---
name: nextjs-accessibility
description: Combine with other Next.js UI skills to ensure components and pages are accessible by default.
---

Apply accessibility fundamentals to all UI work.

## When To Use
- Use alongside component, layout, and form implementation.
- Use during UI refactors that may impact semantics or keyboard flows.
- Use when reviewing interactive elements for screen reader support.

## Instructions
- Use semantic HTML before adding ARIA.
- Add ARIA roles/labels only when semantics are insufficient.
- Ensure all interactive controls are keyboard accessible.
- Verify focus visibility and logical tab order.
- Check color contrast for readable text and controls.

## Example
```tsx
<button
  aria-label="Close modal"
  className="absolute right-4 top-4 rounded p-2 hover:bg-gray-200"
>
  <svg aria-hidden="true" focusable="false" />
</button>
```

## Guidelines
- Prefer native elements (`button`, `a`, `input`) over div-based controls.
- Pair form controls with labels and clear error text.
- Keep motion and animations respectful of reduced-motion preferences.
