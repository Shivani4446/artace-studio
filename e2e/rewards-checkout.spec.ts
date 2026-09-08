import { test, expect } from "@playwright/test";
import { mockAuthenticatedSession, seedCart, mockRazorpayWidget, mockCheckoutApi, mockRewardsBalance } from "./mocks";

// Smoke test for Artace Rewards redemption at checkout — same fully-mocked
// approach as checkout.spec.ts (no real Razorpay, no real WooCommerce order,
// no real Supabase write). This only proves the UI/API-contract wiring; the
// real ledger-writing behavior is verified against a live server per the
// implementation plan's Task 3/4/6 live-check steps, not here.
test.describe("Checkout — Artace Rewards redemption", () => {
  test("applies points as a discount and sends pointsToRedeem to /api/checkout", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockRewardsBalance(page, 250);

    await page.goto("/checkout");

    await expect(page.getByText("You have 250 points available.")).toBeVisible({ timeout: 10_000 });

    // The coupon box also has an "Apply" button with identical text, so
    // scope to the points input's own container rather than matching both.
    const pointsInput = page.getByPlaceholder(/100-/);
    await pointsInput.fill("150");
    await pointsInput.locator("..").getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText("− ₹150 applied")).toBeVisible();

    await page.getByPlaceholder("First Name").fill("Test");
    await page.getByPlaceholder("Last Name").fill("User");
    await page.getByPlaceholder("Phone").fill("9999999999");
    await page.getByPlaceholder("Address Line 1").fill("123 Test Street");
    await page.getByPlaceholder("City").fill("Pune");
    await page.getByPlaceholder("State").fill("Maharashtra");
    await page.getByPlaceholder("PIN / ZIP").fill("411001");

    const checkoutRequest = page.waitForRequest(
      (req) => req.url().includes("/api/checkout") && !req.url().includes("verify") && req.method() === "POST"
    );

    await page.getByRole("button", { name: "Pay with Razorpay" }).click();

    const req = await checkoutRequest;
    expect(req.postDataJSON().pointsToRedeem).toBe(150);
  });

  test("shows the locked state below the minimum redemption threshold", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockRewardsBalance(page, 40);

    await page.goto("/checkout");

    await expect(page.getByText("You have 40 points — earn 60 more to redeem your first reward.")).toBeVisible({
      timeout: 10_000,
    });
  });
});
