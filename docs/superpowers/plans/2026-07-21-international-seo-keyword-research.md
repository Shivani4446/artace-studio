# International SEO Keyword Research & Homepage Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pull real keyword-volume/difficulty/intent data and competitor keyword-gap data from the SE-Ranking API for the India persona and 10 international regions, run a fresh technical/on-page audit of artacestudio.com, and synthesize everything into one reference report that the upcoming regional-architecture and homepage-rebuild work will draw from.

**Architecture:** A small set of one-off Node scripts under `scripts/seo-research/` call the SE-Ranking Data API directly (native `fetch`, no SDK), rate-limited to the trial key's 1 request/second cap, and save every raw response as JSON under `docs/seo/data/`. A final synthesis pass reads all the saved JSON plus the existing `SEO-audit.txt` and writes the human-readable markdown report. Nothing here touches the Next.js app itself — this is a research/reporting task only.

**Tech Stack:** Node.js (v26, native `fetch`, `--env-file` flag, ESM `.mjs`, `import.meta.dirname`). No test framework exists in this project (confirmed in prior plans) — verification here is running each script against the live SE-Ranking API and inspecting the saved JSON output and console logs, the same convention used for the currency-dropdown feature's external API integration.

## Global Constraints

- SE-Ranking base URL: `https://api.seranking.com`. Auth header: `Authorization: Token <key>`.
- `SE_RANKING_API_KEY` lives only in `artace-studio/.env.local` (already gitignored via `.env*` in `.gitignore`) and as a blank placeholder in `.env.example`. Never hardcoded in scripts, never logged in full, never written into any committed file.
- Trial key: 100,000 credits total, expires 2026-08-04. Budget target for this whole research pass: roughly 10,000-25,000 credits (Task 4's expansion calls are the largest and most variable cost), comfortably within the 100,000 available. Every script logs credits-before and credits-after via `GET /v1/account/subscription` (0 credits to call) so usage is always visible.
- Rate limit: 1 request/second on the trial key. All requests go through the shared client's throttle (1100ms minimum spacing) — never call `fetch` directly against `api.seranking.com` outside that client.
- Region codes (ISO 3166-1 alpha-2, confirmed against SE-Ranking's regional database): India `in`; Tier 1 `uk`, `au`, `ae`, `ie`, `nz`; Tier 2 `sg`, `de`, `nl`, `my`, `ph`.
- Our domain for all domain-analysis calls: `artacestudio.com`.
- Competitor domains: India — `fizdi.com`, `sajaao.com`. International — `saatchiart.com`, `singulart.com`, `artfinder.com`, `ugallery.com` (all confirmed live domains, not guessed).
- All scripts are run from inside the `artace-studio/` directory with `node --env-file=.env.local scripts/seo-research/<script>.mjs`.
- Raw JSON responses under `docs/seo/data/` are committed to the repo (not secrets, worth keeping after the trial key expires).

---

### Task 1: Rate-limited API client + credential wiring

**Files:**
- Create: `scripts/seo-research/lib/client.mjs`
- Create: `scripts/seo-research/lib/fs-helpers.mjs`
- Modify: `.env.example`

**Interfaces:**
- Produces: `seRankingRequest(path, { method, query, body })` — throttled, retries once on HTTP 429, throws on any other non-2xx response. `getCreditsRemaining()` — returns `units_left` as a number. `saveJson(relativePath, data)` — writes pretty-printed JSON under `docs/seo/data/<relativePath>`, creating directories as needed, returns the full path written.
- All later tasks import these three functions from `./lib/client.mjs` and `./lib/fs-helpers.mjs` — no task calls `fetch` directly.

- [ ] **Step 1: Add the API key placeholder to `.env.example`**

Add this line to `artace-studio/.env.example` (anywhere among the other API keys):

```
SE_RANKING_API_KEY=
```

- [ ] **Step 2: Add the real key to `.env.local`**

Add a `SE_RANKING_API_KEY=<key>` line to `artace-studio/.env.local` (already gitignored, do not commit), using the actual key value you were given out-of-band. Never write the literal key value into any file that gets committed, including this plan.

- [ ] **Step 3: Write `scripts/seo-research/lib/client.mjs`**

```javascript
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
```

- [ ] **Step 4: Write `scripts/seo-research/lib/fs-helpers.mjs`**

```javascript
// scripts/seo-research/lib/fs-helpers.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_ROOT = path.resolve(import.meta.dirname, "../../../docs/seo/data");

export async function saveJson(relativePath, data) {
  const fullPath = path.join(DATA_ROOT, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return fullPath;
}
```

- [ ] **Step 5: Verify the client can reach the live API**

Run (from `artace-studio/`):

```bash
node --env-file=.env.local --input-type=module -e "
import { getCreditsRemaining } from './scripts/seo-research/lib/client.mjs';
console.log('credits remaining:', await getCreditsRemaining());
"
```

Expected: prints a real number (e.g. `credits remaining: 99900`), not `undefined` or a thrown error. If it throws `SE_RANKING_API_KEY is not set`, re-check Step 2.

- [ ] **Step 6: Commit**

```bash
git add scripts/seo-research/lib/client.mjs scripts/seo-research/lib/fs-helpers.mjs .env.example
git commit -m "Add rate-limited SE-Ranking API client and JSON save helper"
```

(`.env.local` is gitignored and must not appear in `git status` as staged — confirm with `git status` before committing that only the three files above are staged.)

---

### Task 2: Region, keyword, and competitor configuration

**Files:**
- Create: `scripts/seo-research/lib/config.mjs`

**Interfaces:**
- Consumes: nothing (pure data module).
- Produces: `INDIA_REGION`, `TIER1_REGIONS`, `TIER2_REGIONS` (each `{ code, name }` or array of them), `INDIA_SEEDS`, `INTERNATIONAL_SEEDS` (arrays of keyword strings), `INDIA_COMPETITORS`, `INTERNATIONAL_COMPETITORS` (arrays of domain strings), `OUR_DOMAIN` (string). Tasks 3–7 import from this module exclusively — no task hardcodes a region code, seed keyword, or competitor domain outside this file.

- [ ] **Step 1: Write `scripts/seo-research/lib/config.mjs`**

```javascript
// scripts/seo-research/lib/config.mjs
export const OUR_DOMAIN = "artacestudio.com";

export const INDIA_REGION = { code: "in", name: "India" };

export const TIER1_REGIONS = [
  { code: "uk", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "ie", name: "Ireland" },
  { code: "nz", name: "New Zealand" },
];

export const TIER2_REGIONS = [
  { code: "sg", name: "Singapore" },
  { code: "de", name: "Germany" },
  { code: "nl", name: "Netherlands" },
  { code: "my", name: "Malaysia" },
  { code: "ph", name: "Philippines" },
];

// Middle-class, Vastu, affordable home-decor intent (India persona).
export const INDIA_SEEDS = [
  "affordable canvas paintings online india",
  "vastu paintings for home",
  "wall art for living room india",
  "pooja room paintings",
  "ganesha canvas painting",
  "radha krishna painting for home",
  "budget wall art india",
  "home decor paintings online",
  "canvas painting for bedroom",
  "housewarming gift painting india",
];

// Art collector / enthusiast intent, reused across all 10 international regions.
export const INTERNATIONAL_SEEDS = [
  "buy original paintings online",
  "custom canvas painting commission",
  "bespoke wall art commission",
  "original abstract art for sale",
  "commission a painting online",
  "handcrafted canvas art",
  "contemporary indian art for sale",
  "custom portrait painting commission",
  "investment art original paintings",
  "art collector gift original painting",
];

export const INDIA_COMPETITORS = ["fizdi.com", "sajaao.com"];

export const INTERNATIONAL_COMPETITORS = [
  "saatchiart.com",
  "singulart.com",
  "artfinder.com",
  "ugallery.com",
];
```

- [ ] **Step 2: Verify the config module loads and has the right shape**

Run (from `artace-studio/`):

```bash
node --input-type=module -e "
import * as config from './scripts/seo-research/lib/config.mjs';
console.log('regions:', 1 + config.TIER1_REGIONS.length + config.TIER2_REGIONS.length);
console.log('india seeds:', config.INDIA_SEEDS.length);
console.log('intl seeds:', config.INTERNATIONAL_SEEDS.length);
console.log('india competitors:', config.INDIA_COMPETITORS.length);
console.log('intl competitors:', config.INTERNATIONAL_COMPETITORS.length);
"
```

Expected output exactly:

```
regions: 11
india seeds: 10
intl seeds: 10
india competitors: 2
intl competitors: 4
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seo-research/lib/config.mjs
git commit -m "Add region/keyword/competitor config for SEO research scripts"
```

---

### Task 3: Bulk keyword metrics export (all 11 regions)

**Files:**
- Create: `scripts/seo-research/01-bulk-export.mjs`

**Interfaces:**
- Consumes: `seRankingRequest`, `getCreditsRemaining` from `./lib/client.mjs`; `saveJson` from `./lib/fs-helpers.mjs`; `INDIA_REGION`, `TIER1_REGIONS`, `TIER2_REGIONS`, `INDIA_SEEDS`, `INTERNATIONAL_SEEDS` from `./lib/config.mjs`.
- Produces: `docs/seo/data/<region-code>/keywords-export.json` for all 11 regions — an array of `{ is_data_found, keyword, volume, cpc, competition, difficulty, intents, history_trend }` objects. Task 4 and Task 5 read these files to pick top seed keywords.

- [ ] **Step 1: Write `scripts/seo-research/01-bulk-export.mjs`**

```javascript
// scripts/seo-research/01-bulk-export.mjs
import { seRankingRequest, getCreditsRemaining } from "./lib/client.mjs";
import { saveJson } from "./lib/fs-helpers.mjs";
import {
  INDIA_REGION,
  TIER1_REGIONS,
  TIER2_REGIONS,
  INDIA_SEEDS,
  INTERNATIONAL_SEEDS,
} from "./lib/config.mjs";

const ALL_REGIONS = [INDIA_REGION, ...TIER1_REGIONS, ...TIER2_REGIONS];

async function run() {
  const before = await getCreditsRemaining();
  console.log(`Credits before: ${before}`);

  for (const region of ALL_REGIONS) {
    const seeds = region.code === "in" ? INDIA_SEEDS : INTERNATIONAL_SEEDS;
    console.log(`Fetching bulk export for ${region.name} (${region.code})...`);
    const data = await seRankingRequest("/v1/keywords/export", {
      method: "POST",
      query: { source: region.code },
      body: { keywords: seeds },
    });
    const savedTo = await saveJson(`${region.code}/keywords-export.json`, data);
    console.log(`  saved -> ${savedTo}`);
  }

  const after = await getCreditsRemaining();
  console.log(`Credits after: ${after} (used ${before - after})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it against the live API**

```bash
node --env-file=.env.local scripts/seo-research/01-bulk-export.mjs
```

Expected: 11 "saved -> ..." lines (one per region: `in`, `uk`, `au`, `ae`, `ie`, `nz`, `sg`, `de`, `nl`, `my`, `ph`), ending with a credits-used line showing roughly 1,100 credits consumed (11 regions × 100 credits/request).

- [ ] **Step 3: Spot-check one output file**

Run:

```bash
node -e "const d = require('./docs/seo/data/in/keywords-export.json'); console.log(d.length, d[0]);"
```

Expected: prints `10 { is_data_found: true, keyword: 'affordable canvas paintings online india', volume: <number>, ... }` (10 entries matching `INDIA_SEEDS`, first entry has a real `volume` field).

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-research/01-bulk-export.mjs docs/seo/data/
git commit -m "Add bulk keyword export script and pull data for all 11 regions"
```

---

### Task 4: Related, question, and longtail keyword expansion (Tier 1 + India)

**Files:**
- Create: `scripts/seo-research/02-expansion.mjs`

**Interfaces:**
- Consumes: `seRankingRequest`, `getCreditsRemaining` from `./lib/client.mjs`; `saveJson` from `./lib/fs-helpers.mjs`; `INDIA_REGION`, `TIER1_REGIONS`, `INDIA_SEEDS`, `INTERNATIONAL_SEEDS` from `./lib/config.mjs`; reads `docs/seo/data/<region-code>/keywords-export.json` written by Task 3.
- Produces: `docs/seo/data/<region-code>/related.json`, `docs/seo/data/<region-code>/questions.json`, `docs/seo/data/<region-code>/longtail.json` for India + the 5 Tier 1 regions (6 regions × 3 files = 18 files). Each file is an array of `{ seed, total, keywords }` objects, one per expanded seed keyword. `topSeedKeywords(regionCode, seedList)` prefers keywords with tracked volume data but falls back to the persona seed list's own order so every region gets `TOP_N_SEEDS` (3) seeds even where Task 3 found sparse/no volume data (observed for `ae`, `ie`, `nz`).

- [ ] **Step 1: Write `scripts/seo-research/02-expansion.mjs`**

```javascript
// scripts/seo-research/02-expansion.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { seRankingRequest, getCreditsRemaining } from "./lib/client.mjs";
import { saveJson } from "./lib/fs-helpers.mjs";
import {
  INDIA_REGION,
  TIER1_REGIONS,
  INDIA_SEEDS,
  INTERNATIONAL_SEEDS,
} from "./lib/config.mjs";

const EXPANSION_REGIONS = [INDIA_REGION, ...TIER1_REGIONS];
const TOP_N_SEEDS = 3;
const RESULT_LIMIT = 30;
const DATA_ROOT = path.resolve(import.meta.dirname, "../../docs/seo/data");

// Task 3's live pull showed several regions (e.g. ae, ie, nz) have few or zero
// seed keywords with is_data_found: true in SE-Ranking's regional database for
// these specific phrases. That doesn't mean the related/questions/longtail
// endpoints have nothing to offer for that seed — those endpoints look up
// expansion keywords for the phrase directly, independent of whether the
// phrase's own volume was indexed. So: prefer seeds with tracked data (best
// signal of relevance), but fall back to the original persona seed list's
// order to fill out TOP_N_SEEDS rather than leaving a region with zero seeds.
async function topSeedKeywords(regionCode, seedList) {
  const filePath = path.join(DATA_ROOT, regionCode, "keywords-export.json");
  const raw = JSON.parse(await readFile(filePath, "utf8"));
  const withData = raw
    .filter((entry) => entry.is_data_found)
    .sort((a, b) => b.volume - a.volume)
    .map((entry) => entry.keyword);
  const fallback = seedList.filter((keyword) => !withData.includes(keyword));
  return [...withData, ...fallback].slice(0, TOP_N_SEEDS);
}

async function run() {
  const before = await getCreditsRemaining();
  console.log(`Credits before: ${before}`);

  for (const region of EXPANSION_REGIONS) {
    const seedList = region.code === "in" ? INDIA_SEEDS : INTERNATIONAL_SEEDS;
    const seedKeywords = await topSeedKeywords(region.code, seedList);
    console.log(`${region.name}: expanding on ${seedKeywords.join(", ")}`);

    for (const endpoint of ["related", "questions", "longtail"]) {
      const results = [];
      for (const keyword of seedKeywords) {
        const data = await seRankingRequest(`/v1/keywords/${endpoint}`, {
          query: { source: region.code, keyword, limit: RESULT_LIMIT },
        });
        results.push({ seed: keyword, ...data });
      }
      const savedTo = await saveJson(`${region.code}/${endpoint}.json`, results);
      console.log(`  ${endpoint} saved -> ${savedTo}`);
    }
  }

  const after = await getCreditsRemaining();
  console.log(`Credits after: ${after} (used ${before - after})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it against the live API**

```bash
node --env-file=.env.local scripts/seo-research/02-expansion.mjs
```

Expected: for each of the 6 regions (`in`, `uk`, `au`, `ae`, `ie`, `nz`), 3 "saved ->" lines (related, questions, longtail) — 18 total — ending with a credits-used line. This is the most expensive step (10 credits per returned keyword, up to 30 keywords per call, 54 calls total = up to 16,200 credits worst case); confirm the after-total is still comfortably above 70,000 (well within budget even at the worst case).

- [ ] **Step 3: Spot-check one output file**

```bash
node -e "const d = require('./docs/seo/data/uk/related.json'); console.log(d.length, d[0].seed, d[0].total, d[0].keywords.length);"
```

Expected: `3 <top UK seed keyword> <total number> <number up to 30>` — 3 entries (one per expanded seed), each with a non-empty `keywords` array.

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-research/02-expansion.mjs docs/seo/data/
git commit -m "Add keyword expansion script and pull related/question/longtail data for Tier 1 + India"
```

---

### Task 5: Longtail-only pass (Tier 2)

**Files:**
- Create: `scripts/seo-research/03-tier2-longtail.mjs`

**Interfaces:**
- Consumes: `seRankingRequest`, `getCreditsRemaining` from `./lib/client.mjs`; `saveJson` from `./lib/fs-helpers.mjs`; `TIER2_REGIONS`, `INTERNATIONAL_SEEDS` from `./lib/config.mjs`; reads `docs/seo/data/<region-code>/keywords-export.json` written by Task 3.
- Produces: `docs/seo/data/<region-code>/longtail.json` for the 5 Tier 2 regions, same shape as Task 4's longtail output (`{ seed, total, keywords }[]`). Same fallback behavior as Task 4's `topSeedKeywords` (observed sparse/no volume data for `nl`, `my`, `ph`).

- [ ] **Step 1: Write `scripts/seo-research/03-tier2-longtail.mjs`**

```javascript
// scripts/seo-research/03-tier2-longtail.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { seRankingRequest, getCreditsRemaining } from "./lib/client.mjs";
import { saveJson } from "./lib/fs-helpers.mjs";
import { TIER2_REGIONS, INTERNATIONAL_SEEDS } from "./lib/config.mjs";

const TOP_N_SEEDS = 2;
const RESULT_LIMIT = 30;
const DATA_ROOT = path.resolve(import.meta.dirname, "../../docs/seo/data");

// Same fallback rationale as Task 4's topSeedKeywords: Task 3's live pull
// showed some regions (e.g. nl, my, ph) have few or zero seeds with tracked
// volume data, but the longtail endpoint can still return real expansion
// keywords for a seed phrase independent of whether SE-Ranking indexed that
// phrase's own volume in this region. Prefer seeds with data, fall back to
// the persona list's own order to avoid leaving a region with zero seeds.
async function topSeedKeywords(regionCode, seedList) {
  const filePath = path.join(DATA_ROOT, regionCode, "keywords-export.json");
  const raw = JSON.parse(await readFile(filePath, "utf8"));
  const withData = raw
    .filter((entry) => entry.is_data_found)
    .sort((a, b) => b.volume - a.volume)
    .map((entry) => entry.keyword);
  const fallback = seedList.filter((keyword) => !withData.includes(keyword));
  return [...withData, ...fallback].slice(0, TOP_N_SEEDS);
}

async function run() {
  const before = await getCreditsRemaining();
  console.log(`Credits before: ${before}`);

  for (const region of TIER2_REGIONS) {
    const seedKeywords = await topSeedKeywords(region.code, INTERNATIONAL_SEEDS);
    console.log(`${region.name}: longtail on ${seedKeywords.join(", ")}`);

    const results = [];
    for (const keyword of seedKeywords) {
      const data = await seRankingRequest("/v1/keywords/longtail", {
        query: { source: region.code, keyword, limit: RESULT_LIMIT },
      });
      results.push({ seed: keyword, ...data });
    }
    const savedTo = await saveJson(`${region.code}/longtail.json`, results);
    console.log(`  saved -> ${savedTo}`);
  }

  const after = await getCreditsRemaining();
  console.log(`Credits after: ${after} (used ${before - after})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it against the live API**

```bash
node --env-file=.env.local scripts/seo-research/03-tier2-longtail.mjs
```

Expected: 5 "saved ->" lines (`sg`, `de`, `nl`, `my`, `ph`), ending with a credits-used line.

- [ ] **Step 3: Spot-check one output file**

```bash
node -e "const d = require('./docs/seo/data/de/longtail.json'); console.log(d.length, d[0].seed, d[0].keywords.length);"
```

Expected: `2 <top DE seed keyword> <number up to 30>`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-research/03-tier2-longtail.mjs docs/seo/data/
git commit -m "Add Tier 2 longtail script and pull data for Singapore, Germany, Netherlands, Malaysia, Philippines"
```

---

### Task 6: Competitor keyword-gap analysis

**Files:**
- Create: `scripts/seo-research/04-competitor-gap.mjs`

**Interfaces:**
- Consumes: `seRankingRequest`, `getCreditsRemaining` from `./lib/client.mjs`; `saveJson` from `./lib/fs-helpers.mjs`; `INDIA_REGION`, `TIER1_REGIONS`, `INDIA_COMPETITORS`, `INTERNATIONAL_COMPETITORS`, `OUR_DOMAIN` from `./lib/config.mjs`.
- Produces: `docs/seo/data/<region-code>/gap-<competitor-domain>.json` — one file per (Tier 1 region × international competitor) pair (5 × 4 = 20 files) and one per (India × India competitor) pair (2 files), 22 files total. Each file is `{ oursNotTheirs, theirsNotOurs }`, where each side is the raw SE-Ranking comparison response (keyword, volume, both domains' positions, landing URLs).

- [ ] **Step 1: Write `scripts/seo-research/04-competitor-gap.mjs`**

```javascript
// scripts/seo-research/04-competitor-gap.mjs
import { existsSync } from "node:fs";
import path from "node:path";
import { seRankingRequest, getCreditsRemaining } from "./lib/client.mjs";
import { saveJson } from "./lib/fs-helpers.mjs";
import {
  INDIA_REGION,
  TIER1_REGIONS,
  INDIA_COMPETITORS,
  INTERNATIONAL_COMPETITORS,
  OUR_DOMAIN,
} from "./lib/config.mjs";

const DATA_ROOT = path.resolve(import.meta.dirname, "../../docs/seo/data");

// Resumable: an earlier run may have already pulled some region/competitor
// pairs (e.g. the user stopped it partway through to conserve API credits).
// Skip any pair whose output file already exists on disk instead of
// re-fetching and re-spending credits on data we already have.
function alreadyHave(regionCode, competitor) {
  return existsSync(path.join(DATA_ROOT, regionCode, `gap-${competitor}.json`));
}

async function fetchGapBothDirections(region, competitor) {
  const oursNotTheirs = await seRankingRequest("/v1/domain/keywords/comparison", {
    query: { source: region.code, domain: OUR_DOMAIN, compare: competitor, diff: 1 },
  });
  const theirsNotOurs = await seRankingRequest("/v1/domain/keywords/comparison", {
    query: { source: region.code, domain: competitor, compare: OUR_DOMAIN, diff: 1 },
  });
  return { oursNotTheirs, theirsNotOurs };
}

async function run() {
  const before = await getCreditsRemaining();
  console.log(`Credits before: ${before}`);

  for (const competitor of INTERNATIONAL_COMPETITORS) {
    for (const region of TIER1_REGIONS) {
      if (alreadyHave(region.code, competitor)) {
        console.log(`${region.name} vs ${competitor}: already have data, skipping`);
        continue;
      }
      console.log(`${region.name} vs ${competitor}...`);
      const data = await fetchGapBothDirections(region, competitor);
      const savedTo = await saveJson(`${region.code}/gap-${competitor}.json`, data);
      console.log(`  saved -> ${savedTo}`);
    }
  }

  for (const competitor of INDIA_COMPETITORS) {
    if (alreadyHave(INDIA_REGION.code, competitor)) {
      console.log(`India vs ${competitor}: already have data, skipping`);
      continue;
    }
    console.log(`India vs ${competitor}...`);
    const data = await fetchGapBothDirections(INDIA_REGION, competitor);
    const savedTo = await saveJson(`in/gap-${competitor}.json`, data);
    console.log(`  saved -> ${savedTo}`);
  }

  const after = await getCreditsRemaining();
  console.log(`Credits after: ${after} (used ${before - after})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it against the live API**

```bash
node --env-file=.env.local scripts/seo-research/04-competitor-gap.mjs
```

Expected: a "skipping" line for each of the 9 pairs already pulled in the first pass, then "saved ->" lines for the remaining 13 pairs, ending with a credits-used line around 2,600 credits (13 pairs × 2 directions × 100 credits) rather than the original 4,400 estimate, since the 9 already-done pairs cost nothing to skip.

- [ ] **Step 3: Spot-check one output file**

```bash
node -e "const d = require('./docs/seo/data/uk/gap-saatchiart.com.json'); console.log(Object.keys(d), Array.isArray(d.oursNotTheirs));"
```

Expected: `[ 'oursNotTheirs', 'theirsNotOurs' ] true` (or the comparison endpoint's actual top-level shape — confirm it's a non-empty object with both keys present, not an error payload).

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-research/04-competitor-gap.mjs docs/seo/data/
git commit -m "Add competitor keyword-gap script and pull Tier 1 + India gap data"
```

---

### Task 7: Homepage technical/on-page audit

**Files:**
- Create: `scripts/seo-research/05-site-audit.mjs`

**Interfaces:**
- Consumes: `seRankingRequest`, `getCreditsRemaining` from `./lib/client.mjs`; `saveJson` from `./lib/fs-helpers.mjs`; `OUR_DOMAIN` from `./lib/config.mjs`.
- Produces: `docs/seo/data/site-audit/report.json` (`{ score_percent, total_errors, total_warnings, total_notices, ...categorized issues }`) and `docs/seo/data/site-audit/pages.json` (crawled page inventory). Task 8 reads both.

- [ ] **Step 1: Write `scripts/seo-research/05-site-audit.mjs`**

```javascript
// scripts/seo-research/05-site-audit.mjs
import { seRankingRequest, getCreditsRemaining } from "./lib/client.mjs";
import { saveJson } from "./lib/fs-helpers.mjs";
import { OUR_DOMAIN } from "./lib/config.mjs";

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 60; // up to 5 minutes

async function waitForCompletion(auditId) {
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    const status = await seRankingRequest("/v1/site-audit/audits/status", {
      query: { audit_id: auditId },
    });
    console.log(`  status: ${status.status} (${status.total_pages ?? 0} pages so far)`);
    if (status.status === "finished") return status;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Audit ${auditId} did not finish within ${MAX_POLLS} polls`);
}

async function run() {
  const before = await getCreditsRemaining();
  console.log(`Credits before: ${before}`);

  console.log(`Launching standard audit for ${OUR_DOMAIN}...`);
  const launch = await seRankingRequest("/v1/site-audit/audits/standard", {
    method: "POST",
    body: {
      domain: OUR_DOMAIN,
      title: "Artace Studio homepage SEO research - 2026-07-21",
    },
  });
  const auditId = launch.id;
  console.log(`Audit id: ${auditId}`);

  await waitForCompletion(auditId);

  const report = await seRankingRequest("/v1/site-audit/audits/report", {
    query: { audit_id: auditId },
  });
  const pages = await seRankingRequest("/v1/site-audit/audits/pages", {
    query: { audit_id: auditId, limit: 250 },
  });

  await saveJson("site-audit/report.json", report);
  await saveJson("site-audit/pages.json", pages);
  console.log("Saved site-audit/report.json and site-audit/pages.json");

  const after = await getCreditsRemaining();
  console.log(`Credits after: ${after} (used ${before - after})`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it against the live API**

```bash
node --env-file=.env.local scripts/seo-research/05-site-audit.mjs
```

Expected: `status: queued`/`status: processing` lines repeating every 5 seconds, then `status: finished`, then `Saved site-audit/report.json and site-audit/pages.json`, then a credits-used line. If it throws "did not finish within 60 polls", re-run just the polling by re-running this script (the audit ID isn't persisted between runs in this simple version — acceptable for a one-off research pull; if it happens, increase `MAX_POLLS` and re-run rather than re-launching a new audit).

- [ ] **Step 3: Spot-check the report**

```bash
node -e "const d = require('./docs/seo/data/site-audit/report.json'); console.log(d.score_percent, d.total_errors, d.total_warnings, d.total_notices);"
```

Expected: four numbers (a score 0–100 and three issue counts), not `undefined`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-research/05-site-audit.mjs docs/seo/data/
git commit -m "Add site audit script and pull fresh technical/on-page audit data"
```

---

### Task 8: Synthesize the keyword research & audit report

**Files:**
- Create: `docs/seo/2026-07-21-international-keyword-research.md`
- Read (not modified): every file under `docs/seo/data/`, plus `SEO-audit.txt` and `Artace Studio Homepage research.md` for cross-reference.

**Interfaces:**
- Consumes: all JSON produced by Tasks 3–7.
- Produces: the final markdown deliverable described in the design spec (`docs/superpowers/specs/2026-07-21-international-seo-keyword-research-design.md`), read directly by whoever does the regional-architecture and homepage-rebuild work next.

This task has no code to write — it's a data-synthesis and writing task. Follow these mechanical steps exactly (the specific keyword numbers can't be written in this plan since they don't exist until Tasks 3–7 have run against the live API):

- [ ] **Step 1: Build the executive summary**

Read `docs/seo/data/in/keywords-export.json` and each international region's `keywords-export.json`. Identify: (a) the single highest-volume keyword found in the India track, (b) the single highest-volume keyword found across all 10 international regions combined, (c) how many of the 22 competitor keyword-gap files (Task 6) contain at least one `theirsNotOurs` entry with `position <= 10` (a competitor ranking well where we don't). Write a 4-6 sentence executive summary covering these three points plus the site-audit `score_percent` from `docs/seo/data/site-audit/report.json`.

- [ ] **Step 2: Build the per-region keyword tables**

For each of the 11 regions, read `docs/seo/data/<region>/keywords-export.json`, sort descending by `volume`, and render a markdown table with columns `Keyword | Volume | Difficulty | CPC | Intent` for all 10 entries. For India + the 5 Tier 1 regions, append additional rows sourced from that region's `related.json`, `questions.json`, and `longtail.json` (Task 4) — for each file, take the top 10 keywords by volume across all its `keywords` arrays combined, tag each with a `Source` column value of `Related`, `Question`, or `Longtail`. For the 5 Tier 2 regions, append only the top 10 entries from `longtail.json` (Task 5), same `Source` tagging. Group all tables under one `## Keyword Data by Region` heading with `### <Region Name>` subheadings, India first, then Tier 1 alphabetically, then Tier 2 alphabetically.

- [ ] **Step 3: Build the competitor gap section**

For each of the 22 files under `docs/seo/data/*/gap-*.json` (Task 6), read the `theirsNotOurs` array. For each keyword entry where the competitor's position is ≤ 20, classify it as a **quick win** if `difficulty <= 40`, otherwise a **long-term target**. Render one table per region under a `## Competitor Keyword Gaps` heading, columns `Keyword | Competitor | Their Position | Volume | Difficulty | Classification`, sorted by volume descending, capped at the top 15 rows per region.

- [ ] **Step 4: Build the refreshed homepage audit section**

Read `docs/seo/data/site-audit/report.json` and `docs/seo/data/site-audit/pages.json`. Read the existing `SEO-audit.txt` at the repo root. Under a `## Refreshed Homepage Audit` heading, write three subsections: `### Resolved since last audit` (issues listed in `SEO-audit.txt` that no longer appear in the new report), `### Still open` (issues present in both), `### New findings` (issues in the new report not mentioned in `SEO-audit.txt`). Reference specific issue codes/categories and affected URLs from `report.json`/`pages.json`, not paraphrased summaries.

- [ ] **Step 5: Build the prioritized recommendations**

Under a `## Prioritized Recommendations` heading, list 8-12 recommendations drawn from Steps 1-4 above, each tagged `[Regional Architecture]` or `[Homepage Rebuild]` depending on which upcoming sub-project it feeds (per the design spec's stated purpose), ordered by estimated impact (highest search volume / highest competitor-gap volume first).

- [ ] **Step 6: Assemble and save the report**

Combine Steps 1-5 into `docs/seo/2026-07-21-international-keyword-research.md` in this section order: Executive Summary, Keyword Data by Region, Competitor Keyword Gaps, Refreshed Homepage Audit, Prioritized Recommendations. Confirm every section from the design spec's "Deliverable" list is present.

- [ ] **Step 7: Commit**

```bash
git add docs/seo/2026-07-21-international-keyword-research.md
git commit -m "Synthesize international keyword research and homepage audit report"
```

---

## Self-Review Notes

- **Spec coverage:** Task 1 covers credential handling; Task 2 covers the two keyword tracks + region tiering + competitor sets; Task 3 covers bulk export for all 11 regions; Tasks 4-5 cover the Tier 1/Tier 2 depth split; Task 6 covers both competitor gap sets; Task 7 covers the technical audit; Task 8 covers every item in the spec's Deliverable section (executive summary, per-region tables, gap findings, refreshed audit diffed against `SEO-audit.txt`, tagged recommendations).
- **Type/interface consistency:** `seRankingRequest`, `getCreditsRemaining`, and `saveJson` are defined once in Task 1 and imported with identical names/signatures in every later task. Config constant names (`INDIA_REGION`, `TIER1_REGIONS`, `TIER2_REGIONS`, `INDIA_SEEDS`, `INTERNATIONAL_SEEDS`, `INDIA_COMPETITORS`, `INTERNATIONAL_COMPETITORS`, `OUR_DOMAIN`) defined once in Task 2 and used identically in Tasks 3, 4, 5, 6, 7.
- **No placeholders:** every code step above is complete, runnable code; Task 8's steps are necessarily data-dependent (the report's content doesn't exist until Tasks 3-7 run against the live API) but each step gives an exact, mechanical procedure rather than a vague instruction.
