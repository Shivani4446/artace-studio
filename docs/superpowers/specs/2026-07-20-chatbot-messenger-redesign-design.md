# Chatbot Messenger Redesign — Design Spec

## Goal

Rebuild the chat widget into a full Intercom-style messenger: 4 tabs (Home, Messages, Help, News), suggestion chips, an animated closed-state teaser, functional image/audio attachments, and a repositioned, expandable panel — while keeping the site's own visual theme (cream/dark palette, existing fonts and component patterns), not Intercom's dark UI.

## Position & Closed State

- Panel and its trigger button move to **bottom-right, stacked above the WhatsApp button** (`bottom-24 right-5 md:bottom-28 md:right-6` — clears the WhatsApp button's `bottom-5/6 right-5/6` footprint with a visible gap).
- **Floating teaser chip**: a small pill next to/above the round trigger button, visible only while the widget is closed, cycling through short messages — "Best Canvas Paintings", "Portraits", "Modern Art", "Religious", "Vastu Paintings" — on a timer (~4s per message) with a fade/slide transition. Dismissible with a small close control; reappears after a delay if dismissed.

## Panel Structure

**Header:** context label (current tab name or conversation title) · 3-dot menu · close (X).
- 3-dot menu: **Expand/Collapse** (toggles a larger fixed panel size) and **Clear conversation** (resets the current chat, clears `sessionStorage`).

**Tab bar** (bottom of panel, 4 tabs, icon + label): **Home · Messages · Help · News**.

## Home Tab

- Greeting: "Hi there 👋 What would you like help with?"
- Suggestion chips (tap → sends that exact text as a chat message and switches to the Messages tab, so the AI answers using its existing tools — no special per-chip logic):
  - "Check what's New"
  - "Order Landscape Paintings"
  - "Order Custom Portraits"
  - Category chips sourced from the real collection list already in `utils/collections.ts` (e.g. "Ganapati Painting", "Radha Krishna", "Buddha Paintings", "Abstract Paintings", "Landscape & Cityscape") — a handful shown, not the full list, to keep the row scannable.

## Messages Tab

- Same conversation as today (single ongoing chat, no multi-thread inbox) — this tab is simply the full-height view of it.
- Each **assistant** message shows a small "Artsa · {time}" line (name + timestamp) near the bubble; each message has a fade/slide-in entrance animation as it's added, and a typing/streaming indicator (animated dots) before the first token of a response arrives.
- Cart-suggestion buttons under a message: unchanged from today.
- **Input bar**: emoji button (opens a small curated emoji grid — no new npm dependency), image-attach button, audio-record button, text field, send button. Styled to match the site's existing input/dropdown patterns (rounded, `#1f1f1f`/`#f4f2ee` palette), not copied from the Intercom reference's visual style.
- Below the input bar: "By chatting with us, you agree to our [Privacy Policy]" (links to `/privacy-policy`).

### Image attachment (fully functional)

- Tap image icon → native file picker (`accept="image/*"`) → thumbnail preview shown above the input before sending → on send, the image is base64-encoded and included in that turn's request only.
- Server builds that turn's Gemini `Content` with both a `text` part (if any was typed) and an `inlineData` part (the image) — Gemini analyzes it directly (native vision support). The image is **not** persisted into `sessionStorage` history (avoids bloating client storage) — only the resulting text exchange is kept, same as any other turn.
- Client-side size cap (~4MB) with a friendly rejection message above that.

### Audio recording (fully functional)

- Tap mic icon → browser `MediaRecorder` API records → tap again to stop → recording is sent to a new endpoint that transcribes it via Gemini (audio input → text output) → the returned transcript is sent as the user's message automatically (voice-message UX, not a separate "audio message" bubble type).
- Mic permission requested on first use; a friendly inline error if denied.
- **Verified live:** Gemini's `generateContent` accepts `audio/wav` inline audio and correctly tokenizes/transcribes it (confirmed with a real request during design). **Not yet verified:** `MediaRecorder`'s actual browser output format — Chrome typically produces `audio/webm` (Opus codec), which could not be tested here (no browser in this environment). The implementation must record a real sample in an actual browser and confirm Gemini accepts the resulting `mimeType`; if not, fall back to requesting `audio/ogg;codecs=opus` from `MediaRecorder` (supported in Firefox and some Chromium builds) or transcoding client-side before upload.

## Help Tab

- Mini search bar at the top (client-side substring filter, no backend call).
- Lists the store's 4 policies (`lib/chat/policy-content.ts`) and the FAQ entries (`lib/chat/faq-content.ts`) as an expandable accordion (reusing the existing `components/blog/FaqAccordion.tsx` pattern) — no new content to author, this is a new way to browse what the chatbot already knows.

## News Tab

- Fetches the existing `GET /api/blogs` endpoint (already returns normalized posts with image/title/excerpt/date — no backend changes needed) and renders a feed, newest first, each item linking to `/blogs/{slug}`.

## Data Model Changes

- Each stored message gains a `timestamp: number` (set at creation) for the Messages tab's timestamp display.
- Conversation stays single-thread, `sessionStorage`-persisted, same key — no new storage model.

## New API Surface

- `POST /api/chat` — extended to optionally accept `image: { mimeType: string; data: string }` (base64) on the request, applied only to the current turn's message.
- `POST /api/chat/transcribe` (new) — accepts `{ mimeType, data }` (base64 audio), returns `{ text }`, using a Gemini call with an audio `inlineData` part and a "transcribe exactly" instruction.

## Component Breakdown (indicative — finalized in the implementation plan)

| File | Responsibility |
|---|---|
| `components/chat/ChatWidget.tsx` | Shell: open/closed state, expand state, active tab, mounts header/tab bar/active tab content/floating teaser. |
| `components/chat/ChatFloatingTeaser.tsx` | Closed-state rotating teaser pill + round trigger button. |
| `components/chat/ChatHeader.tsx` | Title, 3-dot menu (expand toggle, clear conversation), close button. |
| `components/chat/ChatTabBar.tsx` | Bottom 4-tab navigation. |
| `components/chat/ChatHomeTab.tsx` | Greeting + suggestion chips. |
| `components/chat/ChatMessagesTab.tsx` | Message list + streaming/send logic (today's core chat logic moves here) + mounts `ChatInputBar`. |
| `components/chat/ChatMessageBubble.tsx` | One message: bubble, name/timestamp, entrance animation, cart actions. |
| `components/chat/ChatInputBar.tsx` | Text field, emoji button, image attach, audio record, send, consent line. |
| `components/chat/ChatEmojiPicker.tsx` | Small curated emoji grid popover (no new dependency). |
| `components/chat/ChatHelpTab.tsx` | Searchable policy/FAQ accordion. |
| `components/chat/ChatNewsTab.tsx` | Blog feed from `/api/blogs`. |
| `components/chat/useChatConversation.ts` | Shared conversation state/hook: load/persist `sessionStorage`, send message (text/image), streaming parse — used by `ChatWidget`/`ChatHomeTab`/`ChatMessagesTab`. |
| `lib/api-route-handlers/chat/transcribe/route.ts` | New audio-transcription endpoint. |
| `lib/chat/gemini.ts` | Extended to build a multimodal `Content` (text + inlineData) for a single turn. |
| `lib/api-route-handlers/chat/route.ts` | Accepts the optional `image` field; builds that turn's multimodal content. |

## Global Constraints

- No new npm dependencies for the emoji picker or any other UI piece — build with what's already used in this codebase (Tailwind, lucide-react icons).
- Visual design uses the site's own palette/typography (matches `CurrencyDropdown`/existing chat bubble conventions: `#1f1f1f`, `#f4f2ee`, rounded panels) — the Intercom screenshot is a structural/feature reference only, not a visual one.
- Image attachments are never persisted to `sessionStorage`; only resulting text is kept in history.
- Audio is transcribed server-side via Gemini and sent as a normal text message — there is no distinct "voice message" bubble type to build.
- The existing single-conversation, `sessionStorage`-backed model is kept — no multi-thread/conversation-list data model.
