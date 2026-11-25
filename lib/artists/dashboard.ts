// The Artace artist portal: artists apply, pick a plan, pay, publish artworks
// and manage orders there. The storefront only links to it and reads its
// public artist-profile API (see lib/artists/directory.ts).
export const ARTIST_DASHBOARD_URL = (
  process.env.NEXT_PUBLIC_ARTIST_DASHBOARD_URL || "https://dashboard.artacestudio.com"
).replace(/\/+$/, "");

export const ARTIST_DASHBOARD_LINKS = {
  home: ARTIST_DASHBOARD_URL,
  apply: `${ARTIST_DASHBOARD_URL}/apply`,
  signIn: `${ARTIST_DASHBOARD_URL}/auth/sign-in`,
} as const;

// Adds UTM tags so the portal's analytics can attribute sign-ups to the
// storefront CTA that sent them.
export const withDashboardUtm = (url: string, content: string) => {
  const target = new URL(url);
  target.searchParams.set("utm_source", "artacestudio.com");
  target.searchParams.set("utm_medium", "referral");
  target.searchParams.set("utm_campaign", "sell-your-art");
  target.searchParams.set("utm_content", content);
  return target.toString();
};
