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
