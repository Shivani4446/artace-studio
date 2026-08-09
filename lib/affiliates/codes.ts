// Slugified full name + a short random suffix for guaranteed uniqueness —
// memorable (e.g. "priya-4f2a"), reused by Phase 2's signup flow later.
export const generateReferralCode = (fullName: string): string => {
  const slug = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 24)
    .replace(/^-+|-+$/g, "");

  const suffix = Math.random().toString(36).slice(2, 6);
  return slug ? `${slug}-${suffix}` : `affiliate-${suffix}`;
};
