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
