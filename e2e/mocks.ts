import type { Page } from "@playwright/test";

/**
 * Shared network-boundary mocks for the checkout/payment smoke tests.
 *
 * Nothing here talks to a real service: Razorpay's hosted checkout.js is
 * replaced with a stub that immediately (and successfully) "completes" a
 * payment via the same `handler` callback the real SDK would call, and this
 * app's own /api/checkout + /api/checkout/verify routes are stubbed too —
 * calling the real ones would create a real WooCommerce order on every CI
 * run, which is exactly what a network-level mock avoids. This exercises
 * 100% of the real client-side code (form validation, state transitions,
 * the actual fetch calls with their actual payloads, the redirect) while
 * touching zero real payment or order infrastructure. See suggestion.md,
 * section 2.3, for why this approach was chosen over hitting Razorpay's own
 * test/sandbox mode.
 */

export const MOCK_SESSION = {
  session: {
    user: {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
    },
  },
};

export const MOCK_RAZORPAY_ORDER = {
  success: true,
  orderId: 999001,
  orderKey: "wc_order_test_key",
  orderNumber: "999001",
  total: "5000.00",
  currency: "INR",
  razorpay: {
    keyId: "rzp_test_mock",
    orderId: "order_mock_123",
    amount: 500000,
    currency: "INR",
    name: "Artace Studio",
    description: "Order #999001",
    prefill: { name: "Test User", email: "test@example.com", contact: "9999999999" },
    notes: {},
  },
};

export async function mockAuthenticatedSession(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_SESSION) })
  );
}

/** Seeds the cart via localStorage before the page's own scripts run — see components/cart/CartProvider.tsx for the storage key/shape this matches. */
export async function seedCart(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "artace-mini-cart",
      JSON.stringify([
        {
          id: "test-product-1",
          woocommerceProductId: 12345,
          title: "Test Smoke-Test Painting",
          image: "/images/product-ship.png",
          price: 5000,
          quantity: 1,
        },
      ])
    );
  });
}

/** Replaces Razorpay's real hosted checkout.js with a stub that instantly reports a successful payment via the same `handler` callback contract the real SDK uses. */
export async function mockRazorpayWidget(page: Page) {
  await page.route("https://checkout.razorpay.com/v1/checkout.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `
        window.Razorpay = function (options) {
          return {
            open: function () {
              setTimeout(function () {
                options.handler({
                  razorpay_payment_id: "pay_mock_test",
                  razorpay_order_id: options.order_id,
                  razorpay_signature: "mock_signature_for_testing",
                });
              }, 50);
            },
          };
        };
      `,
    })
  );
}

export async function mockCheckoutApi(page: Page) {
  await page.route("**/api/checkout", (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_RAZORPAY_ORDER),
    });
  });

  await page.route("**/api/checkout/verify", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) })
  );
}

export const MOCK_PORTRAIT_ORDER = {
  success: true,
  orderId: 999002,
  orderKey: "wc_order_test_key_portrait",
  orderNumber: "999002",
  estimatedPrice: 15500,
  depositAmount: 5000,
  razorpay: {
    keyId: "rzp_test_mock",
    orderId: "order_mock_portrait_123",
    amount: 500000,
    currency: "INR",
    name: "Artace Studio",
    description: "Custom Portrait Deposit — Order #999002",
    prefill: { name: "Test User", email: "test@example.com", contact: "9999999999" },
    notes: {},
  },
};

/** Stubs the reference-photo upload (components/custom-order/ImageUpload.tsx) so no file ever reaches real storage. */
export async function mockUploadImage(page: Page) {
  await page.route("**/api/upload-image", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ urls: ["https://api.artacestudio.com/mock-reference-photo.jpg"] }),
    })
  );
}

export async function mockCustomPortraitsApi(page: Page) {
  await page.route("**/api/custom-portraits", (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_PORTRAIT_ORDER),
    });
  });
}

export async function mockRewardsBalance(page: Page, balance: number) {
  await page.route("**/api/rewards/balance", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ balance }) })
  );
}

export async function mockGiftCardBalance(page: Page, response: { found: boolean; remainingBalance: number }) {
  await page.route("**/api/gift-cards/balance*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(response) })
  );
}
