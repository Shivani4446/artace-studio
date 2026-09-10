import { test, expect, devices } from "@playwright/test";

test.describe("View in Your Room", () => {
  test("the button does not appear on a desktop viewport", async ({ page }) => {
    await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
    await expect(page.getByRole("button", { name: "View in Your Room" })).toHaveCount(0);
  });

  test.describe("on a mobile viewport", () => {
    // devices["iPhone 13"] includes defaultBrowserType, which Playwright
    // refuses to set via test.use() inside a describe block (it forces a new
    // worker) — spread everything else, drop that one field.
    const { defaultBrowserType: _defaultBrowserType, ...iPhone13WithoutBrowserType } = devices["iPhone 13"];
    void _defaultBrowserType;
    test.use({ ...iPhone13WithoutBrowserType });

    test("the button opens a user-initiated camera prompt", async ({ page }) => {
      await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
      await expect(page.getByRole("button", { name: "View in Your Room" })).toBeVisible();
      await page.getByRole("button", { name: "View in Your Room" }).click();
      await expect(page.getByRole("button", { name: "Start camera" })).toBeVisible();
    });

    test("shows the camera-denied message when permission is refused", async ({ page }) => {
      // Plain `navigator.mediaDevices = {...}` assignment silently no-ops in
      // Chromium (mediaDevices is a getter-only property on the prototype) —
      // Object.defineProperty is what actually overrides it for the test.
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "mediaDevices", {
          configurable: true,
          value: { getUserMedia: () => Promise.reject(new Error("Permission denied")) },
        });
      });

      await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
      await page.getByRole("button", { name: "View in Your Room" }).click();
      await page.getByRole("button", { name: "Start camera" }).click();

      await expect(page.getByText("Camera could not start")).toBeVisible();
    });

    test("shows the insecure-context message when navigator.mediaDevices doesn't exist", async ({ page }) => {
      // Reproduces the real bug report: on an insecure (non-HTTPS, non-localhost)
      // origin, navigator.mediaDevices is undefined by browser design — calling
      // .getUserMedia on it throws synchronously before any .catch() can attach.
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "mediaDevices", {
          configurable: true,
          value: undefined,
        });
      });

      await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
      await page.getByRole("button", { name: "View in Your Room" }).click();

      await expect(page.getByText("This feature needs a secure connection.")).toBeVisible();
    });
  });
});
