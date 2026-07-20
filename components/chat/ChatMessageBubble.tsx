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
