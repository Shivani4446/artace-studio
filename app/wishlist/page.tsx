import type { Metadata } from "next";

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: "My Wishlist | Saved Artworks | Artace Studio",
    description: "View your saved favorite artworks. Keep track of paintings you love and want to buy later.",
    keywords: "wishlist, saved artworks, favorites, saved art",
    openGraph: {
      title: "My Wishlist | Saved Artworks | Artace Studio",
      description: "View your saved favorite artworks.",
      url: "https://artacestudio.com/wishlist",
    },
    twitter: {
      card: "summary_large_image",
      title: "My Wishlist | Artace Studio",
      description: "Your saved favorite artworks.",
    },
  });
}

import WishlistPageClient from "./wishlist-client";

export default WishlistPageClient;