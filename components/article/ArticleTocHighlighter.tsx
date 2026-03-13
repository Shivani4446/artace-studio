"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/utils/article";

type Props = {
  toc: TocItem[];
};

export default function ArticleTocHighlighter({ toc }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = toc
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      if (headingElements.length === 0) return;

      // Find the heading that is currently in view
      let currentActiveId = "";

      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          currentActiveId = heading.id;
        }
      }

      // If no heading is found in the viewport, use the last one before viewport
      if (!currentActiveId && headingElements.length > 0) {
        for (let i = headingElements.length - 1; i >= 0; i--) {
          const rect = headingElements[i].getBoundingClientRect();
          if (rect.top < 400) {
            currentActiveId = headingElements[i].id;
            break;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    // Initial check
    setTimeout(handleScroll, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  if (toc.length === 0) return null;

  return (
    <aside className="md:sticky md:top-[124px] md:self-start">
      <h2 className="font-display text-[24px] leading-[1.08] tracking-[-0.01em] text-[#232426]">
        Table of Contents
      </h2>
      <ul className="mt-6 space-y-3.5">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`block text-[18px] leading-[1.45] transition-colors cursor-pointer ${
                activeId === item.id
                  ? "font-semibold text-[#202124]"
                  : "font-normal text-[#66645f] hover:text-[#222327]"
              }`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
