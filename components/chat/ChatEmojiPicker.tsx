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
