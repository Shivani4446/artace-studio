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
