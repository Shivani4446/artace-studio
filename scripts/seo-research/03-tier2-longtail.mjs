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
