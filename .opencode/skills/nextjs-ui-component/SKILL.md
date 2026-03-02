---
name: nextjs-ui-component
description: Use when creating any new React UI component in Next.js (buttons, cards, forms, etc.). Focus on reusability, TypeScript, Tailwind CSS, and accessibility.
---

Generate clean, reusable React components.

## When To Use
- Use for any new UI component in a Next.js app.
- Use for refactors that turn page-specific JSX into reusable components.
- Use when reviewing component architecture, props, and accessibility.

## Instructions
- Use TypeScript with explicit props interfaces.
- Style exclusively with Tailwind CSS using a mobile-first responsive approach.
- Default to Server Components; add `'use client'` only when interactivity is required.
- Place reusable components in `/components` or `/ui`.
- Follow accessibility basics: semantic HTML, keyboard usability, and ARIA only when needed.
- Export with clear naming (`export function ...` or `export default ...`) consistent with project patterns.
- Ask for clarification when state handling or interactive behavior is ambiguous.

## Example
```tsx
// components/ProjectCard.tsx
import { cn } from "@/lib/utils"; // If using shadcn/ui utils

interface ProjectCardProps {
  title: string;
  description: string;
  href: string;
}

export function ProjectCard({ title, description, href }: ProjectCardProps) {
  return (
    <a
      href={href}
      className={cn(
        "block rounded-lg border p-6 transition-colors hover:bg-gray-50",
        "dark:hover:bg-gray-800"
      )}
      aria-label={`View project: ${title}`}
    >
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </a>
  );
}
```

## Guidelines
- Prefer composable APIs (`children`, slots, and optional className overrides).
- Keep components focused; split large components into smaller primitives.
- Avoid hard-coded copy when a prop improves reuse.
