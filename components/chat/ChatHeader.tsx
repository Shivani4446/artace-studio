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
