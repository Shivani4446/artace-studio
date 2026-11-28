"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocItem } from "@/utils/article";

type Props = {
  toc: TocItem[];
  /** id of the element wrapping the article body, used for reading progress. */
  contentId?: string;
};

// Breathing room between the sticky site header and the TOC / scrolled-to heading.
const STICKY_GAP = 32;
const FALLBACK_HEADER_HEIGHT = 102;

const getHeaderHeight = () => {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  return header ? header.getBoundingClientRect().height : FALLBACK_HEADER_HEIGHT;
};

export default function ArticleTocHighlighter({ toc, contentId }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(FALLBACK_HEADER_HEIGHT);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  // While a click-triggered smooth scroll is running, keep the clicked item
  // active instead of flickering through every heading it passes.
  const lockedUntilRef = useRef(0);

  // Track the sticky header's real height (promo bar can be present or dismissed).
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const update = () => setHeaderHeight(getHeaderHeight());
    update();
    if (!header || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      frame = 0;
      const offset = getHeaderHeight() + STICKY_GAP;
      const headings = toc
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      // Reading progress across the article body.
      const content = contentId ? document.getElementById(contentId) : null;
      if (content) {
        const rect = content.getBoundingClientRect();
        const total = rect.height - (window.innerHeight - offset);
        const read = offset - rect.top;
        setProgress(total > 0 ? Math.min(1, Math.max(0, read / total)) : 1);
      }

      if (headings.length === 0 || Date.now() < lockedUntilRef.current) return;

      let current = "";
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset + 8) {
          current = heading.id;
        } else {
          break;
        }
      }

      // At the very bottom, the last section may be too short to reach the
      // offset line — treat it as active so the TOC doesn't stall.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = headings[headings.length - 1].id;

      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [toc, contentId]);

  // Keep the active link visible inside a long, internally-scrolling TOC
  // without moving the page itself.
  useEffect(() => {
    const container = listRef.current;
    if (!container || !activeId) return;
    const link = container.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!link) return;
    const linkTop = link.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    const padding = 48;
    if (linkTop < container.scrollTop + padding) {
      container.scrollTo({ top: Math.max(0, linkTop - padding), behavior: "smooth" });
    } else if (linkBottom > container.scrollTop + container.clientHeight - padding) {
      container.scrollTo({
        top: linkBottom - container.clientHeight + padding,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - getHeaderHeight() - STICKY_GAP + 4;
    lockedUntilRef.current = Date.now() + 900;
    setActiveId(id);
    setIsMobileOpen(false);
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  if (toc.length === 0) return null;

  const activeIndex = toc.findIndex((item) => item.id === activeId);
  const minLevel = Math.min(...toc.map((item) => item.level));
  const stickyTop = headerHeight + STICKY_GAP;

  const list = (
    <ul className="relative space-y-0.5 border-l border-[#1f1f1f]/10">
      {toc.map((item, index) => {
        const isActive = item.id === activeId;
        const isRead = activeIndex > -1 && index < activeIndex;
        const depth = Math.max(0, item.level - minLevel);

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-toc-id={item.id}
              onClick={(e) => handleClick(e, item.id)}
              aria-current={isActive ? "location" : undefined}
              style={{ paddingLeft: `${16 + depth * 14}px` }}
              className={`-ml-px block border-l-2 py-[7px] pr-2 font-inter text-[15px] leading-[1.45] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#232426] focus-visible:ring-offset-2 ${
                isActive
                  ? "border-[#1c1d1f] font-medium text-[#1c1d1f]"
                  : isRead
                    ? "border-transparent text-[#5f5d58] hover:border-[#1f1f1f]/30 hover:text-[#1c1d1f]"
                    : "border-transparent text-[#76736c] hover:border-[#1f1f1f]/30 hover:text-[#1c1d1f]"
              }`}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible, sits above the article */}
      <nav aria-label="Table of contents" className="mb-10 md:hidden">
        <div className="rounded-2xl border border-[#1f1f1f]/10 bg-[#FAF9F6]">
          <button
            type="button"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-expanded={isMobileOpen}
            aria-controls="article-toc-mobile"
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <span className="font-display text-[20px] leading-tight text-[#1c1d1f]">
              Table of Contents
            </span>
            <span className="flex items-center gap-2 font-inter text-[13px] text-[#6b6962]">
              {toc.length} sections
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isMobileOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          <div
            id="article-toc-mobile"
            className={`grid transition-[grid-template-rows] duration-300 ${
              isMobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-5">{list}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop: sticky sidebar that scrolls internally when long */}
      <aside
        aria-label="Table of contents"
        className="hidden md:sticky md:block md:self-start"
        style={{ top: stickyTop }}
      >
        <div
          className="flex flex-col"
          style={{ maxHeight: `calc(100vh - ${stickyTop + STICKY_GAP}px)` }}
        >
          <div className="shrink-0">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-[22px] leading-[1.1] tracking-[-0.01em] text-[#1c1d1f]">
                Table of Contents
              </h2>
              <span className="font-inter text-[12px] tabular-nums text-[#8a877f]">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div
              className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-[#1f1f1f]/8"
              role="progressbar"
              aria-label="Reading progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <div
                className="h-full origin-left rounded-full bg-[#1c1d1f] transition-transform duration-150 ease-out"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          </div>

          <div
            ref={listRef}
            className="relative mt-5 min-h-0 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(31,31,31,0.18)_transparent]"
          >
            {list}
          </div>
        </div>
      </aside>
    </>
  );
}
