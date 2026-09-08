import { test, expect } from "@playwright/test";

// Smoke test for the lead-capture form flows (suggestion.md, section 2.3).
// No payment involved here (unlike checkout.spec.ts / custom-portraits.spec.ts),
// so the only mock needed is the form's own API route — this covers the
// same pattern shared by trade-leads, design-partners, and
// canvas-roll-enquiries (all mirror this exact fetch/response shape; see
// lib/api-route-handlers/trade-leads/route.ts).
test.describe("Trade application (lead-capture form)", () => {
  test("submits successfully and shows the confirmation message", async ({ page }) => {
    await page.route("**/api/trade-leads", (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/trade");

    await page.getByPlaceholder("Enter your name").fill("Test Designer");
    await page.getByPlaceholder("Your studio or firm").fill("Test Studio");
    await page.getByPlaceholder("you@studio.com").fill("designer@example.com");
    await page.getByPlaceholder("+91 00000 00000").fill("9999999999");

    // Profession is a custom dropdown, not a native <select>.
    await page.getByRole("button", { name: "Select your profession" }).click();
    await page.getByText("Interior Designer", { exact: true }).click();

    const leadRequest = page.waitForRequest(
      (req) => req.url().includes("/api/trade-leads") && req.method() === "POST"
    );

    await page.getByRole("button", { name: "Apply for Trade Access" }).click();

    const req = await leadRequest;
    const body = req.postDataJSON();
    expect(body.fullName).toBe("Test Designer");
    expect(body.email).toBe("designer@example.com");
    expect(body.profession).toBe("Interior Designer");

    await expect(page.getByText(/We've received your application/)).toBeVisible({ timeout: 10_000 });
  });

  test("shows an error message if the API call fails", async ({ page }) => {
    await page.route("**/api/trade-leads", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Server error." }) })
    );

    await page.goto("/trade");

    await page.getByPlaceholder("Enter your name").fill("Test Designer");
    await page.getByPlaceholder("you@studio.com").fill("designer@example.com");
    await page.getByPlaceholder("+91 00000 00000").fill("9999999999");
    await page.getByRole("button", { name: "Select your profession" }).click();
    await page.getByText("Interior Designer", { exact: true }).click();

    await page.getByRole("button", { name: "Apply for Trade Access" }).click();

    await expect(page.getByText("Server error.")).toBeVisible({ timeout: 10_000 });
  });
});
