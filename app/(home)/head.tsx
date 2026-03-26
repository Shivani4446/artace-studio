import { homepageSchema } from "./homepage-schema";

const homepageSchemaJson = JSON.stringify(homepageSchema).replace(
  /</g,
  "\\u003c"
);

export default function Head() {
  return (
    <script
      id="homepage-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: homepageSchemaJson }}
    />
  );
}
