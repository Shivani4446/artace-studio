# Testing Patterns

**Analysis Date:** 2026-04-17

## Test Framework

**Runner:**
- Not configured - No test runner in `package.json`
- No `jest.config.*`, `vitest.config.*`, or `playwright.config.*`

**Assertion Library:** Not applicable (no tests)

**Run Commands:**
```bash
npm run lint    # Run ESLint only (no test commands in package.json)
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

No test-related scripts defined.

### Dependencies
Only production packages installed:
- `next: 16.1.4`
- `react: 19.2.3`
- `react-dom: 19.2.3`
- `lucide-react: 0.563.0`
- `@tailwindcss/postcss: 4`
- `@supabase/supabase-js: 2.100.1`
- `typescript: 5`
- `@next/third-parties: 16.1.4`
- `lightningcss: 1.31.1`

Dev dependencies:
- `@types/node: 20`
- `@types/react: 19`
- `@types/react-dom: 19`
- `@types/react: 19`
- `eslint: 9`
- `eslint-config-next: 16.1.4`
- `@tailwindcss/postcss: 4`
- `tailwindcss: 4`
- `typescript: 5`

## Test File Organization

**Location:** Not detected - No test files in codebase

**Search results:**
- `**/*.test.ts` - No files found
- `**/*.test.tsx` - No files found
- `**/*.spec.ts` - No files found
- `**/*.spec.tsx` - No files found

**Structure:** None

```
# No test directory structure detected
```

## Test Structure

**Suite Organization:** Not applicable (no tests)

**Patterns:** Not applicable

## Mocking

**Framework:** None configured

**What to Mock:** Not applicable

**What NOT to Mock:** Not applicable

## Fixtures and Factories

**Test Data:** Not applicable

**Location:** Not applicable

## Coverage

**Requirements:** None enforced

**View Coverage:** No test runner configured

## Test Types

**Unit Tests:** None implemented

**Integration Tests:** None implemented

**E2E Tests:** Not used

## Common Patterns

### Code Quality Without Tests
The project relies on:
1. `ESLint` (`npm run lint`) - catches syntax and style issues
2. TypeScript strict mode - catches type errors at compile time
3. `Next.js build` (`npm run build`) - validates routes and imports
4. Manual browser testing for functional verification

### What's Checked via ESLint
- No unused variables
- Type correctness
- React hooks rules
- Next.js best practices
- Import/export validity

### Linting Configuration
```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "target": "ES2017"
  }
}
```

## Known Code Quality Issues

### Pre-existing Lint Errors
Some files contain pre-existing lint issues:
- `app/blog-test/page.tsx` - Has lint errors
- `app/rentals/page.tsx` - Has lint errors

### TypeScript Build Errors
- Errors in `.next/dev/types/` - Related to API route type generation, not new features

## Recommended Test Areas

If testing is desired, recommended priority areas:

### 1. Utilities (Pure Functions)
- `utils/text.ts` - decodeHtmlEntities, stripHtmlAndDecode
- `utils/gtm.ts` - GTM tracking functions
- `utils/collections.ts` - Collection helpers

### 2. Context Providers (State Logic)
- `components/cart/CartProvider.tsx` - Cart state management
- `components/wishlist/WishlistProvider.tsx` - Wishlist state management
- `components/auth/AuthSessionProvider.tsx` - Auth session handling

### 3. Components (UI)
- `components/cart/AddToCartButton.tsx` - Cart interactions
- `components/ui/CustomDropdown.tsx` - UI interactions

### 4. API Routes (Response Handling)
- Response validation in route handlers
- Error case handling

## Implementation Recommendations

### Unit Testing (Vitest)
```bash
npm install -D vitest @testing-library/react @testing-library/dom jsdom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

### E2E Testing (Playwright)
```bash
npm install -D @playwright/test
npx playwright install
```

### Test Structure
```
tests/
├── unit/
│   ├── utils/
│   │   └── text.test.ts
│   └── components/
│       └── CartProvider.test.tsx
├── integration/
└── e2e/
    └── checkout.spec.ts
```

### CI Integration
```yaml
# .github/workflows/test.yml
- name: Lint and Type Check
  run: npm run lint && npx tsc --noEmit
```

---

*Testing analysis: 2026-04-17*