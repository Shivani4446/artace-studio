// lib/blog/clusters.ts
//
// Topic clusters for the blog archive.
//
// How it works (editorial rules):
// - A post marked as Rank Math "Pillar Content" is a cornerstone. Each
//   cornerstone creates a cluster named after its category (Rank Math's
//   primary category if set, otherwise its most specific category).
// - Every other post in that category joins the cluster. A post whose
//   categories match several clusters goes to the most specific one (the
//   category with the fewest posts), so no post is listed twice.
// - Posts that match no cluster are returned as `unclustered`.
// - If a category has more than one cornerstone, the newest is the lead and
//   the others are listed as articles in the same cluster.
//
// The pillar flag and primary category come from a small WordPress snippet
// that exposes them on the REST API (`artace_pillar`,
// `artace_primary_category`). Without it, there are simply no clusters.

export type ClusterablePost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  categories: string[];
  tags: string[];
  publishedAt: string | null;
  modifiedAt: string | null;
  isPillar: boolean;
  primaryCategory: string | null;
};

export type BlogCluster<P extends ClusterablePost = ClusterablePost> = {
  /** Category name the cluster is built on. */
  name: string;
  /** URL-safe id for in-page anchors. */
  id: string;
  cornerstone: P;
  /** Newest first. Excludes the cornerstone. */
  articles: P[];
};

export type BlogClusterResult<P extends ClusterablePost = ClusterablePost> = {
  clusters: BlogCluster<P>[];
  /** Newest first. */
  unclustered: P[];
};

// WordPress's default bucket; never a useful cluster on its own when a post
// has a more specific category.
const GENERIC_CATEGORIES = new Set(["general", "uncategorized"]);

const time = (value: string | null) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const byNewest = <P extends ClusterablePost>(a: P, b: P) =>
  time(b.publishedAt) - time(a.publishedAt);

export const toClusterId = (name: string) =>
  `cluster-${name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

export function buildBlogClusters<P extends ClusterablePost>(posts: P[]): BlogClusterResult<P> {
  // How many posts use each category — fewer posts = more specific.
  const categoryCount = new Map<string, number>();
  for (const post of posts) {
    for (const category of post.categories) {
      categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1);
    }
  }

  const specificity = (category: string) =>
    (GENERIC_CATEGORIES.has(category.toLowerCase()) ? 1_000_000 : 0) +
    (categoryCount.get(category) ?? 0);

  const mostSpecific = (categories: string[]) =>
    [...categories].sort((a, b) => specificity(a) - specificity(b) || a.localeCompare(b))[0] ??
    null;

  // 1. Each cornerstone claims its cluster category; newest cornerstone leads.
  const cornerstoneByCategory = new Map<string, P>();
  for (const post of [...posts].filter((p) => p.isPillar).sort(byNewest)) {
    const primary =
      post.primaryCategory && post.categories.includes(post.primaryCategory)
        ? post.primaryCategory
        : null;
    const category = primary ?? mostSpecific(post.categories);
    if (category && !cornerstoneByCategory.has(category)) {
      cornerstoneByCategory.set(category, post);
    }
  }

  const leadIds = new Set([...cornerstoneByCategory.values()].map((post) => post.id));
  const articlesByCategory = new Map<string, P[]>(
    [...cornerstoneByCategory.keys()].map((category) => [category, []])
  );
  const unclustered: P[] = [];

  // 2. Every other post joins its most specific clustered category.
  for (const post of posts) {
    if (leadIds.has(post.id)) continue;
    const clusteredCategories = post.categories.filter((category) =>
      cornerstoneByCategory.has(category)
    );
    const target = mostSpecific(clusteredCategories);
    if (target) {
      articlesByCategory.get(target)!.push(post);
    } else {
      unclustered.push(post);
    }
  }

  // 3. Clusters with the most recent activity come first.
  const clusters: BlogCluster<P>[] = [...cornerstoneByCategory.entries()].map(
    ([name, cornerstone]) => ({
      name,
      id: toClusterId(name),
      cornerstone,
      articles: (articlesByCategory.get(name) ?? []).sort(byNewest),
    })
  );

  const lastActivity = (cluster: BlogCluster<P>) =>
    Math.max(time(cluster.cornerstone.publishedAt), ...cluster.articles.map((p) => time(p.publishedAt)));

  clusters.sort((a, b) => lastActivity(b) - lastActivity(a) || a.name.localeCompare(b.name));

  return { clusters, unclustered: unclustered.sort(byNewest) };
}
