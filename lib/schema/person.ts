const WORKS_FOR = {
  "@type": "Organization",
  name: "Artace Studio",
  url: "https://artacestudio.com",
} as const;

export type PersonSchemaInput = {
  name: string;
  jobTitle?: string;
  image?: string;
  description?: string;
  url?: string;
  sameAs?: string[];
};

// Returns a bare `Person` node (no `@context`) — same convention as
// generateAggregateRatingSchema/generateReviewsSchema: composed into a
// top-level `@graph` at the call site, which carries the single `@context`.
export function generatePersonSchema(input: PersonSchemaInput) {
  const schema: Record<string, unknown> = {
    "@type": "Person",
    name: input.name,
    worksFor: WORKS_FOR,
  };

  if (input.jobTitle) schema.jobTitle = input.jobTitle;
  if (input.image) schema.image = input.image;
  if (input.description) schema.description = input.description;
  if (input.url) schema.url = input.url;
  if (input.sameAs && input.sameAs.length > 0) schema.sameAs = input.sameAs;

  return schema;
}
