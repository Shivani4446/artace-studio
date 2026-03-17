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

  const cleanedHtml = html.replace(
    /<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi,
    ""
  );

  const transformedHtml = cleanedHtml.replace(
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

/**
 * Extracts product IDs from WooCommerce blocks in HTML content
 * WooCommerce blocks look like: <div data-block-name="woocommerce/single-product" data-product-id="561">
 */
export const extractWooCommerceProductIds = (html: string): number[] => {
  const seen = new Set<number>();
  const orderedIds: number[] = [];

  const addId = (rawId: string | number) => {
    const productId =
      typeof rawId === "number" ? rawId : Number.parseInt(String(rawId), 10);

    if (!Number.isFinite(productId) || productId <= 0) return;
    if (seen.has(productId)) return;

    seen.add(productId);
    orderedIds.push(productId);
  };

  // Rendered block markup (most common for Woo blocks)
  const dataAttrRegex = /data-product-id=["'](\d+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = dataAttrRegex.exec(html)) !== null) {
    addId(match[1]);
  }

  // Classic Woo add-to-cart forms (often present even when data-product-id isn't).
  const addToCartRegex =
    /name=["']add-to-cart["'][^>]*\svalue=["'](\d+)["']/gi;
  while ((match = addToCartRegex.exec(html)) !== null) {
    addId(match[1]);
  }

  const productIdInputRegex =
    /name=["']product_id["'][^>]*\svalue=["'](\d+)["']/gi;
  while ((match = productIdInputRegex.exec(html)) !== null) {
    addId(match[1]);
  }

  const addToCartHrefRegex = /[?&]add-to-cart=(\d+)/gi;
  while ((match = addToCartHrefRegex.exec(html)) !== null) {
    addId(match[1]);
  }

  // Gutenberg block comments can be present in content.rendered too.
  // Example: <!-- wp:woocommerce/single-product {"productId":561} /-->
  const blockCommentRegex =
    /<!--\s*wp:woocommerce\/(single-product|featured-product)\s+({[\s\S]*?})\s*\/?-->/gi;
  while ((match = blockCommentRegex.exec(html)) !== null) {
    const attrs = match[2] ?? "";
    const idMatch =
      attrs.match(/"productId"\s*:\s*(\d+)/i) ?? attrs.match(/"id"\s*:\s*(\d+)/i);

    if (idMatch?.[1]) addId(idMatch[1]);
  }

  return orderedIds;
};

/**
 * Extracts product slugs from WooCommerce product links in HTML content.
 * Looks for /product/{slug} or /shop/{slug} style links.
 */
export const extractWooCommerceProductSlugs = (html: string): string[] => {
  const seen = new Set<string>();
  const orderedSlugs: string[] = [];

  const addSlug = (value: string | null | undefined) => {
    const slug = (value ?? "").trim().toLowerCase();
    if (!slug) return;
    if (seen.has(slug)) return;
    seen.add(slug);
    orderedSlugs.push(slug);
  };

  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1] ?? "";
    try {
      const url = new URL(href, "https://artace.invalid");
      const path = url.pathname.replace(/\/+$/, "");
      const segments = path.split("/").filter(Boolean);
      if (segments.length === 0) continue;

      const productIndex = segments.findIndex(
        (segment) => segment === "product" || segment === "shop"
      );
      if (productIndex >= 0 && segments[productIndex + 1]) {
        addSlug(segments[productIndex + 1]);
        continue;
      }

      addSlug(segments[segments.length - 1]);
    } catch {
      // Ignore malformed hrefs.
    }
  }

  const permalinkRegex = /data-product_permalink=["']([^"']+)["']/gi;
  while ((match = permalinkRegex.exec(html)) !== null) {
    const href = match[1] ?? "";
    try {
      const url = new URL(href, "https://artace.invalid");
      const path = url.pathname.replace(/\/+$/, "");
      const segments = path.split("/").filter(Boolean);
      if (segments.length === 0) continue;

      const productIndex = segments.findIndex(
        (segment) => segment === "product" || segment === "shop"
      );
      if (productIndex >= 0 && segments[productIndex + 1]) {
        addSlug(segments[productIndex + 1]);
        continue;
      }

      addSlug(segments[segments.length - 1]);
    } catch {
      // Ignore malformed permalinks.
    }
  }

  return orderedSlugs;
};

const findMatchingCloseTag = (
  html: string,
  tagName: string,
  startIndex: number
) => {
  const tagRegex = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tagRegex.lastIndex = startIndex;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[0].toLowerCase();
    if (tag.startsWith(`</${tagName}`)) {
      depth -= 1;
      if (depth === 0) {
        return tagRegex.lastIndex;
      }
      continue;
    }

    if (tag.startsWith(`<${tagName}`)) {
      depth += 1;
    }
  }

  return null;
};

const extractDivBlockByClass = (html: string, className: string) => {
  const openTagRegex = new RegExp(
    `<div\\b[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>`,
    "i"
  );
  const match = openTagRegex.exec(html);
  if (!match) return null;

  const startIndex = match.index;
  const endIndex = findMatchingCloseTag(html, "div", startIndex);
  if (!endIndex) return null;

  return {
    startIndex,
    endIndex,
    blockHtml: html.slice(startIndex, endIndex),
  };
};

/**
 * Extracts RankMath TOC items (if present) and returns HTML without the TOC block.
 */
export const extractRankMathToc = (html: string) => {
  const block = extractDivBlockByClass(html, "rank-math-toc");
  if (!block) {
    return { html, toc: [] as TocItem[] };
  }

  const tocItems: TocItem[] = [];
  const linkRegex = /<a[^>]*href=["']#([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = linkRegex.exec(block.blockHtml)) !== null) {
    const id = match[1]?.trim();
    const label = stripHtmlAndDecode(match[2] ?? "").trim();
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    tocItems.push({ id, title: label, level: 2 });
  }

  const cleanedHtml =
    html.slice(0, block.startIndex) + html.slice(block.endIndex);

  return { html: cleanedHtml, toc: tocItems };
};
