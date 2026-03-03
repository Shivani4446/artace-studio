const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  bull: "•",
  middot: "·",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
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

