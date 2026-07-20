# Chatbot Messenger Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the chat widget into a 4-tab (Home/Messages/Help/News) Intercom-style messenger — repositioned above the WhatsApp button, with an animated closed-state teaser, suggestion chips, functional image/audio attachments via Gemini's multimodal input, timestamps, an expand/clear menu — while keeping the site's own visual theme.

**Architecture:** The existing single-conversation, `sessionStorage`-backed chat is extracted into a shared `useChatConversation` hook (adds message timestamps and optional image attachments). The panel becomes a shell (`ChatWidget.tsx`) composing a header, a 4-tab switcher, and a closed-state floating teaser. `/api/chat` gains optional per-turn image support (Gemini vision, analyzed live, never persisted); a new `/api/chat/transcribe` endpoint turns recorded audio into text via Gemini's audio understanding, which is then sent as a normal chat message. Help and News tabs are read-only views over content that already exists (policies/FAQ, and the existing `/api/blogs` endpoint) — no new content authoring.

**Tech Stack:** Next.js 15 edge routes, Gemini API (`gemini-2.5-flash`, multimodal `inlineData` parts for image/audio), React client components, Tailwind CSS (v4, CSS-first config in `app/globals.css`), `lucide-react` icons (all icons used are confirmed present: `Home`, `MessageSquare`, `HelpCircle`, `Newspaper`, `MoreVertical`, `Maximize2`, `Minimize2`, `Trash2`, `Smile`, `ImagePlus`, `Mic`, `Square`, `Search`, `ChevronDown`, `X`, `Send`, `MessageCircle`). No new npm dependencies.

## Global Constraints

- No new npm dependencies — the emoji picker is a small curated grid built from scratch, not a package.
- Visual design uses the site's existing palette/typography (`#1f1f1f`, `#f4f2ee`, `font-display` for headings, existing dropdown/panel border-radius conventions) — the Intercom reference is a structural/feature reference only, never a visual one.
- Panel position: `fixed bottom-24 right-5 z-40 md:bottom-28 md:right-6` — stacked directly above the existing WhatsApp button (`bottom-5 right-5 md:bottom-6 md:right-6` in `app/layout.tsx`, unchanged) with a visible gap, same right-edge alignment.
- Image attachments are analyzed by Gemini for the turn they're sent in only — never written to `sessionStorage`, never resent on later turns.
- Audio is transcribed server-side into plain text and sent as a normal user message — there is no distinct "voice message" bubble type anywhere in the UI or data model.
- The conversation stays single-thread (no multi-conversation inbox) — `useChatConversation` is a single hook instance shared by `ChatWidget`, used across `ChatHomeTab` (to send chip messages) and `ChatMessagesTab` (the full view).
- No test framework in this repo — verify with `npx tsc --noEmit` (confirm zero new errors; this project has known pre-existing errors in `app/warli-paintings/page.tsx`, `components/navbar.tsx`, and `.next/types/**` that are not your concern), throwaway `npx tsx`/`node` scripts for pure logic (delete after running, never commit), and dev-server curl/browser checks for routes and full integration.
- `MediaRecorder`'s actual output `mimeType` (typically `audio/webm;codecs=opus` in Chrome) has **not** been verified against Gemini's transcription endpoint in this environment (no browser available) — Task 6 must verify this with a real recording in an actual browser before considering audio recording done. Gemini's `generateContent` was verified live to accept `audio/wav` correctly; if the real browser-recorded mimeType is rejected, fall back to requesting `audio/ogg;codecs=opus` from `MediaRecorder.isTypeSupported()` if available, and note whichever outcome occurs in the task report.
- Gemini's image (`inlineData`) support was verified live in this repo's `.env.local` context during planning — a 2×2 red PNG was correctly identified as "Red" by `gemini-2.5-flash`. That confirms the wire format; it does not remove the need to test the real upload-from-browser path in Task 1.

---

### Task 1: Multimodal support in the Gemini client and chat route (image attachments)

**Files:**
- Modify: `lib/chat/gemini.ts`
- Modify: `lib/api-route-handlers/chat/route.ts`
- Test: dev-server curl check (real image, real Gemini call)

**Interfaces:**
- Produces: `Part` type in `lib/chat/gemini.ts` gains an `{ inlineData: { mimeType: string; data: string } }` variant. `runGeminiChat`'s `systemInstruction` parameter becomes optional-in-effect (empty string omits the field from the request) — needed by Task 2's transcription endpoint, which has no system prompt.
- Consumes: nothing new from other tasks.

- [ ] **Step 1: Add the `inlineData` part variant and optional system instruction to `lib/chat/gemini.ts`**

In `lib/chat/gemini.ts`, change the `Part` type:

```ts
export type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: FunctionCall }
  | { functionResponse: { name: string; response: Record<string, unknown> } };
```

And change the request body construction inside `runGeminiChat` so an empty `systemInstruction` string omits the field entirely (Gemini's `systemInstruction` is optional; sending an empty one is untested and unnecessary):

```ts
      body: JSON.stringify({
        systemInstruction: systemInstruction
          ? { parts: [{ text: systemInstruction }] }
          : undefined,
        contents,
        tools:
          functionDeclarations.length > 0
            ? [{ functionDeclarations }]
            : undefined,
        // Disable "thinking" — verified live that it otherwise burns 10-100x
        // the visible output in thinking tokens (e.g. 484 thinking tokens
        // for a 4-token reply) with no answer-quality benefit for this
        // FAQ/tool-lookup use case. Faster and cheaper without it.
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
      }),
```

(Everything else in the file — `runGeminiChat`'s signature, `extractModelContent`, `extractText`, `extractFunctionCalls`, error handling — stays exactly as-is.)

- [ ] **Step 2: Accept an optional per-message image in `lib/api-route-handlers/chat/route.ts`**

Replace the `IncomingMessage` type, `sanitizeHistory`, and the `contents` construction in `POST` with the following (everything else in the file — `runToolCall`, `streamText`, `sseResponse`, the tool loop itself — stays exactly as-is):

```ts
type IncomingMessage = {
  role?: unknown;
  content?: unknown;
  image?: { mimeType?: unknown; data?: unknown };
};

type SanitizedMessage = {
  role: "user" | "assistant";
  content: string;
  image?: { mimeType: string; data: string };
};

const sanitizeHistory = (messages: unknown): SanitizedMessage[] => {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => item as IncomingMessage)
    .map((item): SanitizedMessage | null => {
      const role = item.role === "user" || item.role === "assistant" ? item.role : null;
      if (!role) return null;

      const content = typeof item.content === "string" ? item.content.trim() : "";
      const image =
        item.image &&
        typeof item.image.mimeType === "string" &&
        typeof item.image.data === "string"
          ? { mimeType: item.image.mimeType, data: item.image.data }
          : undefined;

      if (!content && !image) return null;

      return { role, content, image };
    })
    .filter((item): item is SanitizedMessage => item !== null);
};
```

And in `POST`, replace the `contents` construction line:

```ts
  const history = sanitizeHistory(body.messages);
  const contents: Content[] = history.map((item) => {
    const parts: Part[] = [];
    if (item.content) parts.push({ text: item.content });
    if (item.image) {
      parts.push({ inlineData: { mimeType: item.image.mimeType, data: item.image.data } });
    }
    return { role: item.role === "assistant" ? "model" : "user", parts };
  });
```

- [ ] **Step 3: Verify with a real image through the actual dev server**

Start the dev server (`npm run dev`), then from the project root:

```bash
node -e "
const zlib = require('zlib');
const fs = require('fs');
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}
const width = 2, height = 2;
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8; ihdr[9] = 2;
const raw = Buffer.alloc(height * (1 + width * 3));
for (let y = 0; y < height; y++) {
  const rowStart = y * (1 + width * 3);
  for (let x = 0; x < width; x++) {
    const px = rowStart + 1 + x * 3;
    raw[px] = 255; raw[px+1] = 0; raw[px+2] = 0;
  }
}
const idatData = zlib.deflateSync(raw);
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
const png = Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idatData), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync('scratch-test.png', png);
"

node -e "
const fs = require('fs');
const data = fs.readFileSync('scratch-test.png').toString('base64');
console.log(JSON.stringify({
  messages: [{ role: 'user', content: 'What color is this image? Answer in one word.', image: { mimeType: 'image/png', data } }]
}));
" > scratch-image-request.json

curl -N -s -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" --data-binary @scratch-image-request.json

rm -f scratch-test.png scratch-image-request.json
```

Expected: the SSE stream's `delta` text spells out "Red" (or a close paraphrase), followed by `{"type":"done","actions":[]}`.

- [ ] **Step 4: Commit**

```bash
git add lib/chat/gemini.ts lib/api-route-handlers/chat/route.ts
git commit -m "feat: support per-turn image attachments in the chat API"
```

---

### Task 2: Audio transcription endpoint

**Files:**
- Create: `lib/api-route-handlers/chat/transcribe/route.ts`
- Modify: `app/api/[[...path]]/route.ts`
- Test: dev-server curl check (real audio, real Gemini call)

**Interfaces:**
- Consumes: `runGeminiChat`, `extractText` from `@/lib/chat/gemini` (Task 1's `Part` type change).
- Produces: `POST /api/chat/transcribe` — accepts `{ mimeType: string; data: string }` (base64 audio), returns `{ text: string }` or `{ error: string }`. Task 6's `ChatInputBar` calls this endpoint directly.

- [ ] **Step 1: Write `lib/api-route-handlers/chat/transcribe/route.ts`**

```ts
// lib/api-route-handlers/chat/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runGeminiChat, extractText } from "@/lib/chat/gemini";

export const runtime = "edge";

const TRANSCRIBE_INSTRUCTION =
  "Transcribe the following audio exactly as spoken. Output only the transcription text, with no extra commentary, quotes, or labels. If the audio is silent or unintelligible, output an empty string.";

export async function POST(request: NextRequest) {
  let body: { mimeType?: unknown; data?: unknown };
  try {
    body = (await request.json()) as { mimeType?: unknown; data?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const data = typeof body.data === "string" ? body.data : "";

  if (!mimeType || !data) {
    return NextResponse.json(
      { error: "Missing audio mimeType or data." },
      { status: 400 }
    );
  }

  try {
    const { content } = await runGeminiChat(
      [
        {
          role: "user",
          parts: [
            { text: TRANSCRIBE_INSTRUCTION },
            { inlineData: { mimeType, data } },
          ],
        },
      ],
      "",
      []
    );

    return NextResponse.json({ text: extractText(content).trim() });
  } catch {
    return NextResponse.json(
      { error: "Could not transcribe that right now." },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 2: Register the route in the catch-all router**

In `app/api/[[...path]]/route.ts`, add the import alongside the other `chat*` import:

```ts
import * as chatTranscribeRoute from "@/lib/api-route-handlers/chat/transcribe/route";
```

And add an entry to the `ROUTES` map, alongside the existing `chat` entry:

```ts
  "chat/transcribe": {
    POST: (request) => chatTranscribeRoute.POST(request),
  },
```

- [ ] **Step 3: Verify with real (silent, but validly-encoded) audio through the actual dev server**

With the dev server running:

```bash
node -e "
const fs = require('fs');
const sampleRate = 8000;
const nSamples = Math.floor(sampleRate * 0.3);
const data = Buffer.alloc(nSamples * 2);
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
header.write('data', 36); header.writeUInt32LE(data.length, 40);
fs.writeFileSync('scratch-test.wav', Buffer.concat([header, data]));
"

node -e "
const fs = require('fs');
const data = fs.readFileSync('scratch-test.wav').toString('base64');
console.log(JSON.stringify({ mimeType: 'audio/wav', data }));
" > scratch-audio-request.json

curl -s -X POST http://localhost:3000/api/chat/transcribe -H "Content-Type: application/json" --data-binary @scratch-audio-request.json

rm -f scratch-test.wav scratch-audio-request.json
```

Expected: HTTP 200 with a `{"text": "..."}` JSON body (the transcription of silence will likely be an empty or near-empty string — that's fine, it confirms the endpoint round-trips through Gemini correctly without error; the important thing verified here is that `audio/wav` inline audio is accepted and produces a `text` field, not an error).

- [ ] **Step 4: Commit**

```bash
git add lib/api-route-handlers/chat/transcribe/route.ts "app/api/[[...path]]/route.ts"
git commit -m "feat: add audio transcription endpoint for chat voice messages"
```

---

### Task 3: Shared conversation hook

**Files:**
- Create: `components/chat/useChatConversation.ts`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: nothing new (fetches `/api/chat`, same as today's `ChatWidget.tsx`).
- Produces: `useChatConversation()` returning `{ messages: ChatMessage[], isStreaming: boolean, sendMessage: (text: string, image?: { mimeType: string; data: string }) => Promise<void>, clearConversation: () => void }`, and the exported types `ChatMessage` (now with `timestamp: number`) and `CartSuggestion`. Tasks 4, 7, 8, 13 all import from this file.

- [ ] **Step 1: Write `components/chat/useChatConversation.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CartSuggestion = {
  productId: number;
  variationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  quantity?: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  actions?: CartSuggestion[];
};

type StreamPayload =
  | { type: "delta"; text: string }
  | { type: "done"; actions: CartSuggestion[] };

type ImageAttachment = { mimeType: string; data: string };

type RequestMessage = {
  role: "user" | "assistant";
  content: string;
  image?: ImageAttachment;
};

const STORAGE_KEY = "artace-chat-history";
const MAX_SENT_HISTORY = 10;

const loadHistory = (): ChatMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function useChatConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setMessages(loadHistory());
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string, image?: ImageAttachment) => {
      const trimmed = text.trim();
      if ((!trimmed && !image) || isStreaming) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const requestMessages: RequestMessage[] = [...messages, userMessage]
        .slice(-MAX_SENT_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      if (image && requestMessages.length > 0) {
        requestMessages[requestMessages.length - 1].image = image;
      }

      setMessages((current) => [
        ...current,
        userMessage,
        { role: "assistant", content: "", timestamp: Date.now() },
      ]);
      setIsStreaming(true);

      let assistantText = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: requestMessages }),
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            if (!chunk.startsWith("data: ")) continue;
            let payload: StreamPayload;
            try {
              payload = JSON.parse(chunk.slice(6)) as StreamPayload;
            } catch {
              continue;
            }

            if (payload.type === "delta") {
              assistantText += payload.text;
              setMessages((current) => {
                const updated = [...current];
                const lastIndex = updated.length - 1;
                updated[lastIndex] = { ...updated[lastIndex], content: assistantText };
                return updated;
              });
            } else if (payload.type === "done") {
              setMessages((current) => {
                const updated = [...current];
                const lastIndex = updated.length - 1;
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: assistantText,
                  actions: payload.actions,
                };
                return updated;
              });
            }
          }
        }
      } catch {
        setMessages((current) => {
          const updated = [...current];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: "Something went wrong — please try again in a moment.",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  return { messages, isStreaming, sendMessage, clearConversation };
}
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors introduced by this file (compare against the pre-existing baseline errors noted in Global Constraints).

- [ ] **Step 3: Commit**

```bash
git add components/chat/useChatConversation.ts
git commit -m "feat: extract shared chat conversation hook with timestamps and image support"
```

---

### Task 4: Message bubble + entrance/typing animation

**Files:**
- Create: `components/chat/ChatMessageBubble.tsx`
- Modify: `app/globals.css`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: `ChatMessage` type from `@/components/chat/useChatConversation` (Task 3); `AddToCartButton` from `@/components/cart/AddToCartButton` (existing).
- Produces: default-exported `ChatMessageBubble` component taking `{ message: ChatMessage }`. Task 7 (`ChatMessagesTab`) renders one per message.

- [ ] **Step 1: Append the entrance animation to `app/globals.css`**

Add this block at the end of `app/globals.css` (the file currently ends at line 466 with no existing `@keyframes`/`animate-` rules — append after the last line, don't touch anything above it):

```css

@keyframes chat-message-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-chat-message-in {
  animation: chat-message-in 0.25s ease-out;
}
```

- [ ] **Step 2: Write `components/chat/ChatMessageBubble.tsx`**

```tsx
"use client";

import React from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import type { ChatMessage } from "./useChatConversation";

const ASSISTANT_NAME = "Artsa";

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const ChatMessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div className={`animate-chat-message-in ${isUser ? "flex justify-end" : "flex flex-col items-start"}`}>
      {!isUser && (
        <span className="mb-1 px-1 text-[11px] text-[#96948f]">
          {ASSISTANT_NAME} · {formatTimestamp(message.timestamp)}
        </span>
      )}
      <div
        className={`max-w-[85%] rounded-[12px] px-3 py-2 text-[13px] leading-relaxed ${
          isUser ? "bg-[#1f1f1f] text-white" : "bg-white text-[#1f1f1f]"
        }`}
      >
        {message.content ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <span className="inline-flex gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#96948f] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#96948f] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#96948f]" />
          </span>
        )}
        {message.actions?.map((action) => (
          <div key={`${action.productId}-${action.variationId ?? "base"}`} className="mt-2">
            <AddToCartButton
              id={action.variationId ?? action.productId}
              woocommerceProductId={action.productId}
              woocommerceVariationId={action.variationId}
              title={action.title}
              image={action.image}
              subtitle={action.subtitle}
              price={action.price}
              quantity={action.quantity}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
```

- [ ] **Step 3: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatMessageBubble.tsx app/globals.css
git commit -m "feat: add chat message bubble with timestamp, name, and entrance animation"
```

---

### Task 5: Emoji picker

**Files:**
- Create: `components/chat/ChatEmojiPicker.tsx`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: nothing.
- Produces: default-exported `ChatEmojiPicker` taking `{ onSelect: (emoji: string) => void; onClose: () => void }`. Task 6 (`ChatInputBar`) renders this as a popover.

- [ ] **Step 1: Write `components/chat/ChatEmojiPicker.tsx`**

```tsx
"use client";

import React, { useEffect, useRef } from "react";

const EMOJIS = [
  "😀", "😊", "😍", "🥰", "😂", "👍", "🙏", "❤️", "🎉", "✨",
  "🖼️", "🎨", "🌸", "🙌", "👏", "😅", "🤔", "😢", "🔥", "💯",
];

type Props = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

const ChatEmojiPicker = ({ onSelect, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="menu"
      className="absolute bottom-full left-0 z-10 mb-2 grid w-[220px] grid-cols-5 gap-1 rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="menuitem"
          onClick={() => onSelect(emoji)}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[18px] hover:bg-[#ece8df]"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ChatEmojiPicker;
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatEmojiPicker.tsx
git commit -m "feat: add curated emoji picker for chat input"
```

---

### Task 6: Chat input bar (text, emoji, image attach, audio record, consent line)

**Files:**
- Create: `components/chat/ChatInputBar.tsx`
- Test: `npx tsc --noEmit`, plus a manual real-browser check for the audio mimeType risk noted in Global Constraints (deferred fully to Task 13's end-to-end pass, but flag it here if discovered now)

**Interfaces:**
- Consumes: `ChatEmojiPicker` from `@/components/chat/ChatEmojiPicker` (Task 5). Calls `POST /api/chat/transcribe` directly (Task 2).
- Produces: default-exported `ChatInputBar` taking `{ disabled: boolean; onSend: (text: string, image?: { mimeType: string; data: string }) => void }`. Task 7 (`ChatMessagesTab`) mounts this.

- [ ] **Step 1: Write `components/chat/ChatInputBar.tsx`**

```tsx
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Mic, Send, Smile, Square, X } from "lucide-react";
import ChatEmojiPicker from "./ChatEmojiPicker";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

type PendingImage = { mimeType: string; data: string; previewUrl: string };

type Props = {
  disabled: boolean;
  onSend: (text: string, image?: { mimeType: string; data: string }) => void;
};

const readBlobAsBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const ChatInputBar = ({ disabled, onSend }: Props) => {
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [imageError, setImageError] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioError, setAudioError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageError("");

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("That image is too large (max 4MB).");
      return;
    }

    try {
      const data = await readBlobAsBase64(file);
      setPendingImage({
        mimeType: file.type || "image/jpeg",
        data,
        previewUrl: URL.createObjectURL(file),
      });
    } catch {
      setImageError("Could not read that image — try another.");
    }
  };

  const clearPendingImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    if (!input.trim() && !pendingImage) return;

    onSend(
      input,
      pendingImage ? { mimeType: pendingImage.mimeType, data: pendingImage.data } : undefined
    );
    setInput("");
    clearPendingImage();
  };

  const startRecording = async () => {
    setAudioError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        setIsTranscribing(true);
        try {
          const data = await readBlobAsBase64(blob);
          const response = await fetch("/api/chat/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mimeType: recorder.mimeType, data }),
          });
          const payload = (await response.json()) as { text?: string; error?: string };
          if (payload.text?.trim()) {
            onSend(payload.text.trim());
          } else if (payload.error) {
            setAudioError(payload.error);
          } else {
            setAudioError("Didn't catch that — please try again.");
          }
        } catch {
          setAudioError("Could not transcribe that right now.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setAudioError("Microphone access was denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="border-t border-[#1f1f1f]/10 bg-white">
      {imageError && <p className="px-3 pt-2 text-[11px] text-red-600">{imageError}</p>}
      {audioError && <p className="px-3 pt-2 text-[11px] text-red-600">{audioError}</p>}

      {pendingImage && (
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-[8px] border border-[#1f1f1f]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImage.previewUrl} alt="Attached preview" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={clearPendingImage}
            aria-label="Remove attached image"
            className="text-[#96948f] hover:text-[#1f1f1f]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 px-3 py-2">
        {isEmojiOpen && (
          <ChatEmojiPicker
            onSelect={(emoji) => {
              setInput((current) => `${current}${emoji}`);
              setIsEmojiOpen(false);
            }}
            onClose={() => setIsEmojiOpen(false)}
          />
        )}

        <button
          type="button"
          onClick={() => setIsEmojiOpen((current) => !current)}
          aria-label="Add emoji"
          className="text-[#65635d] hover:text-[#1f1f1f]"
        >
          <Smile className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
          className="text-[#65635d] hover:text-[#1f1f1f]"
        >
          <ImagePlus className="h-[18px] w-[18px]" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          aria-label={isRecording ? "Stop recording" : "Record a voice message"}
          className={`${isRecording ? "text-red-600" : "text-[#65635d] hover:text-[#1f1f1f]"} disabled:opacity-40`}
        >
          {isRecording ? <Square className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={isTranscribing ? "Transcribing..." : "Ask something..."}
          disabled={disabled || isTranscribing}
          className="flex-1 bg-transparent text-[13px] text-[#1f1f1f] outline-none placeholder:text-[#96948f]"
        />
        <button
          type="submit"
          disabled={disabled || isTranscribing || (!input.trim() && !pendingImage)}
          aria-label="Send message"
          className="text-[#1f1f1f] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="px-3 pb-2 text-[11px] text-[#96948f]">
        By chatting with us, you agree to our{" "}
        <Link href="/privacy-policy" className="underline hover:text-[#1f1f1f]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

export default ChatInputBar;
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Note the audio-format risk explicitly**

This component cannot be fully verified without a real browser and microphone (unavailable in a headless/agent environment). Record this as a concern in your report: the actual `MediaRecorder.mimeType` produced by a real browser, and whether `/api/chat/transcribe` accepts it, must be confirmed in Task 13's end-to-end browser pass. Do not claim this is fully verified here.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatInputBar.tsx
git commit -m "feat: add chat input bar with emoji, image attach, and voice recording"
```

---

### Task 7: Messages tab

**Files:**
- Create: `components/chat/ChatMessagesTab.tsx`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: `ChatMessage` type from `@/components/chat/useChatConversation` (Task 3); `ChatMessageBubble` from `@/components/chat/ChatMessageBubble` (Task 4); `ChatInputBar` from `@/components/chat/ChatInputBar` (Task 6).
- Produces: default-exported `ChatMessagesTab` taking `{ messages: ChatMessage[]; isStreaming: boolean; onSend: (text: string, image?: { mimeType: string; data: string }) => void }`. Task 13 (`ChatWidget`) mounts this for the "messages" tab.

- [ ] **Step 1: Write `components/chat/ChatMessagesTab.tsx`**

```tsx
"use client";

import React, { useEffect, useRef } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputBar from "./ChatInputBar";
import type { ChatMessage } from "./useChatConversation";

type Props = {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string, image?: { mimeType: string; data: string }) => void;
};

const ChatMessagesTab = ({ messages, isStreaming, onSend }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-[13px] text-[#65635d]">
            Ask about paintings, sizes, customization, shipping, or place a Cash on
            Delivery order.
          </p>
        )}
        {messages.map((message, index) => (
          <ChatMessageBubble key={index} message={message} />
        ))}
      </div>
      <ChatInputBar disabled={isStreaming} onSend={onSend} />
    </div>
  );
};

export default ChatMessagesTab;
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatMessagesTab.tsx
git commit -m "feat: add chat Messages tab"
```

---

### Task 8: Home tab

**Files:**
- Create: `components/chat/ChatHomeTab.tsx`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: nothing (pure presentational, category names are hardcoded from `utils/collections.ts`'s real entries — see below).
- Produces: default-exported `ChatHomeTab` taking `{ onChipSelect: (text: string) => void }`. Task 13 (`ChatWidget`) mounts this for the "home" tab, wiring `onChipSelect` to send the message and switch to the Messages tab.

- [ ] **Step 1: Write `components/chat/ChatHomeTab.tsx`**

```tsx
"use client";

import React from "react";

const SUGGESTION_CHIPS = [
  "Check what's New",
  "Order Landscape Paintings",
  "Order Custom Portraits",
  "Ganapati Painting",
  "Radha Krishna",
  "Abstract Paintings",
];

type Props = {
  onChipSelect: (text: string) => void;
};

const ChatHomeTab = ({ onChipSelect }: Props) => (
  <div className="flex-1 overflow-y-auto px-4 py-5">
    <p className="font-display text-[20px] leading-snug text-[#1f1f1f]">Hi there 👋</p>
    <p className="mt-1 text-[14px] text-[#65635d]">What would you like help with?</p>

    <div className="mt-5 flex flex-wrap gap-2">
      {SUGGESTION_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onChipSelect(chip)}
          className="rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/35 hover:bg-[#ece8df]"
        >
          {chip}
        </button>
      ))}
    </div>
  </div>
);

export default ChatHomeTab;
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatHomeTab.tsx
git commit -m "feat: add chat Home tab with greeting and suggestion chips"
```

---

### Task 9: Help tab

**Files:**
- Create: `components/chat/ChatHelpTab.tsx`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: `getPolicyContent`, `PolicyKey` from `@/lib/chat/policy-content` (existing); `FAQ_ENTRIES` from `@/lib/chat/faq-content` (existing).
- Produces: default-exported `ChatHelpTab` (no props). Task 13 mounts this for the "help" tab.

**Note:** this is a new compact accordion sized for the ~340-460px-wide chat panel — it follows the same expand/collapse *interaction pattern* as `components/blog/FaqAccordion.tsx` (chevron rotates, content reveals), but does not reuse that component directly, since its typography/sizing is built for a full-width article page, not a narrow panel.

- [ ] **Step 1: Write `components/chat/ChatHelpTab.tsx`**

```tsx
"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { FAQ_ENTRIES } from "@/lib/chat/faq-content";
import { getPolicyContent, type PolicyKey } from "@/lib/chat/policy-content";

type HelpEntry = { id: string; title: string; content: string };

const POLICY_LABELS: Record<PolicyKey, string> = {
  returns: "Return Policy",
  cancellation: "Cancellation Policy",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
};

const buildHelpEntries = (): HelpEntry[] => {
  const faqEntries = FAQ_ENTRIES.map((entry, index) => ({
    id: `faq-${index}`,
    title: entry.question,
    content: entry.answer,
  }));

  const policyEntries = (Object.keys(POLICY_LABELS) as PolicyKey[]).map((key) => ({
    id: `policy-${key}`,
    title: POLICY_LABELS[key],
    content: getPolicyContent(key) || "",
  }));

  return [...faqEntries, ...policyEntries];
};

const ChatHelpTab = () => {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const entries = useMemo(buildHelpEntries, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(normalized) ||
        entry.content.toLowerCase().includes(normalized)
    );
  }, [entries, query]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-[#1f1f1f]/10 px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5">
          <Search className="h-4 w-4 text-[#96948f]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles..."
            className="flex-1 bg-transparent text-[13px] text-[#1f1f1f] outline-none placeholder:text-[#96948f]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filtered.length === 0 && (
          <p className="py-4 text-[13px] text-[#65635d]">No results for &quot;{query}&quot;.</p>
        )}
        {filtered.map((entry) => {
          const isOpen = openId === entry.id;
          return (
            <div key={entry.id} className="border-b border-[#1f1f1f]/10 py-3">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : entry.id)}
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-[13px] font-medium text-[#1f1f1f]">{entry.title}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#96948f] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-[#65635d]">
                  {entry.content}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatHelpTab;
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatHelpTab.tsx
git commit -m "feat: add chat Help tab with searchable policy/FAQ accordion"
```

---

### Task 10: News tab

**Files:**
- Create: `components/chat/ChatNewsTab.tsx`
- Test: dev-server curl check of `/api/blogs`, then `npx tsc --noEmit`

**Interfaces:**
- Consumes: `GET /api/blogs` (existing endpoint, returns `{ posts: [...] }`).
- Produces: default-exported `ChatNewsTab` (no props). Task 13 mounts this for the "news" tab.

- [ ] **Step 1: Confirm the real shape of `/api/blogs`**

With the dev server running:

```bash
curl -s http://localhost:3000/api/blogs | node -e "
let data = '';
process.stdin.on('data', d => data += d);
process.stdin.on('end', () => {
  const json = JSON.parse(data);
  console.log('post count:', json.posts?.length);
  console.log('first post keys:', json.posts?.[0] ? Object.keys(json.posts[0]) : 'none');
});
"
```

Expected: `post count` is a positive number and `first post keys` includes at least `id`, `slug`, `title`, `excerpt`, `image`, `publishedAt` (matches `WordPressNormalizedBlogPost` in `utils/wordpress-blog.ts`).

- [ ] **Step 2: Write `components/chat/ChatNewsTab.tsx`**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string | null;
};

type BlogsResponse = { posts?: BlogPost[] };

const ChatNewsTab = () => {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/blogs")
      .then((response) => response.json())
      .then((payload: BlogsResponse) => {
        if (cancelled) return;
        const sorted = [...(payload.posts || [])].sort((a, b) => {
          const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return bTime - aTime;
        });
        setPosts(sorted);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load news right now.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {error && <p className="text-[13px] text-[#65635d]">{error}</p>}
      {!error && posts === null && <p className="text-[13px] text-[#65635d]">Loading...</p>}
      {posts?.length === 0 && <p className="text-[13px] text-[#65635d]">No news yet.</p>}
      <div className="space-y-3">
        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/blogs/${post.slug}`}
            className="flex gap-3 rounded-[12px] border border-[#1f1f1f]/10 bg-white p-2 transition-colors hover:border-[#1f1f1f]/25"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="h-14 w-14 shrink-0 rounded-[8px] object-cover" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#1f1f1f]">{post.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#65635d]">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatNewsTab;
```

- [ ] **Step 3: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatNewsTab.tsx
git commit -m "feat: add chat News tab showing the existing blog feed"
```

---

### Task 11: Header (3-dot menu, expand, clear, close) and tab bar

**Files:**
- Create: `components/chat/ChatHeader.tsx`
- Create: `components/chat/ChatTabBar.tsx`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: nothing.
- Produces: default-exported `ChatHeader` taking `{ title: string; isExpanded: boolean; onToggleExpand: () => void; onClear: () => void; onClose: () => void }`; default-exported `ChatTabBar` plus exported type `ChatTab = "home" | "messages" | "help" | "news"`, taking `{ activeTab: ChatTab; onTabChange: (tab: ChatTab) => void }`. Task 13 mounts both.

- [ ] **Step 1: Write `components/chat/ChatHeader.tsx`**

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, MoreVertical, Trash2, X } from "lucide-react";

type Props = {
  title: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClear: () => void;
  onClose: () => void;
};

const ChatHeader = ({ title, isExpanded, onToggleExpand, onClear, onClose }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isMenuOpen]);

  return (
    <div className="flex items-center justify-between border-b border-[#1f1f1f]/10 bg-[#1f1f1f] px-4 py-3">
      <span className="text-[14px] font-medium text-white">{title}</span>
      <div className="flex items-center gap-3">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="h-4 w-4 text-white" />
          </button>
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-2 min-w-[180px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-1.5 shadow-[0_18px_35px_rgba(0,0,0,0.15)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onToggleExpand();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] text-[#1f1f1f] hover:bg-[#ece8df]"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {isExpanded ? "Collapse" : "Expand"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClear();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] text-[#1f1f1f] hover:bg-[#ece8df]"
              >
                <Trash2 className="h-4 w-4" />
                Clear conversation
              </button>
            </div>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
```

- [ ] **Step 2: Write `components/chat/ChatTabBar.tsx`**

```tsx
"use client";

import React from "react";
import { Home, HelpCircle, MessageSquare, Newspaper } from "lucide-react";

export type ChatTab = "home" | "messages" | "help" | "news";

const TABS: { id: ChatTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "news", label: "News", icon: Newspaper },
];

type Props = {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
};

const ChatTabBar = ({ activeTab, onTabChange }: Props) => (
  <div className="grid grid-cols-4 border-t border-[#1f1f1f]/10 bg-white">
    {TABS.map(({ id, label, icon: Icon }) => {
      const isActive = activeTab === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
            isActive ? "text-[#1f1f1f]" : "text-[#96948f] hover:text-[#4f4b45]"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
          {label}
        </button>
      );
    })}
  </div>
);

export default ChatTabBar;
```

- [ ] **Step 3: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatHeader.tsx components/chat/ChatTabBar.tsx
git commit -m "feat: add chat header (expand/clear menu) and 4-tab bottom nav"
```

---

### Task 12: Closed-state floating teaser

**Files:**
- Create: `components/chat/ChatFloatingTeaser.tsx`
- Modify: `app/globals.css`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: nothing.
- Produces: default-exported `ChatFloatingTeaser` taking `{ onOpen: () => void }`. Task 13 mounts this when the panel is closed.

- [ ] **Step 1: Append the teaser animation to `app/globals.css`**

Add this block after the `chat-message-in` block added in Task 4 (at the end of the file):

```css

@keyframes chat-teaser-in {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-chat-teaser-in {
  animation: chat-teaser-in 0.3s ease-out;
}

@keyframes chat-teaser-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-chat-teaser-fade {
  animation: chat-teaser-fade 0.3s ease-in;
}
```

- [ ] **Step 2: Write `components/chat/ChatFloatingTeaser.tsx`**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const TEASER_MESSAGES = [
  "Best Canvas Paintings",
  "Portraits",
  "Modern Art",
  "Religious",
  "Vastu Paintings",
];

const ROTATE_INTERVAL_MS = 4000;
const DISMISS_DURATION_MS = 20000;

type Props = {
  onOpen: () => void;
};

const ChatFloatingTeaser = ({ onOpen }: Props) => {
  const [index, setIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % TEASER_MESSAGES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isDismissed]);

  useEffect(() => {
    if (!isDismissed) return;
    const timeout = setTimeout(() => setIsDismissed(false), DISMISS_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [isDismissed]);

  return (
    <div className="flex items-center gap-2">
      {!isDismissed && (
        <div className="animate-chat-teaser-in flex items-center gap-2 rounded-full border border-[#1f1f1f]/10 bg-white px-3 py-2 text-[12px] font-medium text-[#1f1f1f] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <span key={index} className="animate-chat-teaser-fade">
            {TEASER_MESSAGES[index]}
          </span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss"
            className="text-[#96948f] hover:text-[#1f1f1f]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open chat"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.03]"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatFloatingTeaser;
```

- [ ] **Step 3: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatFloatingTeaser.tsx app/globals.css
git commit -m "feat: add animated closed-state floating teaser chip"
```

---

### Task 13: Final assembly — rewrite ChatWidget.tsx and verify end-to-end

**Files:**
- Modify: `components/chat/ChatWidget.tsx` (full rewrite)
- Test: `npx tsc --noEmit`, dev-server browser check (real click-through, per Global Constraints' audio-format risk)

**Interfaces:**
- Consumes: `useChatConversation` (Task 3), `ChatHeader`/`ChatTabBar`/`ChatTab` (Task 11), `ChatHomeTab` (Task 8), `ChatMessagesTab` (Task 7), `ChatHelpTab` (Task 9), `ChatNewsTab` (Task 10), `ChatFloatingTeaser` (Task 12).
- Produces: default-exported `ChatWidget` (no props) — same as today, no change needed to its mount point in `app/layout.tsx`.

- [ ] **Step 1: Rewrite `components/chat/ChatWidget.tsx`**

```tsx
"use client";

import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatTabBar, { type ChatTab } from "./ChatTabBar";
import ChatHomeTab from "./ChatHomeTab";
import ChatMessagesTab from "./ChatMessagesTab";
import ChatHelpTab from "./ChatHelpTab";
import ChatNewsTab from "./ChatNewsTab";
import ChatFloatingTeaser from "./ChatFloatingTeaser";
import { useChatConversation } from "./useChatConversation";

const TAB_TITLES: Record<ChatTab, string> = {
  home: "Artace Studio",
  messages: "Artace Studio Assistant",
  help: "Help",
  news: "News",
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>("home");
  const { messages, isStreaming, sendMessage, clearConversation } = useChatConversation();

  const handleChipSelect = (text: string) => {
    setActiveTab("messages");
    void sendMessage(text);
  };

  const panelSizeClass = isExpanded
    ? "h-[640px] w-[400px] md:w-[460px]"
    : "h-[520px] w-[340px] md:w-[380px]";

  return (
    <div className="fixed bottom-24 right-5 z-40 md:bottom-28 md:right-6">
      {isOpen && (
        <div
          className={`mb-3 flex flex-col overflow-hidden rounded-[16px] border border-[#1f1f1f]/10 bg-[#f4f2ee] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-[width,height] duration-200 ${panelSizeClass}`}
        >
          <ChatHeader
            title={TAB_TITLES[activeTab]}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((current) => !current)}
            onClear={clearConversation}
            onClose={() => setIsOpen(false)}
          />

          {activeTab === "home" && <ChatHomeTab onChipSelect={handleChipSelect} />}
          {activeTab === "messages" && (
            <ChatMessagesTab messages={messages} isStreaming={isStreaming} onSend={sendMessage} />
          )}
          {activeTab === "help" && <ChatHelpTab />}
          {activeTab === "news" && <ChatNewsTab />}

          <ChatTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      {!isOpen && (
        <div className="flex justify-end">
          <ChatFloatingTeaser onOpen={() => setIsOpen(true)} />
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
```

- [ ] **Step 2: Verify with a type-check**

Run: `npx tsc --noEmit`
Expected: no new errors (this is the final integration point — if any earlier task's interface doesn't actually match, it surfaces here).

- [ ] **Step 3: Verify end-to-end with the dev server in a real browser**

1. Run `npm run dev`.
2. Open the site. Confirm the floating teaser (rotating text + round button) appears bottom-right, stacked above the WhatsApp button with a visible gap, no overlap.
3. Click the round button — panel opens on the Home tab with the greeting and suggestion chips.
4. Tap a suggestion chip — confirm it switches to the Messages tab and sends that chip's text, and the assistant responds (with the typing-dots indicator visible before text arrives, and the new message fading/sliding in).
5. Confirm each assistant message shows "Artsa · {time}" above it.
6. Type a message manually, send it, confirm it works the same way.
7. Attach an image (any real photo) with a question about it — confirm Gemini responds referencing the image content.
8. Record a short voice message — confirm it transcribes and sends as text. **This is the one item this plan could not verify without a browser — check `MediaRecorder`'s actual mimeType (inspect via devtools or a temporary `console.log(recorder.mimeType)`) and confirm `/api/chat/transcribe` accepts it.** If it's rejected, see the fallback guidance in Global Constraints.
9. Try the emoji picker — confirm an emoji inserts into the input.
10. Open the 3-dot menu — confirm Expand grows the panel, Collapse shrinks it back, and Clear conversation empties the chat.
11. Click the Help tab — confirm the policy/FAQ accordion renders and the search bar filters it.
12. Click the News tab — confirm real blog posts load, newest first, and clicking one navigates to the real blog post.
13. Close the panel via the X — confirm the floating teaser reappears.
14. Confirm every other page (shop, blog, legal pages, WhatsApp button) still works unchanged.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatWidget.tsx
git commit -m "feat: assemble full 4-tab messenger chat widget"
```
