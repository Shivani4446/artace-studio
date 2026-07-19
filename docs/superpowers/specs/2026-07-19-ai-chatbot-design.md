# AI Shopping Chatbot — Design Spec

## Goal

Add a floating chat widget, present on every page, that can answer questions about products/policies/blog content using live site data, and can take real action: suggest adding items to the cart (handing off to the existing Razorpay checkout), or place a Cash on Delivery order directly in the conversation for logged-in users.

## Provider

**Cloudflare Workers AI**, called via plain REST (account-scoped endpoint, API token + account ID as env vars) — the same integration pattern as the existing WooCommerce/Razorpay/Resend keys. No `wrangler.toml`/binding changes, so it carries none of the deploy-config risk this project has already hit twice with `next-on-pages`. Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (supports tool calling).

Free tier: 10,000 neurons/day. No proactive quota tracking — a failed/quota-exceeded Workers AI response is caught and surfaced as a friendly in-chat fallback message (see Guardrails).

## Components

| File | Responsibility |
|---|---|
| `components/chat/ChatWidget.tsx` | Floating bubble + panel, mounted in `app/layout.tsx` alongside the existing WhatsApp link. Present on every page. Conversation history kept in component state, persisted to `sessionStorage` (survives navigation within a tab, clears on tab close). |
| `components/chat/CartActionButton.tsx` | Renders a "Add {product} to cart →" button for `suggest_add_to_cart` actions returned by the model. |
| `lib/api-route-handlers/chat/route.ts` | New edge route, registered in `app/api/[[...path]]/route.ts` as `"chat"`. Runs the tool-calling loop, streams the response as SSE. |
| `lib/chat/workers-ai.ts` | Fetch wrapper around the Workers AI REST endpoint — request/response shaping, tool-call parsing, streaming. |
| `lib/chat/tools.ts` | Tool schema definitions: `search_products`, `get_product_details`, `get_policy`, `search_blog`, `suggest_add_to_cart`, `place_cod_order`. |
| `lib/chat/system-prompt.ts` | System prompt: house style, scope guardrails, prompt-injection note. Imports and embeds the FAQ content directly (short and static, not worth a tool round-trip). |
| `lib/chat/faq-content.ts` | The store's written FAQ as a plain exported string/array — kept separate from prompt-assembly logic so it can be edited without touching `system-prompt.ts`. |
| `lib/chat/order.ts` | COD order creation — a dedicated function (not a modification of the existing checkout route) that reuses `createWooCommerceOrder` from `utils/woocommerce-checkout.ts` with `payment_method: "cod"`, `payment_method_title: "Cash on Delivery"`, `set_paid: false`, skipping the Razorpay order step entirely. |

## Tool Design

Two kinds of tools, split by where the resulting state lives:

- **Read tools** (`search_products`, `get_product_details`, `get_policy`, `search_blog`) execute entirely server-side inside the tool-calling loop, wrapping the same WooCommerce Store API functions and blog/article-fetching functions already used elsewhere in the codebase (e.g. `ShopCatalog`, `ArticleLayout`). Results feed back into the model, which loops until it produces text or an action-tool call.
- **Action tools** split further by where the mutation needs to happen:
  - `suggest_add_to_cart` — cart state lives in client-side `CartProvider` React state, so this tool does **not** execute anything server-side. It returns a structured suggestion (product id, variation, quantity) that the server passes through in the stream; the client renders it as a `CartActionButton`, and clicking it calls the existing `addToCart()` and optionally routes to checkout (Razorpay payment, unchanged).
  - `place_cod_order` — creates a real WooCommerce order, so it runs server-side. Requires all of: name, address, phone, line items. If the model calls it with missing fields, the server returns an error tool-result (not a thrown exception) so the model asks the user conversationally instead of guessing or fabricating values.

## Order Flow

Two paths, matching the two order-taking mechanisms decided during brainstorming:

1. **Cart → checkout (card/UPI via Razorpay):** bot suggests items via `suggest_add_to_cart`; user clicks the rendered button; existing `CartProvider.addItem()` + checkout page handle everything from there, unchanged.
2. **In-chat Cash on Delivery:** bot collects the missing details conversationally, then calls `place_cod_order`.
   - **Requires login**, matching the existing site-wide policy (`lib/api-route-handlers/checkout/route.ts` already blocks all guest checkout — "account required before placing an order" — so a guest-COD path in chat would silently reopen whatever risk that policy was written to prevent). A guest attempting to place a COD order is asked to sign in first; they can still browse and ask questions as a guest.
   - Once authenticated, `lib/chat/order.ts` builds the order via `createWooCommerceOrder` directly (no Razorpay order, no payment redirect) and returns a plain confirmation with the WooCommerce order number.

## Data Flow

1. User sends a message → client POSTs it + recent conversation history (last ~10 turns from component state) to `/api/chat`.
2. Edge route assembles system prompt + tool schemas + conversation, calls Workers AI.
3. Read-tool calls execute inline, loop continues until the model produces text or an action-tool call.
4. `place_cod_order` calls are validated and executed server-side (see above); `suggest_add_to_cart` calls pass through untouched.
5. Response streams to the client as SSE: text deltas as they generate, plus a final small JSON block carrying any pending cart-suggestion actions.
6. Client renders streamed text live; renders `CartActionButton`s for any cart suggestions attached to that message.

## Guardrails

- **Quota fallback:** no proactive daily-usage tracking (avoids a new KV/DB dependency). A Workers AI failure or quota-exceeded response is caught and returned as a normal-looking assistant message pointing the user to WhatsApp or the shop directly.
- **Tool failures:** returned to the model as an error tool-result (not surfaced as a raw exception), so it can tell the user it couldn't look something up right now.
- **Prompt-injection awareness:** product descriptions/reviews returned by tools are explicitly marked as untrusted data in the system prompt, not instructions.
- **Scope:** system prompt keeps the bot to the store's own catalog/policies — no price negotiation, no claims beyond what tools return.
- **Rate limiting / abuse:** handled via Cloudflare's existing dashboard-level rate-limiting rules, not custom application code.

## Widget Placement

Floating bubble on every page (matches the existing WhatsApp button pattern), not restricted to shop/product pages.

## Testing Approach

No test framework in this repo (established project constraint). Verification via `npx tsx` throwaway scripts for pure functions (tool-argument validation, order-payload construction) and dev-server curl/browser checks for the end-to-end streaming route — consistent with how every other feature in this project has been verified.
