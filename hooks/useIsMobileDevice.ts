"use client";
import { useEffect, useState } from "react";

/**
 * A pragmatic proxy, not perfect device detection: true when the viewport is
 * narrow AND the device supports touch. Good enough for a feature that
 * degrades gracefully either way — a false positive/negative just means the
 * button shows or hides on the "wrong" side of an edge case, not a broken
 * feature.
 */
export const useIsMobileDevice = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isNarrow = window.matchMedia("(max-width: 768px)").matches;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(isNarrow && hasTouch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};
