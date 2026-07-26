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
