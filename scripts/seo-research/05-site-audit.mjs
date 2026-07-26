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
