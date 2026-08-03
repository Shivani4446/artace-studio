# Custom Account Emails (Welcome + Password Reset) Design

## Goal

Replace the two account-lifecycle emails currently controlled entirely on the
WordPress side — the WooCommerce "New account" email and WordPress core's
hardcoded password-reset email — with custom-branded emails composed and sent
by this Next.js app via Resend, so both can be designed, edited, and version-
controlled here instead of requiring WordPress theme/plugin edits.

## Current State

- **Registration** (`lib/api-route-handlers/auth/register/route.ts`) creates
  a WooCommerce customer via `POST /wp-json/wc/v3/customers`. WooCommerce's
  own `woocommerce_created_customer` hook fires its built-in "New account"
  email as a side effect. This app never composes or sends that email.
- **Password reset** (`lib/api-route-handlers/auth/forgot-password/route.ts`,
  `lib/api-route-handlers/auth/reset-password/route.ts`, both thin wrappers
  around `utils/wordpress-auth.ts`) works by literally simulating a browser
  submitting WordPress's native `wp-login.php?action=lostpassword` /
  `action=rp` / `action=resetpass` forms — parsing redirect `Location`
  headers and `Set-Cookie` values to determine success/failure. WordPress
  core generates and sends the actual reset email; this app never sees its
  content.
- This app already has one transactional-email integration:
  `lib/api-route-handlers/contact/route.ts` sends plain-text internal
  notification emails via a raw `fetch` to `https://api.resend.com/emails`
  (no SDK, no HTML). `RESEND_API_KEY` and `RESEND_FROM` are already
  configured in `.env.local`. This is the only Resend precedent in the repo;
  there is no HTML email, no React Email, and no `resend` npm package used
  anywhere today.
- There is currently **zero custom WordPress plugin/mu-plugin code** in this
  project. Every WordPress-side interaction uses either the built-in
  WooCommerce/WP REST API, the native `wp-login.php` form endpoints (scraped
  as above), or WooCommerce's dashboard-configured webhook feature. This
  design introduces the first piece of custom WordPress-side PHP.

## Scope

1. Welcome email, sent by this app after successful registration.
2. Password-reset email, sent by this app after a reset is requested.
3. A new WordPress mu-plugin exposing two authenticated REST endpoints that
   this app calls instead of scraping `wp-login.php`, so the reset flow can
   be fully owned (template + delivery) by this codebase while still
   reusing WordPress's own reset-key generation/validation.
4. Disabling WooCommerce's built-in "New account" email (wp-admin setting,
   no code) so customers don't receive two welcome emails.

Out of scope: any other WooCommerce transactional email (order confirmation,
shipping, etc.), any change to the JWT login flow, any change to
`contact/route.ts`'s existing plain-text notification emails.

## Architecture

### Registration flow (after this change)

```
register/route.ts
  → POST wc/v3/customers (unchanged)
  → on success: sendWelcomeEmail({ firstName, email }) [best-effort, non-blocking]
  → (unchanged) attempt sign-in, return response
```

### Password-reset flow (after this change)

```
forgot-password/route.ts
  → requestWordPressPasswordReset(usernameOrEmail)
      → POST {WP}/wp-json/artace-auth/v1/request-reset
        (header: X-Artace-Secret; body: { username_or_email })
      → WP mu-plugin looks up user, calls get_password_reset_key()
      → returns { found, login, email, firstName, key } to this app
      → this app sends the reset email itself via Resend, linking to
        {SITE_URL}/reset-password?login={login}&key={key}
      → returns the SAME generic message to the browser regardless of
        whether the account was found (enumeration-safe, matches current
        behavior)

reset-password/route.ts
  → resetWordPressPassword({ login, key, password })
      → POST {WP}/wp-json/artace-auth/v1/reset-password
        (header: X-Artace-Secret; body: { login, key, password })
      → WP mu-plugin validates via check_password_reset_key(), applies via
        reset_password()
      → returns { ok, message }
```

The existing `/reset-password` frontend page
(`components/auth/ResetPasswordPageShell.tsx`) already reads `login` and
`key` from the URL query string and posts them to
`reset-password/route.ts` — it requires **no changes**.

## WordPress mu-plugin

**Source file (in this repo, reference/deployment copy):**
`wordpress/mu-plugins/artace-auth-bridge.php`. This repo has no build step
that deploys PHP anywhere — this file is version-controlled here purely so
its contents are tracked and reviewable, but making it live requires
manually copying it to `wp-content/mu-plugins/artace-auth-bridge.php` on
the actual WordPress install (mu-plugins auto-load on drop-in, no
activation step needed). That copy step is a manual, WordPress-side
operation outside this repo's scope.

Registers a new REST namespace `artace-auth/v1` with two routes:

- **`POST /request-reset`**
  - Body: `{ username_or_email: string }`
  - Header: `X-Artace-Secret: <shared secret>` — request is rejected with
    401 before any user lookup if this doesn't match.
  - Looks up the user by login or email. If found, calls WordPress's own
    `get_password_reset_key( $user )` (the same function
    `retrieve_password()` uses internally — reuses WP's existing key
    generation/expiry logic rather than reimplementing it) and returns
    `{ found: true, login, email, firstName, key }`.
  - If not found, returns `{ found: false }`. Both the found and not-found
    cases return HTTP 200 (never 404) — the outcome is only distinguished
    by the `found` field in the body, not the status code, so nothing about
    account existence leaks through transport-level signals. The calling
    Next.js code must still show the browser the same generic "if an
    account exists..." message either way — this endpoint being
    enumeration-capable server-side is fine (server-to-server, secret-gated
    only); the browser-facing behavior must stay enumeration-safe.

- **`POST /reset-password`**
  - Body: `{ login: string, key: string, password: string }`
  - Header: `X-Artace-Secret: <shared secret>`, same check.
  - Calls WordPress's own `check_password_reset_key( $key, $login )` to
    validate (returns `WP_Error` on an invalid/expired/used key), then
    `reset_password( $user, $password )` to apply the new password. Returns
    `{ ok: true }` or `{ ok: false, message }`.

Both routes register with `permission_callback` returning `true` (public
reachability is required, since Next.js's edge functions have no WP
session) but perform the secret check as the **first line** of each
callback, before touching any user data.

**Secret provisioning:** a random 40+ character string, defined once as a
PHP constant in `wp-config.php`:

```php
define('ARTACE_AUTH_BRIDGE_SECRET', '<random-generated-value>');
```

mirrored in this repo as a new env var `WORDPRESS_INTERNAL_API_SECRET`
(blank placeholder added to `.env.example`, real value in `.env.local` —
never committed, matching this project's existing secrets discipline).
This is server-to-server only, sent only from Next.js's edge functions to
WordPress — never sent to or read by the browser, the same trust model
already used for `WOOCOMMERCE_CONSUMER_KEY`/`WOOCOMMERCE_CONSUMER_SECRET`.

Installing this file is a WordPress-side operation (FTP/file manager/SSH
access to the WordPress install) outside this repository — this design
produces the PHP file's contents, but applying it to the live WordPress
site is a manual step for whoever manages that server.

## Next.js changes

- **`lib/email/resend.ts`** (new) — `sendTransactionalEmail({ to, subject,
  html, text })`, a small shared wrapper around the Resend REST call,
  generalizing the pattern already used in `contact/route.ts`'s
  `sendEmail()`. `contact/route.ts` itself is not modified — it keeps its
  own inline implementation to avoid unrelated churn.
- **`lib/email/templates.ts`** (new) — `buildWelcomeEmail({ firstName })`
  and `buildPasswordResetEmail({ firstName, resetUrl })`, each returning
  `{ subject, html, text }`. Hand-written inline-styled HTML strings — no
  new npm dependency (no React Email/MJML), consistent with this project's
  existing zero-new-dependency discipline. Visual design uses the site's
  existing palette (cream background, dark text, the same link-blue used
  elsewhere in transactional/content styling) and the logo at
  `/images/logo.png`, referenced by a full absolute URL (email clients
  don't resolve relative paths).
- **`utils/wordpress-auth.ts`** — `requestWordPressPasswordReset()` and
  `resetWordPressPassword()` are reimplemented internally to call the two
  new WordPress REST endpoints instead of scraping `wp-login.php` HTML/
  redirects. Their exported function signatures and `WordPressPasswordResult`
  return shape stay identical, so `forgot-password/route.ts` and
  `reset-password/route.ts` require no changes. `requestWordPressPasswordReset`
  additionally triggers the Resend email send on a successful key lookup.
- **`lib/api-route-handlers/auth/register/route.ts`** — one new call to
  `sendWelcomeEmail()` after the WooCommerce customer is successfully
  created (before the sign-in attempt). Non-blocking: if the email send
  throws, it's caught and logged (`console.error`), and the existing
  success response is still returned — matching how this route already
  treats a failed sign-in attempt as non-fatal to account creation.

## Error handling & security

- Email delivery failures never block account creation or password reset
  from succeeding for the user — they're best-effort, logged server-side,
  never surfaced as a user-facing error. This matches the existing
  "side-effect failures don't fail the primary action" pattern already used
  for the sign-in-after-registration step.
- The forgot-password flow's browser-facing response stays
  enumeration-safe: the same generic message is shown whether or not an
  account exists for the given email/username, exactly as today.
- The shared secret (`WORDPRESS_INTERNAL_API_SECRET`) is never exposed to
  the browser — used only in server-to-server (edge function → WordPress)
  calls.
- This retires the `wp-login.php` HTML-scraping approach entirely for
  these two actions. As a side benefit, this is more robust than the
  current implementation, which depends on parsing WordPress's login-page
  markup and redirect behavior — something that could silently break on a
  WordPress core or theme update.

## Testing

No test framework exists in this repo (established pattern — see prior
specs). Verification will be live, mirroring the discipline used earlier
in this project:
- Curl-test the two new WordPress REST endpoints directly (with and
  without the correct secret header, with a valid/invalid/expired reset
  key) once the mu-plugin is installed on the WordPress site.
- Exercise the full registration flow against the real dev server and
  confirm the welcome email arrives (via Resend's dashboard/logs or a real
  inbox) with correct content.
- Exercise the full forgot-password → email → reset-password flow
  end-to-end against the real dev server and a real WordPress account,
  confirming the emailed link lands on `/reset-password` with valid
  `login`/`key` params that the existing frontend already handles.
- `npx tsc --noEmit`, compared against the existing known-error baseline.

## Global Constraints

- No new npm dependencies (email templates are hand-written HTML, no
  React Email/MJML/nodemailer).
- Real secrets (`WORDPRESS_INTERNAL_API_SECRET`, existing Resend/WooCommerce
  keys) live only in `.env.local`; `.env.example` gets a blank placeholder
  line only.
- `utils/wordpress-auth.ts`'s public function signatures
  (`requestWordPressPasswordReset`, `resetWordPressPassword`) must not
  change, so the existing route handlers and frontend pages require zero
  modification.
- The forgot-password flow must remain account-enumeration-safe from the
  browser's perspective.
- Email sending must never be able to fail account creation or password
  reset for the end user.
