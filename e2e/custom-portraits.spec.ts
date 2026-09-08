import { test, expect } from "@playwright/test";
import { mockRazorpayWidget, mockUploadImage, mockCustomPortraitsApi } from "./mocks";

// Smoke test for the Custom Portraits deposit flow (suggestion.md, section
// 2.3) — a guest checkout, unlike the main cart flow, so no session mock is
// needed. Same hermetic-mocking approach as checkout.spec.ts: the reference
// photo upload, the deposit order creation, and Razorpay are all stubbed;
// /api/checkout/verify is reused as-is (this flow shares that exact
// endpoint with the main checkout — see lib/api-route-handlers/checkout).
test.describe("Custom Portraits deposit", () => {
  test("completes a deposit payment end-to-end with a mocked payment", async ({ page }) => {
    await mockRazorpayWidget(page);
    await mockUploadImage(page);
    await mockCustomPortraitsApi(page);
    await page.route("**/api/checkout/verify", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) })
    );

    await page.goto("/custom-portraits");

    // Upload a reference photo — required before submit is allowed.
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: "reference.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]),
      });

    await page.getByPlaceholder("Enter your name").fill("Test User");
    await page.getByPlaceholder("you@email.com").fill("test@example.com");
    await page.getByPlaceholder("+91 00000 00000").fill("9999999999");

    const payButton = page.getByRole("button", { name: /Pay ₹[\d,]+ & Confirm My Portrait/ });
    await expect(payButton).toBeEnabled({ timeout: 15_000 });

    const orderRequest = page.waitForRequest(
      (req) => req.url().includes("/api/custom-portraits") && req.method() === "POST"
    );
    const verifyRequest = page.waitForRequest(
      (req) => req.url().includes("/api/checkout/verify") && req.method() === "POST"
    );

    await payButton.click();

    const orderReq = await orderRequest;
    const orderBody = orderReq.postDataJSON();
    expect(orderBody.name).toBe("Test User");
    expect(orderBody.referenceImages).toHaveLength(1);

    const verifyReq = await verifyRequest;
    expect(verifyReq.postDataJSON().orderId).toBe(999002);

    await expect(page.getByText("Your Portrait Request Is Confirmed!")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Order #999002")).toBeVisible();
  });
});
