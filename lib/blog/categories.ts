// lib/blog/categories.ts
//
// Blog categories for the archive sidebar, taken straight from WordPress.
// Every WordPress category with at least one published post becomes a
// category on /blogs (?category=<slug>); empty categories stay hidden until a
// post is added to them.

import { stripHtmlAndDecode } from "@/utils/text";
import type {
  WordPressNormalizedBlogPost,
  WordPressTaxonomyTerm,
} from "@/utils/wordpress-blog";

export type BlogCategory = {
  name: string;
  slug: string;
  description: string;
  count: number;
};

export function buildBlogCategories(
  posts: WordPressNormalizedBlogPost[],
  terms: WordPressTaxonomyTerm[]
): BlogCategory[] {
  const countByName = new Map<string, number>();
  for (const post of posts) {
    for (const name of post.categories) {
      countByName.set(name, (countByName.get(name) ?? 0) + 1);
    }
  }

  const categories: BlogCategory[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    const name = stripHtmlAndDecode(term.name ?? "");
    const slug = term.slug?.trim();
    const count = countByName.get(name) ?? 0;
    if (!name || !slug || count === 0 || seen.has(slug)) continue;
    seen.add(slug);
    categories.push({
      name,
      slug,
      description: stripHtmlAndDecode(term.description ?? "").trim(),
      count,
    });
  }

  // Most posts first, then alphabetical.
  return categories.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
