import { defineConfig, devices } from "@playwright/test";

// Smoke tests for the revenue-critical flows flagged in suggestion.md,
// section 2.3 (checkout, custom portraits deposit, lead-capture forms).
// These are hermetic: every network call to a third-party payment gateway
// and to this app's own checkout/lead-capture API routes is intercepted and
// stubbed at the network boundary (see e2e/mocks.ts), so running the suite
// never creates a real WooCommerce order, never contacts Razorpay, and is
// safe to run unattended on every PR (see .github/workflows/ci.yml).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // In CI, both: "line" for readable console output as it runs, plus an
  // "html" report written to disk so ci.yml can upload it as an artifact
  // when a test fails (a trace/screenshot dump is far more useful for
  // debugging a CI-only failure than the console log alone).
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100",
    trace: "on-first-retry",
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Builds and runs a real production server on a dedicated port, rather
  // than `next dev` — dev mode compiles each route on first request, which
  // is slow and, under multiple parallel workers hitting different routes
  // for the first time at once, flaky (this is what caused this suite's
  // first real run to fail on a plain "element not found" that had nothing
  // to do with the test logic). A production server has no such lag, is
  // faster overall despite the one-time build cost, and is what's actually
  // deployed anyway. Never touches whatever the developer already has
  // running on 3000; `reuseExistingServer: false` so a stray server from a
  // previous run can't mask a real regression.
  webServer: {
    command: "npx next build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
