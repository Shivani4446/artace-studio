import BlogArchiveCatalog from "@/components/blogarchive/BlogArchiveCatalog";
import {
  fetchAllWordPressCategories,
  fetchAllWordPressPosts,
  fetchAllWordPressTags,
  getWordPressTaxonomyNames,
  normalizeWordPressBlogPosts,
  type WordPressNormalizedBlogPost,
} from "@/utils/wordpress-blog";

export const revalidate = 120;

const BlogsPage = async () => {
  let posts: WordPressNormalizedBlogPost[] = [];
  let availableCategories: string[] = [];
  let availableTags: string[] = [];
  let loadError: string | null = null;

  try {
    const [rawPosts, rawCategories, rawTags] = await Promise.all([
      fetchAllWordPressPosts(),
      fetchAllWordPressCategories(),
      fetchAllWordPressTags(),
    ]);

    posts = normalizeWordPressBlogPosts(rawPosts, rawCategories, rawTags);
    availableCategories = getWordPressTaxonomyNames(
      rawCategories,
      posts.flatMap((post) => post.categories)
    );
    availableTags = getWordPressTaxonomyNames(rawTags, posts.flatMap((post) => post.tags));
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load blog posts.";
  }

  return (
    <BlogArchiveCatalog
      posts={posts}
      availableCategories={availableCategories}
      availableTags={availableTags}
      loadError={loadError}
    />
  );
};

export default BlogsPage;
