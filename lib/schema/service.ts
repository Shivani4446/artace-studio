const PROVIDER = {
  "@type": "Organization",
  name: "Artace Studio",
  url: "https://artacestudio.com",
} as const;

export type ServiceSchemaInput = {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  areaServed?: string | string[];
};

// A minimal, self-contained Organization is embedded as `provider` (rather
// than referencing the homepage's "#organization" @id) because Google's
// structured-data tooling doesn't guarantee stitching @id references across
// separate pages/script tags — each page's schema needs to stand on its own.
export function generateServiceSchema(input: ServiceSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.serviceType,
    provider: PROVIDER,
  };

  if (input.areaServed) {
    schema.areaServed = input.areaServed;
  }

  return schema;
}
