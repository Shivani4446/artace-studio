import React, { useState, useEffect } from "react";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

type Props = {
  content: string;
};

const SingleBlogContent = ({ content }: Props) => {
  const decodedContent = decodeHtmlEntities(content);

  // Extract only H2 headings
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;

  const h2Headings: { id: string; text: string }[] = [];
  let match;

  // First pass: extract headings and generate IDs
  let processedContent = decodedContent;
  const usedIds = new Set<string>();

  const ensureUniqueId = (text: string) => {
    const baseId = text
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    
    if (!baseId) return "section";
    
    if (!usedIds.has(baseId)) {
      usedIds.add(baseId);
      return baseId;
    }
    
    let suffix = 2;
    while (usedIds.has(`${baseId}-${suffix}`)) {
      suffix++;
    }
    const uniqueId = `${baseId}-${suffix}`;
    usedIds.add(uniqueId);
    return uniqueId;
  };

  // Process content to add IDs to h2 elements
  processedContent = decodedContent.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (fullMatch, attrs, innerHtml) => {
      const headingText = stripHtmlAndDecode(innerHtml);
      const id = ensureUniqueId(headingText);
      h2Headings.push({ id, text: headingText });
      return `<h2${attrs} id="${id}">${innerHtml}</h2>`;
    }
  );

  const [activeId, setActiveId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);

    const handleScroll = () => {
      if (h2Headings.length === 0) return;

      let currentActiveId = "";

      for (const heading of h2Headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentActiveId = heading.id;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    setTimeout(handleScroll, 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [h2Headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  return (
    <div className="grid md:grid-cols-4 gap-10 max-w-[1440px] mx-auto px-6 md:px-12">
      {/* LEFT SIDE - H2 List */}
      {h2Headings.length > 0 && (
        <aside className="md:col-span-1 sticky top-24 h-fit">
          <h3 className="font-semibold mb-4 text-[24px]">Table of Contents</h3>
          <ul className="space-y-2 text-sm">
            {h2Headings.map((heading, index) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={`cursor-pointer block transition-colors ${
                    isInitialized && activeId === heading.id
                      ? "font-semibold text-[#202124]"
                      : "text-gray-600 hover:text-[#222327]"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* RIGHT SIDE - Content */}
      <div
        className="md:col-span-3 prose max-w-none single-blog-content"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

export default SingleBlogContent;
