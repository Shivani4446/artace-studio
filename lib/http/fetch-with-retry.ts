const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 400;
const MAX_RETRY_DELAY_MS = 5_000;
// 429 is deliberately NOT retried. A 429 means WordPress (or Hostinger's
// firewall in front of it) is already rate-limiting our egress IP; retrying
// within milliseconds from the same IP only adds requests to the window that
// tripped the limit and keeps the block alive longer. Every page fetch here
// uses Next's data cache, which keeps serving the last good (stale) response
// when a background revalidation fails, so not retrying costs nothing for
// warm pages. Gateway/server errors and network failures still get one retry.
const DEFAULT_RETRY_STATUSES = new Set([500, 502, 503, 504]);

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

// Retries network-level failures plus temporary gateway/server errors once.
// 429 and permanent responses like 404 are returned as-is so callers can keep
// their normal fallback behavior (see DEFAULT_RETRY_STATUSES for why 429 is
// not retried).
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
