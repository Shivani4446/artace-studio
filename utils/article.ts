import { stripHtmlAndDecode } from "@/utils/text";

export type TocItem = {
  id: string;
  title: string;
  level: number;
};

type ListType = "ul" | "ol";

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const ensureUniqueId = (candidate: string, usedIds: Set<string>) => {
  const base = slugifyHeading(candidate) || "section";

  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }

  let suffix = 2;
  while (usedIds.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  const uniqueId = `${base}-${suffix}`;
  usedIds.add(uniqueId);
  return uniqueId;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttribute = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

const formatInlineMarkdown = (value: string) => {
  let formatted = escapeHtml(value);

  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label: string, href: string) => {
      const safeHref = href.trim();
      const isSafeTarget = /^(https?:\/\/|mailto:|\/|#)/i.test(safeHref);
      const safeLabel = label.trim();

      if (!isSafeTarget) {
        return safeLabel;
      }

      const externalAttributes = /^https?:\/\//i.test(safeHref)
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";

      return `<a href="${escapeAttribute(safeHref)}"${externalAttributes}>${safeLabel}</a>`;
    }
  );

  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  return formatted;
};

const closeAllLists = (parts: string[], listStack: Array<{ type: ListType }>) => {
  while (listStack.length) {
    const list = listStack.pop();
    parts.push(`</${list?.type}>`);
  }
};

export const markdownToHtmlWithToc = (markdown: string) => {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const htmlParts: string[] = [];
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();
  const listStack: Array<{ type: ListType; indent: number }> = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;

    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text.length > 0) {
      htmlParts.push(`<p>${formatInlineMarkdown(text)}</p>`);
    }
    paragraph = [];
  };

  const closeListsDownToIndent = (targetIndent: number) => {
    while (
      listStack.length > 0 &&
      listStack[listStack.length - 1].indent > targetIndent
    ) {
      const list = listStack.pop();
      htmlParts.push(`</${list?.type}>`);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "    ");
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushParagraph();
      closeAllLists(htmlParts, listStack);
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeAllLists(htmlParts, listStack);

      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const headingId = ensureUniqueId(headingText, usedIds);

      if (level === 2) {
        toc.push({
          id: headingId,
          title: headingText,
          level,
        });
      }

      htmlParts.push(
        `<h${level} id="${headingId}">${formatInlineMarkdown(headingText)}</h${level}>`
      );
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushParagraph();

      const indent = listMatch[1].length;
      const marker = listMatch[2];
      const itemText = listMatch[3].trim();
      const type: ListType = /^\d+\.$/.test(marker) ? "ol" : "ul";

      closeListsDownToIndent(indent);

      const top = listStack[listStack.length - 1];
      if (top && top.indent === indent && top.type !== type) {
        const previousList = listStack.pop();
        htmlParts.push(`</${previousList?.type}>`);
      }

      const updatedTop = listStack[listStack.length - 1];
      if (!updatedTop || updatedTop.indent < indent || updatedTop.type !== type) {
        htmlParts.push(`<${type}>`);
        listStack.push({ type, indent });
      }

      htmlParts.push(`<li>${formatInlineMarkdown(itemText)}</li>`);
      continue;
    }

    closeAllLists(htmlParts, listStack);
    paragraph.push(trimmedLine);
  }

  flushParagraph();
  closeAllLists(htmlParts, listStack);

  return {
    html: htmlParts.join("\n"),
    toc,
  };
};

export const htmlToArticleContent = (html: string) => {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const transformedHtml = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (fullMatch, levelText: string, attrs: string, innerHtml: string) => {
      const level = Number(levelText);
      const headingText = stripHtmlAndDecode(innerHtml);
      const idMatch = attrs.match(/\sid=["']([^"']+)["']/i);
      const resolvedId = ensureUniqueId(
        idMatch?.[1] || headingText || `section-${toc.length + 1}`,
        usedIds
      );

      if (level === 2) {
        toc.push({
          id: resolvedId,
          title: headingText || `Section ${toc.length + 1}`,
          level,
        });
      }

      const attrsWithoutId = attrs.replace(/\sid=["'][^"']*["']/i, "");
      return `<h${level}${attrsWithoutId} id="${resolvedId}">${innerHtml}</h${level}>`;
    }
  );

  return {
    html: transformedHtml,
    toc,
  };
};

export const estimateReadTimeMinutes = (text: string, wordsPerMinute = 220) => {
  const wordCount = stripHtmlAndDecode(text)
    .split(/\s+/)
    .filter(Boolean).length;

  if (wordCount === 0) return 1;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
};

export const formatArticleDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
