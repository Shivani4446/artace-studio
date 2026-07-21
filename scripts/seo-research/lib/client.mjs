// scripts/seo-research/lib/client.mjs
const BASE_URL = "https://api.seranking.com";
const MIN_INTERVAL_MS = 1100; // trial key allows 1 request/second; pad slightly

let lastRequestAt = 0;

async function throttle() {
  const now = Date.now();
  const wait = lastRequestAt + MIN_INTERVAL_MS - now;
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestAt = Date.now();
}

function apiKey() {
  const key = process.env.SE_RANKING_API_KEY;
  if (!key) {
    throw new Error(
      "SE_RANKING_API_KEY is not set. Run scripts with: node --env-file=.env.local ..."
    );
  }
  return key;
}

export async function seRankingRequest(
  path,
  { method = "GET", query = {}, body, _retried = false } = {}
) {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  await throttle();

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Token ${apiKey()}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 429 && !_retried) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return seRankingRequest(path, { method, query, body, _retried: true });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SE Ranking request failed (${response.status} ${url}): ${text}`);
  }

  return response.json();
}

export async function getCreditsRemaining() {
  const data = await seRankingRequest("/v1/account/subscription", {
    query: { output: "json" },
  });
  return data.subscription_info.units_left;
}
