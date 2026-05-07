# Technology Stack

**Analysis Date:** 2026-04-17

## Languages

**Primary:**
- TypeScript 5.x - Full-stack development
- JavaScript - Legacy components and utilities

## Runtime

**Environment:**
- Next.js 16.1.4 (App Router)
- Node.js (Edge runtime for API routes)

**Package Manager:**
- npm
- Lockfile: package-lock.json (not in repo, generated on install)

## Frameworks

**Core:**
- Next.js 16.1.4 - React framework with App Router, Server Components
- React 19.2.3 - UI library
- React DOM 19.2.3

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- LightningCSS 1.31.1 - CSS minification

**Build/Dev:**
- ESLint 9 - Linting
- eslint-config-next 16.1.4 - Next.js ESLint configuration

## Key Dependencies

**Core:**
- `next` 16.1.4 - Next.js framework
- `react` 19.2.3 - React
- `react-dom` 19.2.3 - React DOM renderer

**Styling:**
- `tailwindcss` 4 - CSS framework
- `@tailwindcss/postcss` 4 - PostCSS plugin for Tailwind
- `lightningcss` 1.31.1 - CSS optimizer

**Database & Storage:**
- `@supabase/supabase-js` 2.100.1 - Supabase client (for storage and database)

**UI:**
- `lucide-react` 0.563.0 - Icon library

**SEO:**
- `@next/third-parties` 16.1.4 - Third-party integrations (Google Fonts, etc.)

## Type Definitions

- `@types/node` 20 - Node.js types
- `@types/react` 19 - React types
- `@types/react-dom` 19 - React DOM types

## Configuration

**Build:**
- `next.config.ts` - Next.js configuration
  - TypeScript ignoreBuildErrors enabled
  - Remote images allowed from: Unsplash, artacestudio.com, api.artacestudio.com, i[0-2].wp.com (WordPress CDN)

**Environment:**
- `.env.local` - Local environment variables (not committed)
- `.env.example` - Template for environment variables

**Edge Runtime:**
- Most API routes use `experimental-edge` or `edge` runtime for performance

---

*Stack analysis: 2026-04-17*