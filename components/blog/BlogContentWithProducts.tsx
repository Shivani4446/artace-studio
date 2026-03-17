"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

type ProductData = {
  id: number;
  slug: string;
  title: string;
  sizesLabel?: string;
  image?: string;
  alt?: string;
  categoryLabel?: string;
  subtitle?: string;
  price?: number | null;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_symbol?: string;
    currency_code?: string;
    currency_minor_unit?: number;
  };
};

type BlogContentWithProductsProps = {
  contentHtml: string;
  products: ProductData[];
};

const parseMinorUnitAmount = (
  rawValue: string | undefined,
  minorUnit: number | undefined
): number | null => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return null;
  const resolvedMinorUnit = typeof minorUnit === "number" ? minorUnit : 2;
  return numericValue / 10 ** resolvedMinorUnit;
};

const formatPrice = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  if (value === null) return "Price On Request";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const resolveProductPricing = (product: ProductData) => {
  const currencyCode = product.prices?.currency_code || "INR";
  const currencySymbol = product.prices?.currency_symbol || "\u20B9";
  const minorUnit = product.prices?.currency_minor_unit ?? 2;

  const basePrice =
    typeof product.price === "number"
      ? product.price
      : parseMinorUnitAmount(product.prices?.price, minorUnit);

  const regularPrice = parseMinorUnitAmount(product.prices?.regular_price, minorUnit);
  const salePrice = parseMinorUnitAmount(product.prices?.sale_price, minorUnit);

  const resolvedPrice = typeof salePrice === "number" ? salePrice : basePrice;
  const hasDiscount =
    typeof resolvedPrice === "number" &&
    typeof regularPrice === "number" &&
    regularPrice > resolvedPrice;

  return {
    currencyCode,
    currencySymbol,
    resolvedPrice,
    regularPrice,
    hasDiscount,
  };
};

const CARD_TYPOGRAPHY = {
  category: "text-[11px] sm:text-[12px] lg:text-[14px]",
  title: "text-[14px] sm:text-[16px] lg:text-[18px]",
  meta: "text-[11px] sm:text-[12px] lg:text-[14px]",
  regularPrice: "text-[12px] sm:text-[14px] lg:text-[18px]",
  price: "text-[15px] sm:text-[18px] lg:text-[24px]",
  addToCart:
    "!px-2.5 !py-1.5 !text-[10px] sm:!px-3 sm:!py-1.5 sm:!text-[10px] lg:!px-4 lg:!py-2 lg:!text-[11px]",
};

const BlogProductCard = ({
  product,
  layout,
}: {
  product: ProductData;
  layout: "single" | "grid";
}) => {
  const pricing = resolveProductPricing(product);
  const isSingleRowLayout = layout === "single";

  const categoryLabel = (product.categoryLabel || "Artwork").trim();
  const paintingMetaLine =
    product.subtitle ||
    `Handmade Painting | ${product.sizesLabel || "Custom Size"} | Acrylic Colors on Canvas`;

  const imageSrc = product.image || "/images/product-ship.png";
  const imageAlt = product.alt || product.title || "Product";

  return (
    <article
      className={`group relative ${
        isSingleRowLayout
          ? "my-10 rounded-[12px] border border-[#1f1f1f]/10 bg-[#f7f5f0] p-3 sm:p-4"
          : "flex flex-col"
      }`}
    >
      <Link
        href={`/shop/${product.slug}`}
        aria-label={`Open ${product.title}`}
        className="absolute inset-0 z-10"
      />

      <div
        className={`relative z-0 ${
          isSingleRowLayout
            ? "grid grid-cols-[42%_58%] gap-4 sm:grid-cols-[34%_66%] md:grid-cols-[30%_70%]"
            : ""
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-[12px] bg-[#e7e3dc] ${
            isSingleRowLayout ? "aspect-[4/5] h-full" : "aspect-[4/5] sm:aspect-square"
          }`}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes={
              isSingleRowLayout
                ? "(max-width: 768px) 42vw, (max-width: 1024px) 34vw, 30vw"
                : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-700 md:group-hover:scale-105"
          />
        </div>

        <div className={isSingleRowLayout ? "" : "mt-2 sm:mt-3 md:mt-4"}>
          <div className={`${CARD_TYPOGRAPHY.category} text-[#7a7368]`}>
            {categoryLabel}
          </div>
          <div
            className={`mt-1 font-display leading-[1.32] text-[#1f1f1f] ${CARD_TYPOGRAPHY.title}`}
          >
            {product.title}
          </div>
          <div
            className={`mt-1 text-[#6f685f] ${CARD_TYPOGRAPHY.meta} ${
              isSingleRowLayout ? "" : "hidden sm:block"
            }`}
          >
            {paintingMetaLine}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
            {pricing.hasDiscount &&
              typeof pricing.regularPrice === "number" &&
              typeof pricing.resolvedPrice === "number" && (
                <span
                  className={`${CARD_TYPOGRAPHY.regularPrice} text-[#7a7368] line-through`}
                >
                  {formatPrice(
                    pricing.regularPrice,
                    pricing.currencyCode,
                    pricing.currencySymbol
                  )}
                </span>
              )}
            <span
              className={`${CARD_TYPOGRAPHY.price} font-semibold leading-none text-[#27231f]`}
            >
              {formatPrice(
                pricing.resolvedPrice ?? null,
                pricing.currencyCode,
                pricing.currencySymbol
              )}
            </span>
          </div>

          <div className="relative z-20 mt-2 translate-y-0 opacity-100 pointer-events-auto transition-all duration-300 md:mt-3 md:translate-y-1 md:opacity-0 md:pointer-events-none md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:pointer-events-auto">
            <AddToCartButton
              id={product.id}
              woocommerceProductId={product.id}
              title={product.title}
              image={imageSrc}
              subtitle={paintingMetaLine}
              price={pricing.resolvedPrice ?? undefined}
              className={CARD_TYPOGRAPHY.addToCart}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

type ContentPart =
  | { type: "html"; html: string; key: string }
  | { type: "product"; id: number; key: string }
  | { type: "productSlug"; slug: string; key: string }
  | { type: "collection"; ids: number[]; key: string };

const extractIdsFromElement = (element: Element) => {
  const ids = new Set<number>();

  const readId = (value: string | null) => {
    if (!value) return;
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) ids.add(parsed);
  };

  // Attributes commonly present in Woo blocks.
  readId(element.getAttribute("data-product-id"));
  readId(element.getAttribute("data-product_id"));

  element.querySelectorAll("[data-product-id]").forEach((node) =>
    readId(node.getAttribute("data-product-id"))
  );
  element.querySelectorAll("[data-product_id]").forEach((node) =>
    readId(node.getAttribute("data-product_id"))
  );

  // Classic Woo add-to-cart forms.
  element
    .querySelectorAll(
      'input[name="add-to-cart"][value], button[name="add-to-cart"][value], input[name="product_id"][value]'
    )
    .forEach((node) => {
      const value =
        (node as HTMLInputElement).value || node.getAttribute("value") || "";
      readId(value);
    });

  // Links like ?add-to-cart=123
  element.querySelectorAll('a[href*="add-to-cart="]').forEach((node) => {
    const href = node.getAttribute("href") || "";
    const match = href.match(/[?&]add-to-cart=(\d+)/i);
    if (match?.[1]) readId(match[1]);
  });

  return Array.from(ids);
};

const extractSingleIdFromElement = (element: Element) => {
  const ids = extractIdsFromElement(element);
  return ids.length === 1 ? ids[0] : null;
};

const slugFromHref = (href: string) => {
  const trimmed = href.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, "https://artace.invalid");
    const path = url.pathname.replace(/\/+$/, "");
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    const productIndex = segments.findIndex(
      (segment) => segment === "product" || segment === "shop"
    );
    if (productIndex >= 0 && segments[productIndex + 1]) {
      return segments[productIndex + 1];
    }

    return segments[segments.length - 1] ?? null;
  } catch {
    return null;
  }
};

const extractSingleSlugFromElement = (element: Element) => {
  const slugs = new Set<string>();

  const permalink = element.getAttribute("data-product_permalink");
  if (permalink) {
    const slug = slugFromHref(permalink);
    if (slug) slugs.add(slug);
  }

  element.querySelectorAll("a[href]").forEach((node) => {
    const href = node.getAttribute("href") || "";
    const slug = slugFromHref(href);
    if (slug) slugs.add(slug);
  });

  if (slugs.size === 1) {
    return Array.from(slugs)[0];
  }

  const preferred = Array.from(slugs).find((slug) => slug.length > 0);
  return preferred ?? null;
};

const extractIdsFromHtmlString = (html: string) => {
  const ids = new Set<number>();

  const pushId = (rawValue: string | null | undefined) => {
    if (!rawValue) return;
    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isFinite(parsed) && parsed > 0) ids.add(parsed);
  };

  const dataIdRegex = /data-product-id=["'](\d+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = dataIdRegex.exec(html)) !== null) {
    pushId(match[1]);
  }

  const dataIdAltRegex = /data-product_id=["'](\d+)["']/gi;
  while ((match = dataIdAltRegex.exec(html)) !== null) {
    pushId(match[1]);
  }

  const addToCartRegex =
    /name=["']add-to-cart["'][^>]*\svalue=["'](\d+)["']/gi;
  while ((match = addToCartRegex.exec(html)) !== null) {
    pushId(match[1]);
  }

  const productIdInputRegex =
    /name=["']product_id["'][^>]*\svalue=["'](\d+)["']/gi;
  while ((match = productIdInputRegex.exec(html)) !== null) {
    pushId(match[1]);
  }

  const addToCartHrefRegex = /[?&]add-to-cart=(\d+)/gi;
  while ((match = addToCartHrefRegex.exec(html)) !== null) {
    pushId(match[1]);
  }

  return Array.from(ids);
};

const extractSingleSlugFromHtmlString = (html: string) => {
  const slugs = new Set<string>();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html)) !== null) {
    const slug = slugFromHref(match[1] ?? "");
    if (slug) slugs.add(slug);
  }

  const permalinkRegex = /data-product_permalink=["']([^"']+)["']/gi;
  while ((match = permalinkRegex.exec(html)) !== null) {
    const slug = slugFromHref(match[1] ?? "");
    if (slug) slugs.add(slug);
  }

  if (slugs.size === 1) {
    return Array.from(slugs)[0];
  }

  const preferred = Array.from(slugs).find((slug) => slug.length > 0);
  return preferred ?? null;
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

const replaceTagBlocks = (
  html: string,
  tagName: string,
  isTargetTag: (openTag: string) => boolean,
  buildMarker: (blockHtml: string) => string | null
) => {
  const openTagRegex = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = openTagRegex.exec(html)) !== null) {
    const openTag = match[0];
    if (!isTargetTag(openTag)) continue;

    const blockStart = match.index;
    const blockEnd = findMatchingCloseTag(html, tagName, blockStart);
    if (!blockEnd) continue;

    const blockHtml = html.slice(blockStart, blockEnd);
    const marker = buildMarker(blockHtml);

    result += html.slice(lastIndex, blockStart);
    if (marker) result += marker;
    lastIndex = blockEnd;
    openTagRegex.lastIndex = blockEnd;
  }

  if (lastIndex === 0) return html;
  return result + html.slice(lastIndex);
};

const replaceWooBlocksWithMarkers = (html: string) => {
  let output = html;

  output = replaceTagBlocks(
    output,
    "div",
    (openTag) =>
      /data-block-name=["']woocommerce\/single-product["']/i.test(openTag) ||
      /wp-block-woocommerce-single-product/i.test(openTag) ||
      /wp-block-woocommerce-featured-product/i.test(openTag),
    (blockHtml) => {
      const ids = extractIdsFromHtmlString(blockHtml);
      if (ids.length === 1) {
        return `<!--ARTACE_PRODUCT:${ids[0]}-->`;
      }
      const slug = extractSingleSlugFromHtmlString(blockHtml);
      if (slug) {
        return `<!--ARTACE_PRODUCT_SLUG:${slug}-->`;
      }
      return null;
    }
  );

  output = replaceTagBlocks(
    output,
    "div",
    (openTag) =>
      /data-block-name=["']woocommerce\/product-collection["']/i.test(openTag) ||
      /wp-block-woocommerce-product-collection/i.test(openTag),
    (blockHtml) => {
      const ids = extractIdsFromHtmlString(blockHtml);
      if (ids.length > 0) {
        return `<!--ARTACE_COLLECTION:${ids.join(",")}-->`;
      }
      return null;
    }
  );

  output = replaceTagBlocks(
    output,
    "ul",
    (openTag) => /wc-block-product-template/i.test(openTag),
    (blockHtml) => {
      const ids = extractIdsFromHtmlString(blockHtml);
      if (ids.length > 0) {
        return `<!--ARTACE_COLLECTION:${ids.join(",")}-->`;
      }
      return null;
    }
  );

  return output;
};

const splitContentByMarkers = (html: string): ContentPart[] => {
  const parts: ContentPart[] = [];
  const markerRegex =
    /<!--ARTACE_(PRODUCT|PRODUCT_SLUG|COLLECTION):([^>]*)-->/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = markerRegex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    if (before.trim()) {
      parts.push({ type: "html", html: before, key: `html-${index++}` });
    }

    const kind = match[1];
    const payload = match[2] || "";

    if (kind === "PRODUCT") {
      const id = Number.parseInt(payload.trim(), 10);
      if (Number.isFinite(id) && id > 0) {
        parts.push({ type: "product", id, key: `product-${id}-${index++}` });
      }
    } else if (kind === "PRODUCT_SLUG") {
      const slug = payload.trim();
      if (slug) {
        parts.push({
          type: "productSlug",
          slug,
          key: `product-slug-${slug}-${index++}`,
        });
      }
    } else {
      const ids = payload
        .split(",")
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0);

      if (ids.length > 0) {
        parts.push({ type: "collection", ids, key: `collection-${index++}` });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  const after = html.slice(lastIndex);
  if (after.trim()) {
    parts.push({ type: "html", html: after, key: `html-${index++}` });
  }

  return parts;
};

const toContentParts = (contentHtml: string): ContentPart[] => {
  try {
    const preprocessedHtml = replaceWooBlocksWithMarkers(contentHtml);
    if (preprocessedHtml !== contentHtml) {
      const preParts = splitContentByMarkers(preprocessedHtml);
      if (preParts.length > 0) return preParts;
    }

    if (typeof DOMParser === "undefined") {
      return [{ type: "html", html: contentHtml, key: "html-fallback" }];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, "text/html");

    doc.body
      .querySelectorAll('[data-wp-interactive^="woocommerce/"]')
      .forEach((node) => node.remove());

    // Some Woo blocks rely on Gutenberg comments for structure; try to map those to the
    // immediately-following WooCommerce wrapper element so we can replace it cleanly.
    try {
      const getNextElementSibling = (node: Node | null) => {
        let current = node;
        while (current) {
          if (current.nodeType === Node.ELEMENT_NODE) return current as Element;
          if (
            current.nodeType === Node.TEXT_NODE &&
            (current.textContent ?? "").trim().length === 0
          ) {
            current = current.nextSibling;
            continue;
          }
          return null;
        }
        return null;
      };

      const extractIdFromBlockAttrs = (attrs: string) => {
        const match =
          attrs.match(/"productId"\s*:\s*(\d+)/i) ?? attrs.match(/"id"\s*:\s*(\d+)/i);
        if (!match?.[1]) return null;
        const parsed = Number.parseInt(match[1], 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      };

      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
      const commentNodes: Comment[] = [];
      while (walker.nextNode()) {
        commentNodes.push(walker.currentNode as Comment);
      }

      commentNodes.forEach((commentNode) => {
        const value = (commentNode.nodeValue ?? "").trim();
        if (!/^wp:woocommerce\//i.test(value)) return;
        if (/^\/wp:woocommerce\//i.test(value)) return;

        const singleMatch = value.match(
          /^wp:woocommerce\/(single-product|featured-product)\s+({[\s\S]*})/i
        );
        if (singleMatch) {
          const nextElement = getNextElementSibling(commentNode.nextSibling);
          if (!nextElement) return;

          const className = nextElement.getAttribute("class") || "";
          const looksWoo =
            nextElement.getAttribute("data-block-name")?.startsWith("woocommerce/") ||
            /wp-block-woocommerce|wc-block/i.test(className);

          if (!looksWoo) return;

          const productId = extractIdFromBlockAttrs(singleMatch[2] ?? "");
          if (productId) {
            nextElement.replaceWith(doc.createComment(`ARTACE_PRODUCT:${productId}`));
            return;
          }

          const slug = extractSingleSlugFromElement(nextElement);
          if (slug) {
            nextElement.replaceWith(
              doc.createComment(`ARTACE_PRODUCT_SLUG:${slug}`)
            );
            return;
          }
          nextElement.remove();
          return;
        }

        const collectionMatch = value.match(
          /^wp:woocommerce\/product-collection\s+({[\s\S]*})/i
        );
        if (collectionMatch) {
          const nextElement = getNextElementSibling(commentNode.nextSibling);
          if (!nextElement) return;

          const className = nextElement.getAttribute("class") || "";
          const looksWoo =
            nextElement.getAttribute("data-block-name")?.startsWith("woocommerce/") ||
            /wp-block-woocommerce|wc-block/i.test(className);

          if (!looksWoo) return;

          const ids = extractIdsFromElement(nextElement);
          if (ids.length === 0) return;
          nextElement.replaceWith(
            doc.createComment(`ARTACE_COLLECTION:${ids.join(",")}`)
          );
        }
      });
    } catch {
      // Ignore and continue with attribute-based matching below.
    }

    // Fallback: many stores render Woo blocks without `data-block-name`; target their wrapper classes.
    // Replace single product blocks.
    doc.body
      .querySelectorAll(
        ".wp-block-woocommerce-single-product, .wp-block-woocommerce-featured-product"
      )
      .forEach((node) => {
        const productId = extractSingleIdFromElement(node);
        if (productId) {
          node.replaceWith(doc.createComment(`ARTACE_PRODUCT:${productId}`));
          return;
        }

        const slug = extractSingleSlugFromElement(node);
        if (slug) {
          node.replaceWith(doc.createComment(`ARTACE_PRODUCT_SLUG:${slug}`));
          return;
        }
        node.remove();
      });

    doc.body
      .querySelectorAll('[data-block-name="woocommerce/single-product"][data-product-id]')
      .forEach((node) => {
        const rawId = node.getAttribute("data-product-id");
        const productId = rawId ? Number.parseInt(rawId, 10) : NaN;
        if (!Number.isFinite(productId) || productId <= 0) return;

        node.replaceWith(doc.createComment(`ARTACE_PRODUCT:${productId}`));
      });

    doc.body
      .querySelectorAll('[data-block-name="woocommerce/product-collection"]')
      .forEach((node) => {
        const ids = extractIdsFromElement(node);
        if (ids.length === 0) {
          node.remove();
          return;
        }

        node.replaceWith(doc.createComment(`ARTACE_COLLECTION:${ids.join(",")}`));
      });

    // Another common collection markup: `ul.wc-block-product-template`.
    doc.body
      .querySelectorAll("ul.wc-block-product-template")
      .forEach((node) => {
        const ids = extractIdsFromElement(node);
        if (ids.length === 0) {
          node.remove();
          return;
        }
        node.replaceWith(doc.createComment(`ARTACE_COLLECTION:${ids.join(",")}`));
      });

    // Last-resort: forms that expose product ids via `add-to-cart` but lack wrapper identifiers.
    // We replace the closest Woo block container to avoid leaving broken Woo markup in the blog.
    try {
      const handled = new Set<Element>();
      doc.body
        .querySelectorAll(
          'input[name="add-to-cart"][value], button[name="add-to-cart"][value]'
        )
        .forEach((node) => {
          const value =
            (node as HTMLInputElement).value || node.getAttribute("value") || "";
          const container =
            node.closest(
              ".wp-block-woocommerce-single-product, .wp-block-woocommerce-featured-product, [data-block-name=\"woocommerce/single-product\"]"
            ) ||
            node.closest('[class*="wp-block-woocommerce"]') ||
            node.closest('[class*="wc-block"]') ||
            node.closest(".woocommerce");

          if (!container || handled.has(container)) return;
          handled.add(container);

          const parsed = Number.parseInt(value, 10);
          if (Number.isFinite(parsed) && parsed > 0) {
            container.replaceWith(doc.createComment(`ARTACE_PRODUCT:${parsed}`));
            return;
          }

          const slug = extractSingleSlugFromElement(container);
          if (slug) {
            container.replaceWith(doc.createComment(`ARTACE_PRODUCT_SLUG:${slug}`));
            return;
          }
          container.remove();
        });
    } catch {
      // Ignore.
    }

    const transformedHtml = doc.body.innerHTML;
    return splitContentByMarkers(transformedHtml);
  } catch {
    return [{ type: "html", html: contentHtml, key: "html-fallback" }];
  }
};

export const BlogContentWithProducts: React.FC<BlogContentWithProductsProps> = ({
  contentHtml,
  products,
}) => {
  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );
  const productMapBySlug = useMemo(
    () =>
      new Map(
        products.map((product) => [product.slug.toLowerCase(), product])
      ),
    [products]
  );

  const parts = useMemo(() => toContentParts(contentHtml), [contentHtml]);

  const renderCollection = (ids: number[], key: string) => {
    const resolved = ids
      .map((id) => productMap.get(id))
      .filter(Boolean) as ProductData[];

    if (resolved.length === 0) return null;

    return (
      <section key={key} className="my-12">
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 xl:grid-cols-4">
          {resolved.map((product) => (
            <BlogProductCard key={product.id} product={product} layout="grid" />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="article-content">
      {parts.map((part) => {
        if (part.type === "html") {
          return (
            <div key={part.key} dangerouslySetInnerHTML={{ __html: part.html }} />
          );
        }

        if (part.type === "product") {
          const product = productMap.get(part.id);
          if (!product) return null;
          return <BlogProductCard key={part.key} product={product} layout="single" />;
        }

        if (part.type === "productSlug") {
          const product = productMapBySlug.get(part.slug.toLowerCase());
          if (!product) return null;
          return <BlogProductCard key={part.key} product={product} layout="single" />;
        }

        return renderCollection(part.ids, part.key);
      })}
    </div>
  );
};

export default BlogContentWithProducts;
