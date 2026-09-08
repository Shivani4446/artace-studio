import { test, expect } from "@playwright/test";
import { mockAuthenticatedSession, seedCart, mockRazorpayWidget, mockCheckoutApi } from "./mocks";

// Smoke test for the main checkout flow (suggestion.md, section 2.3). Fully
// hermetic — see e2e/mocks.ts for exactly what's stubbed and why. This
// exercises the real client code: form fields, the real /api/checkout and
// /api/checkout/verify request payloads, the checkout-stage state machine,
// and the final redirect — everything except the two things that must never
// run for real in an automated suite (Razorpay's hosted UI, a real
// WooCommerce order).
test.describe("Checkout", () => {
  test("completes a purchase end-to-end with a mocked payment", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);

    await page.goto("/checkout");

    await expect(page.getByPlaceholder("First Name")).toBeVisible();
    await page.getByPlaceholder("First Name").fill("Test");
    await page.getByPlaceholder("Last Name").fill("User");
    await page.getByPlaceholder("Phone").fill("9999999999");
    await page.getByPlaceholder("Address Line 1").fill("123 Test Street");
    await page.getByPlaceholder("City").fill("Pune");
    await page.getByPlaceholder("State").fill("Maharashtra");
    await page.getByPlaceholder("PIN / ZIP").fill("411001");

    const payButton = page.getByRole("button", { name: "Pay with Razorpay" });
    await expect(payButton).toBeEnabled({ timeout: 15_000 });

    const checkoutRequest = page.waitForRequest(
      (req) => req.url().includes("/api/checkout") && !req.url().includes("verify") && req.method() === "POST"
    );
    const verifyRequest = page.waitForRequest(
      (req) => req.url().includes("/api/checkout/verify") && req.method() === "POST"
    );

    await payButton.click();

    const createReq = await checkoutRequest;
    const createBody = createReq.postDataJSON();
    expect(createBody.lineItems).toHaveLength(1);
    expect(createBody.lineItems[0].productId).toBe(12345);
    expect(createBody.billing.firstName).toBe("Test");

    const verifyReq = await verifyRequest;
    const verifyBody = verifyReq.postDataJSON();
    expect(verifyBody.orderId).toBe(999001);
    expect(verifyBody.razorpayPaymentId).toBe("pay_mock_test");

    await expect(page).toHaveURL(/\/checkout\/success\?orderId=999001/, { timeout: 10_000 });
  });

  test("shows an error and does not proceed if Razorpay's payment window is dismissed", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockCheckoutApi(page);

    // A widget stub whose open() dismisses immediately instead of paying —
    // covers the ondismiss branch (checkout-client.tsx's modal.ondismiss).
    await page.route("https://checkout.razorpay.com/v1/checkout.js", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: `
          window.Razorpay = function (options) {
            return { open: function () { setTimeout(function () { options.modal.ondismiss(); }, 50); } };
          };
        `,
      })
    );

    await page.goto("/checkout");
    const payButton = page.getByRole("button", { name: "Pay with Razorpay" });
    await expect(payButton).toBeEnabled({ timeout: 15_000 });
    await payButton.click();

    await expect(page.getByText("Payment window closed before completion.")).toBeVisible({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/checkout$/);
  });
});
