---
name: nextjs-page-layout
description: Use when adding new pages, routes, or layouts in Next.js App Router projects.
---

Create pages and layouts for the App Router.

## When To Use
- Use when creating `app/**/page.tsx` or `app/**/layout.tsx`.
- Use when introducing route groups, nested layouts, or metadata.
- Use when standardizing page scaffolding and responsive containers.

## Instructions
- Use the `/app` directory structure.
- Export `metadata` with meaningful title and description.
- Prefer Server Components for pages and layouts.
- Wrap page content in responsive Tailwind containers.
- Support nested layouts through `{children}`.
- Keep layout concerns (shell, nav, spacing) in layouts, not page files.

## Example
```tsx
// app/dashboard/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>
      {/* Main content */}
    </div>
  );
}
```

## Guidelines
- Keep route segments small and purpose-driven.
- Use colocated components for route-specific UI.
- Add loading and error boundaries when the route needs them.
