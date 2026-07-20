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
