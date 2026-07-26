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
