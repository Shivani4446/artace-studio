"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import ArtieMascot from "./ArtieMascot";

const TEASER_MESSAGES = [
  "Hey! I'm Artie — your guide to find you the best paintings.",
  "Best Canvas Paintings",
  "Portraits",
  "Modern Art",
  "Religious",
  "Vastu Paintings",
];

// Index of the Artie introduction line within TEASER_MESSAGES — shown first,
// then recurring once every full rotation ("every now and then"), with an
// animated grin on the mascot while it's on screen.
const GREETING_INDEX = 0;

const ROTATE_INTERVAL_MS = 4000;
const DISMISS_DURATION_MS = 20000;

type Props = {
  onOpen: () => void;
};

const ChatFloatingTeaser = ({ onOpen }: Props) => {
  const [index, setIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % TEASER_MESSAGES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isDismissed]);

  useEffect(() => {
    if (!isDismissed) return;
    const timeout = setTimeout(() => setIsDismissed(false), DISMISS_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [isDismissed]);

  const isGreeting = !isDismissed && index === GREETING_INDEX;

  return (
    <div className="flex items-center gap-2">
      {!isDismissed && (
        <div
          className={`animate-chat-teaser-in flex items-center gap-2 rounded-[20px] border border-[#1f1f1f]/10 bg-white px-3 py-2 text-[12px] font-medium text-[#1f1f1f] shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:flex ${
            isGreeting ? "hidden max-w-[220px] sm:flex" : "hidden whitespace-nowrap sm:flex"
          }`}
        >
          <span key={index} className={`animate-chat-teaser-fade ${isGreeting ? "" : "whitespace-nowrap"}`}>
            {TEASER_MESSAGES[index]}
          </span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss"
            className="text-[#96948f] hover:text-[#1f1f1f]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open chat"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.03]"
      >
        <ArtieMascot variant={isGreeting ? "greeting" : "idle"} size={56} className="h-14 w-14" />
      </button>
    </div>
  );
};

export default ChatFloatingTeaser;
