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
  const skipPersistRef = useRef(true);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
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
