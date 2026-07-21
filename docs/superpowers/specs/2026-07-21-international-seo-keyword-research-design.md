# International SEO Keyword Research & Homepage Audit — Design

## Problem

Artace Studio currently targets India only, and its SEO (keywords, `SEO-audit.txt`, homepage copy) reflects that: Vastu, Radha Krishna, Pune-local intent. The business is expanding to target buyers in UAE, Singapore, New Zealand, Australia, UK, Malaysia, Philippines, Ireland, Germany, and Netherlands — with a different buyer persona (art collectors/enthusiasts) than the India persona (middle-class, home-decor, Vastu, affordable art). Before any homepage copy or architecture decisions are made, we need real keyword-volume/difficulty/intent data for both personas across these regions, plus a refreshed technical/on-page audit of the current homepage, using the SE-Ranking API (trial key, 100,000 credits, expires 2026-08-04).

This is upstream of two other sub-projects (regional content architecture, homepage rebuild) — its output is a reference document they'll both draw from, not a code change itself.

## Scope: two keyword tracks, tiered by region

**India track** (single region, `source=in`): middle-class, Vastu, affordable home-decor intent. Extends the seed list already identified in `SEO-audit.txt` (e.g. *vastu paintings for home, affordable canvas paintings online india, wall art for living room india, pooja room paintings, ganesha canvas painting, budget wall art india, housewarming gift painting india*) rather than replacing it.

**International track** (10 regions): collector/art-enthusiast intent, one seed list reused across all 10 regions with locale spelling variants (e.g. "personalise" for UK/AU/NZ/IE/SG/MY/PH). Seed examples: *buy original paintings online, custom canvas painting commission, bespoke wall art commission, original abstract art for sale, commission a painting online, contemporary Indian art for sale, custom portrait painting commission, investment art original paintings, handcrafted canvas art, art collector gift original painting.*

**Region tiering** (confirmed with user):
- **Tier 1 — full depth**: UK (`uk`), Australia (`au`), UAE (`ae`), Ireland (`ie`), New Zealand (`nz`). Bulk keyword metrics + related keywords + question keywords + longtail keywords + competitor keyword-gap analysis.
- **Tier 2 — lighter pass**: Singapore (`sg`), Germany (`de`), Netherlands (`nl`), Malaysia (`my`), Philippines (`ph`). Bulk keyword metrics + longtail keywords only (no related/questions/gap, to keep call count and runtime down for secondary markets).

**Competitor keyword-gap analysis:**
- International Tier 1 regions: `artacestudio.com` vs. Saatchi Art, Singulart, Artfinder, UGallery (global online art marketplaces — the sites Artace actually competes with in these SERPs, distinct from the India-only competitors already in the existing research doc).
- India: `artacestudio.com` vs. Fizdi and Sajaao (the real India competitors named in the existing research doc).

## Execution approach

A one-off Node script (`scripts/seo-research/fetch-seranking-data.mjs`, not part of the app build — a data-pull utility) using native `fetch`, run manually via `node`. Not added to `package.json` scripts since it's a single-use research tool, not an app feature.

**Endpoints used** (base `https://api.seranking.com`, header `Authorization: Token <key>`):
- `POST /v1/keywords/export?source=<region>` — bulk volume/CPC/difficulty/intent for each seed list, one call per region (11 calls total: 1 India + 10 international).
- `GET /v1/keywords/related`, `GET /v1/keywords/questions`, `GET /v1/keywords/longtail` — Tier 1 regions + India only, run against 2–3 top-performing seed keywords per region (identified from the bulk export step) to discover expansion opportunities.
- `GET /v1/keywords/export` longtail-only pass for Tier 2 regions.
- `GET /v1/domain/keywords/comparison?diff=1` — gap analysis, run both directions (Artace-ranks-not-competitor and competitor-ranks-not-Artace) for each competitor pair per region.
- `POST /v1/site-audit/audits/standard` against `artacestudio.com`, then poll `GET /v1/site-audit/audits/status`, then `GET /v1/site-audit/audits/report` and `GET /v1/site-audit/audits/pages` once finished. Crawl is not artificially restricted to the homepage URL (the API audits a domain), but the write-up prioritizes homepage-relevant findings, with site-wide issues noted as supporting context.

Estimated ~90 HTTP calls, ~13,000 of the 100,000 available credits. The trial key is rate-limited to 1 request/second, so the script paces requests with a fixed delay rather than firing concurrently, and retries once on HTTP 429.

**Credential handling:** `SE_RANKING_API_KEY` added to `artace-studio/.env.local` (already gitignored via `.env*` in `.gitignore`) and to `.env.example` as a blank placeholder. The script reads it from `process.env`; the key is never hardcoded in the script, logged to stdout in full, or written into the markdown report.

**Raw data retention:** each endpoint's raw JSON response is saved under `docs/seo/data/<region>/<endpoint>.json` and committed to the repo — this is non-sensitive research data, not a credential, so it survives after the trial key expires and doesn't need to be re-fetched to answer follow-up questions later.

## Deliverable

`docs/seo/2026-07-21-international-keyword-research.md`:
1. Executive summary — headline opportunities and risks per persona.
2. Per-region keyword tables (India full-depth; Tier 1 full-depth; Tier 2 lighter), each row: keyword, volume, difficulty, CPC, intent.
3. Competitor keyword-gap findings, grouped by region, called out as "quick win" (Artace could plausibly rank, competitor already does) vs. "long-term" (high difficulty).
4. Refreshed homepage technical/on-page audit — explicitly diffed against the existing `SEO-audit.txt` findings (what's fixed, what's still open, what's new).
5. Prioritized recommendations, tagged for which downstream sub-project they feed: regional-architecture decisions vs. homepage-copy/structure decisions.

## Out of scope

- Any homepage code or copy changes — this is a research/reporting task only.
- The regional-architecture decision itself (single homepage vs. geo/locale variants) — this document informs that decision but doesn't make it.
- Backlink analysis, AI-search/brand-visibility tracking, or rank tracking setup — not requested, and would consume disproportionate credit budget for a homepage-focused pass.
- Auditing competitor sites' technical SEO (only their keyword rankings, via the gap-analysis endpoint) — full competitor site audits aren't needed for this deliverable.
