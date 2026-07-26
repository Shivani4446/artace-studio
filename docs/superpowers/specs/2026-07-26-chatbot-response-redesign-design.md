# Chatbot Response Redesign — Design

## Context

The Artace Studio chatbot ("Artsa") is a Messenger-style widget
(`components/chat/*`) backed by an edge-runtime tool-calling loop
(`lib/api-route-handlers/chat/route.ts`, Gemini primary / Mistral fallback).
Two gaps in how responses are presented:

1. **No markdown rendering.** `ChatMessageBubble.tsx` renders
   `message.content` as raw text — `<p className="whitespace-pre-wrap">`.
   No markdown library exists in the project. If the model writes bold,
   lists, or links, they show as literal `**`/`-`/`[]()` characters.
2. **No product cards.** `lib/chat/tools.ts` already defines
   `search_products` and `get_product_details`, but their results only
   feed the model's own context — the model composes prose about products,
   with no image, no clickable link, no consistent price display. The one
   existing precedent for "tool result becomes a rendered component" is
   `suggest_add_to_cart`, whose result already flows into a
   `pendingActions` array, streamed back in the SSE `"done"` event, and
   rendered as an `AddToCartButton` in `ChatMessageBubble.tsx` today.

## Decisions

1. **Markdown scope: essentials only.** Bold, italics, bullet/numbered
   lists, links, line breaks. No headers, tables, code blocks, or
   blockquotes — out of place in a 340-380px chat bubble and not needed for
   a shopping assistant.
2. **Library: `react-markdown` + `remark-breaks`.** `react-markdown` is the
   standard, well-maintained choice and doesn't render raw HTML by default
   (no new XSS surface). `remark-breaks` is a small, single-purpose plugin
   so a single `\n` renders as a line break — without it, CommonMark
   collapses single newlines into one paragraph, which would change how
   the assistant's existing short-line writing style reads. No
   `remark-gfm` (tables/strikethrough/task lists) — not in scope per
   Decision 1.
3. **Product cards trigger on both `search_products` and
   `get_product_details`.** A multi-result search shows several small
   cards; a focused single-product lookup (the natural follow-up to a
   search, or a direct "tell me about X") shows one card with slightly
   richer detail (stock status).
4. **Card cap: 4.** `search_products` can return up to 12 results (its
   existing `limit` parameter), but only the first 4 render as cards to
   keep the chat panel scannable — this caps card *display*, not the data
   available to the model for its own text.
5. **De-duplication by product ID.** If `get_product_details` is called on
   a product already surfaced by `search_products` earlier in the same
   turn, the richer detail entry replaces the search-result entry rather
   than showing a duplicate card.
6. **`search_products` starts returning price.** The underlying Store API
   call (shared with the navbar's search, via `lib/search.ts`) already
   receives full pricing data in its response — it's just not captured
   into the `SearchProduct` type yet. Adding it is additive (new optional
   field) and requires no new API call, so it doesn't affect the navbar's
   existing search-suggestions UI, which will simply continue to ignore
   the new field.
7. **System prompt: keep text brief when cards will show.** One addition
   instructing the model that when `search_products`/`get_product_details`
   results are shown as cards, its own text should be a short intro or
   recommendation, not a re-listing of every title and price already
   visible on the cards below.

## Data flow

Mirrors the existing `suggest_add_to_cart` → `pendingActions` → SSE
`"done"` → `AddToCartButton` pattern exactly, with a parallel
`pendingProducts` array:

1. `runToolCall` in `lib/api-route-handlers/chat/route.ts`, when handling
   `search_products` or `get_product_details`, pushes normalized product
   data into `pendingProducts: ChatProductCardData[]` (de-duplicated by id,
   Decision 5) — in addition to returning the same tool result to the
   model as it does today.
2. The SSE `"done"` event gains a `products` field alongside the existing
   `actions` field: `{type: "done", actions, products}`.
3. `ChatMessage` (in `useChatConversation.ts`) gains
   `products?: ChatProductCardData[]`, captured the same way `actions`
   already is.
4. `ChatMessageBubble.tsx` renders `message.content` through the new
   markdown renderer, then `message.products` (if present) as a stack of
   `ChatProductCard` components, below the text and above any
   `AddToCartButton` actions.

`ChatProductCardData` shape (new type, in `lib/chat/tools.ts` or a shared
chat types file):

```ts
type ChatProductCardData = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number | null;
  currencySymbol?: string;
  inStock?: boolean; // only present for get_product_details results
};
```

## Components

**`ChatProductCard.tsx`** (new, `components/chat/`): compact horizontal
card — square thumbnail (~64-72px), product name (2-line clamp), price,
entire card wrapped in a `Link` to `/shop/{slug}`. Sized to fit the
existing ~340-380px chat panel width without its own scroll container.

**`ChatMessageBubble.tsx`** (modified): replace the raw-text `<p>` with
`react-markdown` (restricted component set per Decision 1), render
`message.products` as a list of `ChatProductCard`s, keep the existing
`AddToCartButton` rendering for `message.actions` unchanged and positioned
after the product cards.

## Out of scope

- No change to `suggest_add_to_cart` / `place_cod_order` behavior — only
  `search_products` and `get_product_details` gain card rendering.
- No geolocation, no analytics, no new tools.
- The navbar's own search-suggestions UI is not changed — it continues to
  ignore the new `price` field on `SearchProduct` unless a future project
  decides to use it there too.

## Standing project constraints (carried forward)

- No `git commit`/`git push` at any point — the user handles all commits
  themselves in this project.
- No test framework exists in this repo — verification uses
  `npx tsc --noEmit`, `npm run build`, and live dev-server curl/manual
  checks, per this project's established discipline. Since the chat
  backend calls real LLM APIs (Gemini/Mistral) and this project has no
  mocking infrastructure, verification of the tool-calling loop itself
  will require live manual chat interaction, not just build/type checks.
