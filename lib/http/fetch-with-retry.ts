const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;
const MAX_RETRY_DELAY_MS = 5_000;
const DEFAULT_RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

type FetchWithRetryOptions = {
  retries?: number;
  retryDelayMs?: number;
  retryStatuses?: number[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (response: Response, fallbackDelayMs: number) => {
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1_000, MAX_RETRY_DELAY_MS);
  }

  const retryAfterDate = retryAfter ? Date.parse(retryAfter) : Number.NaN;
  if (Number.isFinite(retryAfterDate)) {
    return Math.min(Math.max(retryAfterDate - Date.now(), 0), MAX_RETRY_DELAY_MS);
  }

  return Math.min(fallbackDelayMs, MAX_RETRY_DELAY_MS);
};

const shouldRetryResponse = (response: Response, retryStatuses: Set<number>) =>
  retryStatuses.has(response.status);

// Retries network-level failures plus temporary WordPress/WooCommerce HTTP
// responses such as 429 and gateway/server errors. Permanent responses like
// 404 are returned as-is so callers can keep their normal fallback behavior.
export const fetchWithRetry = async (
  input: string | URL,
  init?: RequestInit,
  {
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryStatuses,
  }: FetchWithRetryOptions = {}
): Promise<Response> => {
  let lastError: unknown;
  const statuses = retryStatuses ? new Set(retryStatuses) : DEFAULT_RETRY_STATUSES;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!shouldRetryResponse(response, statuses) || attempt === retries) {
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
