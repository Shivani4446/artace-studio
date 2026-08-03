# Custom Account Emails (Welcome + Password Reset) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move both account-lifecycle emails (new-account welcome, password reset) from WordPress's own mechanisms into this Next.js app's own Resend-based sending, with custom HTML templates, while continuing to reuse WordPress's built-in password-reset-key security primitives via a small new mu-plugin.

**Architecture:** Two new shared building blocks (`lib/email/resend.ts`, `lib/email/templates.ts`) get consumed by two call sites: `register/route.ts` (welcome email) and a rewritten `utils/wordpress-auth.ts` (password-reset email). The password-reset rewrite calls two new authenticated WordPress REST endpoints, defined in a new mu-plugin file in this repo, instead of scraping `wp-login.php` HTML.

**Tech Stack:** Next.js 15 App Router (edge runtime), TypeScript, Resend REST API (no SDK — raw `fetch`, matching the existing `contact/route.ts` pattern), WordPress REST API, PHP (mu-plugin, deployed manually outside this repo's build).

## Global Constraints

- No new npm dependencies (hand-written inline-styled HTML email strings, no React Email/MJML/nodemailer).
- Real secrets live only in `.env.local`; `.env.example` gets a blank placeholder line only.
- `utils/wordpress-auth.ts`'s exported function signatures (`requestWordPressPasswordReset`, `resetWordPressPassword`) and their `WordPressPasswordResult` return shape must not change — the existing route handlers and frontend pages that call them require zero modification.
- The forgot-password flow must remain account-enumeration-safe from the browser's perspective: the same generic message is shown whether or not an account exists.
- Email sending must never be able to fail account creation or password reset for the end user — always best-effort, wrapped in try/catch, logged via `console.error` on failure.
- This project has no test framework. Verification is: `npx tsc --noEmit` (compare against the known pre-existing baseline — errors in `.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, and (as of this plan) `app/samora/shop/[slug]/page.tsx`, which is unrelated in-progress work already in the working tree — do not touch it), plus throwaway `node`/`tsx` scripts for logic checks (delete before committing), plus live checks against the real dev server and real Resend/WordPress APIs using `.env.local`'s real credentials.
- This is the first custom WordPress-side PHP in this project. The mu-plugin file is version-controlled in this repo for review purposes, but deploying it to the live WordPress install is a manual, out-of-repo step — do not assume it is live until the manual deployment checkpoint (before Task 5) is confirmed done.

---

### Task 1: Shared Resend transactional email sender

**Files:**
- Create: `lib/email/resend.ts`

**Interfaces:**
- Produces: `sendTransactionalEmail(input: { to: string; subject: string; html: string; text: string }): Promise<void>` — throws an `Error` if Resend isn't configured (`RESEND_API_KEY`/`RESEND_FROM` missing) or if the Resend API call itself fails (non-2xx response). Resolves with no value on success.

- [ ] **Step 1: Write the file**

```ts
// lib/email/resend.ts
type SendTransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: SendTransactionalEmailInput): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM) {
    throw new Error("Resend is not configured (RESEND_API_KEY/RESEND_FROM missing).");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Email delivery failed.");
  }
}
```

- [ ] **Step 2: Verify with a live throwaway script**

This project has no test framework — verify against the real Resend API using the real credentials already in `.env.local`. Create a temporary script (delete it after this step):

```ts
// scratch-verify-resend.mjs (temporary, delete after running)
import { sendTransactionalEmail } from "./lib/email/resend.ts";

await sendTransactionalEmail({
  to: process.env.CONTACT_TO_EMAIL || "info@artacestudio.com",
  subject: "Test: sendTransactionalEmail",
  html: "<p>This is a test of <strong>sendTransactionalEmail</strong>.</p>",
  text: "This is a test of sendTransactionalEmail.",
});

console.log("Sent OK");
```

Run (loads `.env.local` first):
```bash
set -a && source .env.local && set +a && npx tsx scratch-verify-resend.mjs
```
Expected: prints `Sent OK`, and the email actually arrives at the recipient's inbox (or is visible in the Resend dashboard's logs) with the correct subject and HTML rendering.

Then test the missing-config error path — temporarily run with the env var unset:
```bash
RESEND_API_KEY= npx tsx scratch-verify-resend.mjs
```
Expected: throws `Resend is not configured (RESEND_API_KEY/RESEND_FROM missing).`

Delete `scratch-verify-resend.mjs` when done.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline (see Global Constraints).

- [ ] **Step 4: Commit**

```bash
git add lib/email/resend.ts
git commit -m "feat: add shared Resend transactional email sender"
```

---

### Task 2: Welcome + password-reset email templates

**Files:**
- Create: `lib/email/templates.ts`

**Interfaces:**
- Consumes: `buildSiteUrl(path?: string)` from `@/lib/site` (existing — returns an absolute URL against the site's real origin).
- Produces:
  - `type EmailContent = { subject: string; html: string; text: string }`
  - `buildWelcomeEmail(input: { firstName: string }): EmailContent`
  - `buildPasswordResetEmail(input: { firstName: string; resetUrl: string }): EmailContent`

- [ ] **Step 1: Write the file**

```ts
// lib/email/templates.ts
import { buildSiteUrl } from "@/lib/site";

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

const wrapEmailHtml = (bodyHtml: string) => `<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#f1f0ed; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f0ed; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#fcfaf7; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px; text-align:center;">
                <img src="${buildSiteUrl("/images/logo.png")}" alt="Artace Studio" width="140" style="display:inline-block; border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px; color:#171717; font-size:15px; line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px 32px; border-top:1px solid #e2ddd3; color:#6b6962; font-size:12px; text-align:center;">
                Artace Studio &middot; <a href="${buildSiteUrl("/")}" style="color:#1f3f63; text-decoration:underline;">artacestudio.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const buildWelcomeEmail = ({ firstName }: { firstName: string }): EmailContent => {
  const name = firstName || "there";
  const shopUrl = buildSiteUrl("/shop");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px 0; font-size:22px; color:#222327;">Welcome to Artace Studio, ${name}!</h1>
    <p style="margin:0 0 16px 0;">Your account has been created successfully. You can now browse our collection of handcrafted canvas paintings, track your orders, and check out faster next time.</p>
    <p style="margin:0 0 24px 0;">
      <a href="${shopUrl}" style="display:inline-block; background-color:#1f3f63; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold;">Start Shopping</a>
    </p>
    <p style="margin:0; color:#6b6962; font-size:13px;">If you didn't create this account, please contact us right away.</p>
  `);

  const text = [
    `Welcome to Artace Studio, ${name}!`,
    "",
    "Your account has been created successfully. You can now browse our collection of handcrafted canvas paintings, track your orders, and check out faster next time.",
    "",
    `Start shopping: ${shopUrl}`,
    "",
    "If you didn't create this account, please contact us right away.",
  ].join("\n");

  return { subject: "Welcome to Artace Studio", html, text };
};

export const buildPasswordResetEmail = ({
  firstName,
  resetUrl,
}: {
  firstName: string;
  resetUrl: string;
}): EmailContent => {
  const name = firstName || "there";

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px 0; font-size:22px; color:#222327;">Reset your password</h1>
    <p style="margin:0 0 16px 0;">Hi ${name}, we received a request to reset your Artace Studio password. Click the button below to choose a new one.</p>
    <p style="margin:0 0 24px 0;">
      <a href="${resetUrl}" style="display:inline-block; background-color:#1f3f63; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold;">Reset Password</a>
    </p>
    <p style="margin:0 0 16px 0; color:#6b6962; font-size:13px;">This link will expire soon and can only be used once. If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
    <p style="margin:0; word-break:break-all; font-size:12px;"><a href="${resetUrl}" style="color:#1f3f63;">${resetUrl}</a></p>
  `);

  const text = [
    `Hi ${name},`,
    "",
    "We received a request to reset your Artace Studio password. Use the link below to choose a new one:",
    "",
    resetUrl,
    "",
    "This link will expire soon and can only be used once. If you didn't request this, you can safely ignore this email — your password won't be changed.",
  ].join("\n");

  return { subject: "Reset your Artace Studio password", html, text };
};
```

- [ ] **Step 2: Verify with a live throwaway script**

```ts
// scratch-verify-templates.mjs (temporary, delete after running)
import { buildWelcomeEmail, buildPasswordResetEmail } from "./lib/email/templates.ts";
import { sendTransactionalEmail } from "./lib/email/resend.ts";
import assert from "node:assert";

const welcome = buildWelcomeEmail({ firstName: "Asha" });
assert(welcome.subject === "Welcome to Artace Studio");
assert(welcome.html.includes("Asha"));
assert(welcome.html.includes("/shop"));
assert(welcome.text.includes("Asha"));

const reset = buildPasswordResetEmail({
  firstName: "Asha",
  resetUrl: "https://artacestudio.com/reset-password?login=asha&key=abc123",
});
assert(reset.subject === "Reset your Artace Studio password");
assert(reset.html.includes("abc123"));
assert(reset.text.includes("abc123"));

console.log("Template assertions passed");

// Also send both as real emails to visually confirm rendering/layout.
await sendTransactionalEmail({
  to: process.env.CONTACT_TO_EMAIL || "info@artacestudio.com",
  ...welcome,
});
await sendTransactionalEmail({
  to: process.env.CONTACT_TO_EMAIL || "info@artacestudio.com",
  ...reset,
});
console.log("Sent both test emails");
```

Run:
```bash
set -a && source .env.local && set +a && npx tsx scratch-verify-templates.mjs
```
Expected: `Template assertions passed` then `Sent both test emails`, and both emails visibly render correctly (logo, heading, button, footer) when opened in a real inbox. Delete `scratch-verify-templates.mjs` when done.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 4: Commit**

```bash
git add lib/email/templates.ts
git commit -m "feat: add welcome and password-reset email templates"
```

---

### Task 3: Send welcome email after registration

**Files:**
- Modify: `lib/api-route-handlers/auth/register/route.ts`

**Interfaces:**
- Consumes: `sendTransactionalEmail` from `@/lib/email/resend` (Task 1), `buildWelcomeEmail` from `@/lib/email/templates` (Task 2).

- [ ] **Step 1: Read the current file to find the exact insertion point**

Open `lib/api-route-handlers/auth/register/route.ts`. Find the block right after the WooCommerce customer-creation `response` is confirmed OK:

```ts
    if (!response.ok) {
      const apiMessage =
        (typeof parsed.message === "string" && parsed.message) ||
        "Unable to create your account right now.";

      return NextResponse.json(
        { ok: false, message: apiMessage },
        { status: 400 }
      );
    }

    let session = null;
```

This is the insertion point — the customer now definitely exists in WooCommerce, and this is before the sign-in attempt.

- [ ] **Step 2: Add the imports**

At the top of the file, alongside the existing imports:

```ts
import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildWelcomeEmail } from "@/lib/email/templates";
```

- [ ] **Step 3: Send the welcome email, non-blocking**

Insert this between the `if (!response.ok) { ... }` block and `let session = null;`:

```ts
    try {
      const emailContent = buildWelcomeEmail({ firstName });
      await sendTransactionalEmail({ to: email, ...emailContent });
    } catch (error) {
      // Never let a welcome-email failure block a successful registration.
      console.error("[auth/register] welcome email failed:", error);
    }

    let session = null;
```

- [ ] **Step 4: Verify live against the real dev server**

Start the dev server (`npm run dev`). Register a brand-new test account through the real UI (or `curl -X POST http://localhost:3000/api/auth/register` with a fresh unique email/JSON body matching the route's expected shape: `{firstName, lastName, email, password}`).

Expected:
- The account is created successfully (response `ok: true`) exactly as before.
- A welcome email arrives at the test address with the correct name and shop link.

Then verify the non-blocking guarantee: temporarily set `RESEND_API_KEY=` (empty) in the running dev server's environment (restart it with the var unset) and register another fresh test account.
Expected: registration still succeeds (`ok: true`); no email is sent (or fails silently); the server console logs `[auth/register] welcome email failed: ...`. Restart the dev server again afterward with the real `.env.local` values restored.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 6: Commit**

```bash
git add lib/api-route-handlers/auth/register/route.ts
git commit -m "feat: send custom welcome email after registration"
```

---

### Task 4: WordPress mu-plugin for password-reset REST endpoints

**Files:**
- Create: `wordpress/mu-plugins/artace-auth-bridge.php`

**Interfaces:**
- Produces (consumed by Task 5, once manually deployed to the live WordPress site): two REST routes under `POST {WORDPRESS_API_URL}/wp-json/artace-auth/v1/request-reset` and `POST {WORDPRESS_API_URL}/wp-json/artace-auth/v1/reset-password`, both gated by an `X-Artace-Secret` header matching the `ARTACE_AUTH_BRIDGE_SECRET` PHP constant.
  - `request-reset` request body: `{ username_or_email: string }`. Response (always HTTP 200): `{ found: false }` or `{ found: true, login, email, firstName, key }`.
  - `reset-password` request body: `{ login: string, key: string, password: string }`. Response (always HTTP 200): `{ ok: boolean, message: string }`.
  - Both return HTTP 401 with `{ error: "Unauthorized" }` if the secret header is missing or wrong.

There is no PHP toolchain in this repo/sandbox, so this task cannot be executed or linted here — write it carefully and self-review against the checklist in Step 2. Live verification happens only after the manual deployment checkpoint that follows this task.

- [ ] **Step 1: Write the file**

```php
<?php
/**
 * Plugin Name: Artace Auth Bridge
 * Description: Server-to-server REST endpoints used by the Next.js app to
 * generate and validate WordPress password-reset keys, so the reset email
 * itself can be composed and sent by the Next.js app instead of wp-login.php.
 */

if (!defined('ABSPATH')) {
    exit;
}

// If the shared secret hasn't been configured yet in wp-config.php, disable
// this plugin entirely rather than fatal-erroring on the undefined constant.
if (!defined('ARTACE_AUTH_BRIDGE_SECRET') || ARTACE_AUTH_BRIDGE_SECRET === '') {
    return;
}

function artace_auth_bridge_check_secret($request) {
    $provided = $request->get_header('X-Artace-Secret');
    if (!is_string($provided) || $provided === '') {
        return false;
    }
    return hash_equals(ARTACE_AUTH_BRIDGE_SECRET, $provided);
}

function artace_auth_bridge_request_reset($request) {
    if (!artace_auth_bridge_check_secret($request)) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 401);
    }

    $identifier = sanitize_text_field((string) $request->get_param('username_or_email'));

    if ($identifier === '') {
        return new WP_REST_Response(['found' => false], 200);
    }

    $user = is_email($identifier) ? get_user_by('email', $identifier) : false;
    if (!$user) {
        $user = get_user_by('login', $identifier);
    }

    if (!$user) {
        return new WP_REST_Response(['found' => false], 200);
    }

    $key = get_password_reset_key($user);

    if (is_wp_error($key)) {
        return new WP_REST_Response(['found' => false], 200);
    }

    return new WP_REST_Response([
        'found' => true,
        'login' => $user->user_login,
        'email' => $user->user_email,
        'firstName' => $user->first_name ?: $user->display_name,
        'key' => $key,
    ], 200);
}

function artace_auth_bridge_reset_password($request) {
    if (!artace_auth_bridge_check_secret($request)) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 401);
    }

    $login = sanitize_text_field((string) $request->get_param('login'));
    $key = sanitize_text_field((string) $request->get_param('key'));
    $password = (string) $request->get_param('password');

    if ($login === '' || $key === '' || $password === '') {
        return new WP_REST_Response([
            'ok' => false,
            'message' => 'The reset link is incomplete. Request a new password reset email.',
        ], 200);
    }

    $user = check_password_reset_key($key, $login);

    if (is_wp_error($user)) {
        return new WP_REST_Response([
            'ok' => false,
            'message' => 'This reset link is invalid or has expired. Request a new one.',
        ], 200);
    }

    reset_password($user, $password);

    return new WP_REST_Response([
        'ok' => true,
        'message' => 'Your password has been updated. You can sign in now.',
    ], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('artace-auth/v1', '/request-reset', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'artace_auth_bridge_request_reset',
    ]);

    register_rest_route('artace-auth/v1', '/reset-password', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'artace_auth_bridge_reset_password',
    ]);
});
```

- [ ] **Step 2: Self-review checklist**

Confirm each of these by reading the file back:
- [ ] Both callbacks check the secret via `artace_auth_bridge_check_secret()` as the very first line, before any user lookup.
- [ ] The secret comparison uses `hash_equals()`, never `===` or `==` (timing-attack safe).
- [ ] Every response — success, not-found, and invalid-key — returns HTTP 200, never 404 (see Global Constraints: enumeration safety must not leak via status code).
- [ ] Only the 401 unauthorized response uses a non-200 status.
- [ ] All string inputs from the request go through `sanitize_text_field()` before use (except `password`, which must stay byte-exact — sanitizing it would corrupt the actual password).
- [ ] The file bails out silently (`return;`) if `ARTACE_AUTH_BRIDGE_SECRET` isn't defined yet, rather than fatal-erroring on an undefined constant.

- [ ] **Step 3: Commit**

```bash
git add wordpress/mu-plugins/artace-auth-bridge.php
git commit -m "feat: add WordPress mu-plugin for password-reset REST bridge"
```

---

## Manual Deployment Checkpoint (required before Task 5)

Task 5 rewires `utils/wordpress-auth.ts` to call the endpoints Task 4 defines — they must actually exist on the live WordPress site first, or Task 5's live verification has nothing to talk to. Whoever manages the WordPress server needs to do this now:

1. **Generate the shared secret** (run once, keep the output):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Add it to `wp-config.php`** on the WordPress server, above the `/* That's all, stop editing! */` line:
   ```php
   define('ARTACE_AUTH_BRIDGE_SECRET', '<paste the generated value here>');
   ```
3. **Upload `wordpress/mu-plugins/artace-auth-bridge.php`** (from this repo, Task 4) to the WordPress server's `wp-content/mu-plugins/` directory (create that directory if it doesn't exist — mu-plugins auto-load, no wp-admin activation step needed).
4. **Add the same secret value to this app's environment as `WORDPRESS_INTERNAL_API_SECRET`:**
   - `.env.local` (for continued local development).
   - The Cloudflare Pages dashboard's Production environment variables (Settings → Environment variables) — this project deploys via Cloudflare Pages, and env vars added there only take effect on the *next* deployment, so also trigger a fresh deployment (push a commit, or use "Retry deployment") after adding it.
5. **Disable WooCommerce's built-in "New account" email** in wp-admin: WooCommerce → Settings → Emails → "New account" → uncheck "Enable this email notification". This prevents customers from getting both the old WooCommerce email and the new custom one from Task 3.
6. Confirm the two new endpoints are reachable (replace `<site>` and `<secret>`):
   ```bash
   curl -s -X POST "https://<site>/wp-json/artace-auth/v1/request-reset" \
     -H "Content-Type: application/json" \
     -H "X-Artace-Secret: <secret>" \
     -d '{"username_or_email":"someone@example.com"}'
   ```
   Expected: HTTP 200 with `{"found":false}` (unless that email happens to already exist) — not a 404 or 500.

7. Confirm the secret is actually enforced — repeat the same request with a wrong/missing header:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -X POST "https://<site>/wp-json/artace-auth/v1/request-reset" \
     -H "Content-Type: application/json" \
     -H "X-Artace-Secret: wrong-value" \
     -d '{"username_or_email":"someone@example.com"}'
   ```
   Expected: `401`, not `200`. This is the single most important check in this checklist — if it returns 200, the secret check is broken and the endpoint is unauthenticated.

Only proceed to Task 5 once this is done.

---

### Task 5: Rewire password-reset request/submit to use the new endpoints + send the reset email

**Files:**
- Modify: `utils/wordpress-auth.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `sendTransactionalEmail` (Task 1), `buildPasswordResetEmail` (Task 2), the two REST endpoints from Task 4 (now live per the manual checkpoint), `getWordPressApiUrl` (existing, same file), `buildSiteUrl` from `@/lib/site` (existing).
- Produces: `requestWordPressPasswordReset(username: string): Promise<WordPressPasswordResult>` and `resetWordPressPassword({login, key, password}): Promise<WordPressPasswordResult>` — **signatures and `WordPressPasswordResult` shape unchanged** from before this task, so `lib/api-route-handlers/auth/forgot-password/route.ts` and `lib/api-route-handlers/auth/reset-password/route.ts` require zero changes.

- [ ] **Step 1: Add the new env var placeholder**

In `.env.example`, add a new line after `GEMINI_API_KEY=`/`MISTRAL_API_KEY=`:

```
WORDPRESS_INTERNAL_API_SECRET=
```

- [ ] **Step 2: Add the import and endpoint helper**

At the top of `utils/wordpress-auth.ts`, add:

```ts
import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildPasswordResetEmail } from "@/lib/email/templates";
import { buildSiteUrl } from "@/lib/site";
```

Replace the three existing `wp-login.php`-based endpoint builders:

```ts
const getWordPressLostPasswordEndpoint = () =>
  `${getWordPressSiteUrl()}/wp-login.php?action=lostpassword`;

const getWordPressResetPasswordEntryEndpoint = (login: string, key: string) =>
  `${getWordPressSiteUrl()}/wp-login.php?action=rp&login=${encodeURIComponent(
    login
  )}&key=${encodeURIComponent(key)}`;

const getWordPressResetPasswordSubmitEndpoint = () =>
  `${getWordPressSiteUrl()}/wp-login.php?action=resetpass`;
```

with a single new helper:

```ts
const getArtaceAuthBridgeUrl = (path: string) =>
  `${getWordPressApiUrl()}/wp-json/artace-auth/v1${path}`;

const getArtaceAuthBridgeSecret = () => {
  const secret = safeText(process.env.WORDPRESS_INTERNAL_API_SECRET);
  if (!secret) {
    throw new Error("WORDPRESS_INTERNAL_API_SECRET is not configured.");
  }
  return secret;
};
```

- [ ] **Step 3: Rewrite `requestWordPressPasswordReset`**

Replace the entire existing function body with:

```ts
export const requestWordPressPasswordReset = async (
  username: string
): Promise<WordPressPasswordResult> => {
  const normalizedUsername = safeText(username);

  if (!normalizedUsername) {
    return {
      ok: false,
      message: "Enter your email address or username.",
    };
  }

  const genericSuccess: WordPressPasswordResult = {
    ok: true,
    message: "If an account exists for that email, we've sent a reset link.",
  };

  try {
    const secret = getArtaceAuthBridgeSecret();

    const response = await fetch(getArtaceAuthBridgeUrl("/request-reset"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Artace-Secret": secret,
      },
      body: JSON.stringify({ username_or_email: normalizedUsername }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        message: "Unable to reach WordPress right now. Please try again.",
      };
    }

    const payload = (await response.json()) as {
      found?: boolean;
      login?: string;
      email?: string;
      firstName?: string;
      key?: string;
    };

    // Enumeration-safe: return the same generic message to the browser
    // whether or not the account was found.
    if (!payload.found || !payload.login || !payload.email || !payload.key) {
      return genericSuccess;
    }

    try {
      const resetUrl = buildSiteUrl(
        `/reset-password?login=${encodeURIComponent(payload.login)}&key=${encodeURIComponent(
          payload.key
        )}`
      );
      const emailContent = buildPasswordResetEmail({
        firstName: payload.firstName || "",
        resetUrl,
      });
      await sendTransactionalEmail({ to: payload.email, ...emailContent });
    } catch (error) {
      // Don't let an email-delivery failure change the (enumeration-safe)
      // response, but do log it — otherwise a broken Resend config would
      // silently mean nobody ever gets a reset email.
      console.error("[wordpress-auth] password reset email failed:", error);
    }

    return genericSuccess;
  } catch {
    return {
      ok: false,
      message: "Unable to reach WordPress right now. Please try again.",
    };
  }
};
```

- [ ] **Step 4: Rewrite `resetWordPressPassword`**

Replace the entire existing function body with:

```ts
export const resetWordPressPassword = async ({
  login,
  key,
  password,
}: {
  login: string;
  key: string;
  password: string;
}): Promise<WordPressPasswordResult> => {
  const normalizedLogin = safeText(login);
  const normalizedKey = safeText(key);

  if (!normalizedLogin || !normalizedKey || !safeText(password)) {
    return {
      ok: false,
      message: "The reset link is incomplete. Request a new password reset email.",
    };
  }

  try {
    const secret = getArtaceAuthBridgeSecret();

    const response = await fetch(getArtaceAuthBridgeUrl("/reset-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Artace-Secret": secret,
      },
      body: JSON.stringify({
        login: normalizedLogin,
        key: normalizedKey,
        password,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        message: "Unable to reset your password right now. Please try again.",
      };
    }

    const payload = (await response.json()) as { ok?: boolean; message?: string };

    return {
      ok: Boolean(payload.ok),
      message: payload.message || "Unable to reset your password right now. Please try again.",
    };
  } catch {
    return {
      ok: false,
      message: "Unable to reset your password right now. Please try again.",
    };
  }
};
```

- [ ] **Step 5: Remove now-unused code**

`getWordPressResetPasswordEntryEndpoint`, `getWordPressResetPasswordSubmitEndpoint`, `getWordPressLostPasswordEndpoint`, `getSetCookies`, and `getCookieHeader` were only used by the old scraping implementation. Search the file for each name; if a helper has no remaining callers after Steps 3–4, delete it. `parseWordPressErrorMessage` is also likely now unused — check before deleting (it parsed WordPress's HTML error pages, which the new REST responses don't produce).

- [ ] **Step 6: Verify live end-to-end**

With the dev server running and the manual deployment checkpoint completed:

```bash
# 1. Request a reset for a real test account's email/username:
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"<real test account email or username>"}'
```
Expected: `{"ok":true,"message":"If an account exists for that email, we've sent a reset link."}`, and a real password-reset email arrives at that account's inbox with a working `/reset-password?login=...&key=...` link.

```bash
# 2. Confirm enumeration-safety: same response shape for a nonexistent account
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"definitely-not-a-real-account@example.com"}'
```
Expected: identical `{"ok":true,"message":"..."}` shape — no way to distinguish this from the real-account case.

```bash
# 3. Open the emailed link's URL, or POST directly to reset-password with the
#    real login/key values from the email, to confirm the reset actually applies:
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"login":"<login from email>","key":"<key from email>","password":"a-new-test-password-123","confirmPassword":"a-new-test-password-123"}'
```
Expected: `{"ok":true,"message":"Your password has been updated. You can sign in now."}`. Then confirm you can actually log in with the new password.

```bash
# 4. Confirm a used/invalid key is rejected:
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"login":"<same login>","key":"<same key, already used>","password":"another-test-password-456","confirmPassword":"another-test-password-456"}'
```
Expected: `{"ok":false,"message":"This reset link is invalid or has expired. Request a new one."}`.

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 8: Commit**

```bash
git add utils/wordpress-auth.ts .env.example
git commit -m "feat: send custom password-reset email via new WordPress REST bridge"
```

---

## Self-Review Notes

- **Spec coverage:** Welcome email (Task 3), password-reset email (Task 5), mu-plugin (Task 4), disabling WooCommerce's built-in email and Cloudflare env var deployment (Manual Checkpoint) — all five spec requirements are covered.
- **Type consistency:** `EmailContent`, `sendTransactionalEmail`, `buildWelcomeEmail`, `buildPasswordResetEmail` are defined once (Tasks 1–2) and consumed with matching signatures everywhere else (Tasks 3, 5).
- **Unchanged public surface:** confirmed `requestWordPressPasswordReset`/`resetWordPressPassword` keep their original signatures and `WordPressPasswordResult` shape — Task 5 does not touch `forgot-password/route.ts` or `reset-password/route.ts`.
