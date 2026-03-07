const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  laquo: "\u00ab",
  raquo: "\u00bb",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
  deg: "\u00b0",
  bull: "\u2022",
  middot: "\u00b7",
  euro: "\u20ac",
  pound: "\u00a3",
  yen: "\u00a5",
  cent: "\u00a2",
};

const ENTITY_PATTERN = /&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);?/g;

const decodeEntityToken = (token: string, fallback: string) => {
  const normalizedToken = token.toLowerCase();

  if (normalizedToken.startsWith("#")) {
    const isHex = normalizedToken.startsWith("#x");
    const numericPart = normalizedToken.slice(isHex ? 2 : 1);
    const codePoint = Number.parseInt(numericPart, isHex ? 16 : 10);

    if (!Number.isFinite(codePoint) || codePoint <= 0) {
      return fallback;
    }

    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return fallback;
    }
  }

  return NAMED_HTML_ENTITIES[normalizedToken] ?? fallback;
};

export const decodeHtmlEntities = (value: string | null | undefined) => {
  if (!value) return "";

  let decoded = value;

  // Multiple passes handle double-encoded entities from some CMS payloads.
  for (let pass = 0; pass < 2; pass += 1) {
    const nextValue = decoded.replace(ENTITY_PATTERN, (match, token: string) =>
      decodeEntityToken(token, match)
    );

    if (nextValue === decoded) break;
    decoded = nextValue;
  }

  return decoded;
};

export const stripHtmlAndDecode = (value: string | null | undefined) => {
  const textOnly = (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return decodeHtmlEntities(textOnly);
};
