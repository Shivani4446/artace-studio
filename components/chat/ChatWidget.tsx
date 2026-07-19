"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";

type CartSuggestion = {
  productId: number;
  variationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  quantity?: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: CartSuggestion[];
};

type StreamPayload =
  | { type: "delta"; text: string }
  | { type: "done"; actions: CartSuggestion[] };

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

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const historyForRequest = [...messages, userMessage]
      .slice(-MAX_SENT_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    let assistantText = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForRequest }),
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
          const payload = JSON.parse(chunk.slice(6)) as StreamPayload;

          if (payload.type === "delta") {
            assistantText += payload.text;
            setMessages((current) => {
              const updated = [...current];
              updated[updated.length - 1] = { role: "assistant", content: assistantText };
              return updated;
            });
          } else if (payload.type === "done") {
            setMessages((current) => {
              const updated = [...current];
              updated[updated.length - 1] = {
                role: "assistant",
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
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong — please try again in a moment.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 md:bottom-6 md:left-6">
      {isOpen && (
        <div className="mb-3 flex h-[480px] w-[320px] flex-col overflow-hidden rounded-[16px] border border-[#1f1f1f]/10 bg-[#f4f2ee] shadow-[0_18px_35px_rgba(0,0,0,0.15)] md:w-[360px]">
          <div className="flex items-center justify-between border-b border-[#1f1f1f]/10 bg-[#1f1f1f] px-4 py-3">
            <span className="text-[14px] font-medium text-white">Artace Studio Assistant</span>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <p className="text-[13px] text-[#65635d]">
                Ask about paintings, sizes, customization, shipping, or place a Cash on
                Delivery order.
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-[12px] px-3 py-2 text-[13px] leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-[#1f1f1f] text-white"
                    : "bg-white text-[#1f1f1f]"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content || "…"}</p>
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
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
            className="flex items-center gap-2 border-t border-[#1f1f1f]/10 bg-white px-3 py-2"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask something..."
              disabled={isStreaming}
              className="flex-1 bg-transparent text-[13px] text-[#1f1f1f] outline-none placeholder:text-[#96948f]"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
              className="text-[#1f1f1f] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1f1f1f] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.03]"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
