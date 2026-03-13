const sanitizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const getWordPressJwtSecret = () =>
  sanitizeText(process.env.WORDPRESS_JWT_SECRET_KEY);

const base64UrlToBytes = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  const maybeBuffer = (globalThis as { Buffer?: { from: (v: string, enc: string) => Uint8Array } })
    .Buffer;
  if (maybeBuffer) {
    return new Uint8Array(maybeBuffer.from(padded, "base64"));
  }

  if (typeof atob !== "function") {
    throw new Error("No base64 decoder available.");
  }

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const textToBytes = (value: string) => new TextEncoder().encode(value);

export const isProbablyJwt = (token: string) => token.split(".").length === 3;

export const verifyHs256Jwt = async (token: string, secret: string) => {
  const normalizedToken = sanitizeText(token);
  const normalizedSecret = sanitizeText(secret);

  if (!normalizedToken || !normalizedSecret) return false;
  const parts = normalizedToken.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  if (!header || !payload || !signature) return false;

  // JWT signing input is: `${base64url(header)}.${base64url(payload)}`
  const signingInput = `${header}.${payload}`;

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // Next.js Edge should always provide WebCrypto. If not, fail closed.
    return false;
  }

  try {
    const key = await subtle.importKey(
      "raw",
      textToBytes(normalizedSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = base64UrlToBytes(signature);
    return await subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      textToBytes(signingInput)
    );
  } catch {
    return false;
  }
};

