"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ChatProductCard from "./ChatProductCard";
import type { ChatMessage } from "./useChatConversation";

const ASSISTANT_NAME = "Artsa";

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:text-[#4a4846]"
    >
      {children}
    </a>
  ),
};

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
          isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkBreaks]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )
        ) : (
          <span className="inline-flex gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#96948f] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#96948f] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#96948f]" />
          </span>
        )}
        {message.products && message.products.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {message.products.map((product) => (
              <ChatProductCard key={product.id} product={product} />
            ))}
          </div>
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
