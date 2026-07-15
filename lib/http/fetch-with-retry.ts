const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

type FetchWithRetryOptions = {
  retries?: number;
  retryDelayMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw lastError;
};
