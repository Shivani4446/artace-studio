import { NextResponse } from "next/server";
import { fetchSearchResults } from "@/lib/search";

export const runtime = "edge";

type Suggestion = {
  id: string;
  type: "product" | "blog" | "collection" | "page";
  title: string;
  href: string;
  subtitle?: string;
  image?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit") || "6"), 10);

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const { products, blogs, collections, pages } = await fetchSearchResults(query, {
    productLimit: Math.max(limit, 6),
    blogLimit: Math.max(Math.ceil(limit / 2), 4),
  });

  const suggestions: Suggestion[] = [
    ...products.map((product) => ({
      id: `product-${product.id}`,
      type: "product",
      title: product.name,
      href: `/shop/${product.slug}`,
      subtitle: "Artwork",
      image: product.image,
    })),
    ...collections.map((collection) => ({
      id: `collection-${collection.id}`,
      type: "collection",
      title: collection.title,
      href: collection.href,
      subtitle: "Collection",
    })),
    ...blogs.map((post) => ({
      id: `blog-${post.id}`,
      type: "blog",
      title: post.title,
      href: `/blogs/${post.slug}`,
      subtitle: "Journal",
    })),
    ...pages.map((page) => ({
      id: `page-${page.id}`,
      type: "page",
      title: page.title,
      href: page.href,
      subtitle: "Page",
    })),
  ].slice(0, limit);

  return NextResponse.json({ suggestions });
}
