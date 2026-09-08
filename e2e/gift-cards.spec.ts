import { test, expect } from "@playwright/test";
import { mockAuthenticatedSession, seedCart, mockRazorpayWidget, mockCheckoutApi, mockGiftCardBalance } from "./mocks";

test.describe("Checkout — Gift Card redemption", () => {
  test("applies a valid gift card as a discount and sends the code to /api/checkout", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockGiftCardBalance(page, { found: true, remainingBalance: 2000 });

    await page.goto("/checkout");

    const codeInput = page.getByPlaceholder("ARTACE-XXXX-XXXX-XXXX");
    await codeInput.fill("ARTACE-TEST-CODE-0001");
    await codeInput.locator("..").getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText(/applied \(ARTACE-TEST-CODE-0001\)/)).toBeVisible();

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
    expect(req.postDataJSON().giftCardCode).toBe("ARTACE-TEST-CODE-0001");
  });

  test("shows an error for an invalid code", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockGiftCardBalance(page, { found: false, remainingBalance: 0 });

    await page.goto("/checkout");

    const codeInput = page.getByPlaceholder("ARTACE-XXXX-XXXX-XXXX");
    await codeInput.fill("ARTACE-BAD1-CODE-0000");
    await codeInput.locator("..").getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText("That gift card code isn't valid or has no remaining balance.")).toBeVisible();
  });
});
