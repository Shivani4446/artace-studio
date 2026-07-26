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
