const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;
const MAX_RETRY_DELAY_MS = 5_000;

type FetchWithRetryOptions = {
  retries?: number;
  retryDelayMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (response: Response, fallbackDelayMs: number) => {
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1_000, MAX_RETRY_DELAY_MS);
  }

  return fallbackDelayMs;
};

// Retries only on network-level failures (fetch() itself throwing — connection
// reset, timeout, DNS failure), which is what a brief upstream WordPress/
// WooCommerce blip looks like. HTTP error responses (404, 500, etc.) are
// returned as-is and are the caller's responsibility — those are valid
// responses, not transient failures, and retrying them would just mask a
// real error or hammer an upstream that's legitimately saying "not found."
export const fetchWithRetry = async (
  input: string | URL,
  init?: RequestInit,
  { retries = DEFAULT_RETRIES, retryDelayMs = DEFAULT_RETRY_DELAY_MS }: FetchWithRetryOptions = {}
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (response.status !== 429 || attempt === retries) {
        return response;
      }

      await sleep(getRetryDelay(response, retryDelayMs * 2 ** attempt));
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs * 2 ** attempt);
      }
    }
  }

  throw lastError;
};
