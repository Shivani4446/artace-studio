import type { Metadata } from "next";
import BlogArchivePageClient from "@/components/blogarchive/BlogArchivePageClient";

export const metadata: Metadata = {
  title: "Art Blog | Painting Tips & Artist Stories | Artace Studio",
  description: "Explore Artace Studio's art blog - Read painting tips, artist stories, and guides. Discover techniques, trends, and inspiration for art enthusiasts.",
  keywords: "art blog, painting tips, artist stories, art guide, painting techniques, art inspiration",
  openGraph: {
    title: "Art Blog | Painting Tips & Artist Stories | Artace Studio",
    description: "Explore art tips, artist stories, and creative guides.",
    url: "https://artacestudio.com/blogs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Blog | Artace Studio",
    description: "Painting tips and artist stories.",
  },
};

const BlogsPage = () => {
  return <BlogArchivePageClient />;
};

export default BlogsPage;
