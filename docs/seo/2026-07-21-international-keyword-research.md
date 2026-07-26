# International Keyword Research & Homepage Audit — 2026-07-21

**Status: Complete.** This report now reflects the full originally-scoped research plan: primary, related, question, and long-tail keyword data across all 11 regions; all 22 planned competitor-gap comparisons (region × competitor); and a freshly run technical/on-page site audit (crawled 2026-07-22). The two pieces that were missing in the prior partial pass — 13 of 22 competitor-gap comparisons, and a fresh site audit — have both since been completed and are fully incorporated below. Nothing in this report is a placeholder or a stand-in for missing data anymore.

## Executive Summary

The single highest-volume keyword found in the India track's primary seed-keyword list is **"ganesha canvas painting"** at 2,900 monthly searches (difficulty 79, informational intent) — a validated, high-demand niche that corroborates the existing homepage audit's own top content recommendation around Ganesha-themed paintings. (Related-keyword data pushes far higher still — see "Keyword Data by Region" and Recommendation 3 below.) Across the 10 international regions' primary seed-keyword lists, the highest-volume keyword found is **"original abstract art for sale"** in the United Kingdom at 110 monthly searches (difficulty 16, $0.56 CPC) — modest in absolute terms, but the UK's supporting Related-keyword data is by far the richest of any Tier 1 region (e.g., "art" at 60,500/mo), making it the strongest candidate lead market among the six regions with full expansion data.

Competitor keyword-gap analysis is now **complete**: all 22 originally planned region/competitor comparisons exist on disk (five Tier 1 regions × Saatchi Art, Singulart, Artfinder, and uGallery; India × Fizdi and Sajaao). Completing the 13 comparisons that were missing before surfaced one genuinely new, high-value finding: India vs. Fizdi's **"शंकर महाराज"** (Shankar Maharaj, a widely revered Hindu/Marathi devotional figure) at 500 monthly searches and difficulty 7 — the single highest-volume keyword found anywhere in the entire 22-file competitor-gap dataset (difficulty 7 is a genuine quick win, though not the single lowest difficulty in the dataset — a handful of other entries score difficulty 4-6), sitting inside a broader Maharashtra-specific devotional cluster (also "vitthal rakhumai painting" at 320/mo, difficulty 10, and "जाणता राजा फोटो" at 140/mo, difficulty 11, both from the India comparisons) that lines up squarely with Artace Studio's existing devotional-painting catalog (it already sells Ganesha, Radha Krishna, and Buddha canvases). Most of the other 12 newly completed files, like the original 9, surfaced mostly proper-noun/artist-name clutter with limited direct commercial value — see the "Competitor Keyword Gaps" section for the full breakdown.

A fresh technical/on-page site audit was also run this pass (SE-Ranking site-audit crawl, 2026-07-22), crawling 154 pages of artacestudio.com and scoring the site **75%** overall (306 errors, 109 warnings, 192 notices). It resolved several of the prior (2026-04-16) audit's top complaints — meta descriptions and a real blog now exist, and product-page content now averages ~1,295 words, well past "thin" — while surfacing a large, newly-quantified sitemap-hygiene problem (67 noindex'd URLs and 56 non-canonical URLs sitting inside the XML sitemap) and a 66-page cluster of 503/500 errors during the crawl. On that last point specifically: live spot-checking after the crawl found 7 of 8 sampled URLs from that cluster now return a normal 200 OK, so the great majority of it looks like a transient, crawler-triggered rate-limit/bot-protection event rather than lasting breakage — **except** for one URL, `https://artacestudio.com/collections/mahadev-nandi-canvas-painting-shiva-devotional-wall-art`, which is confirmed live as a genuine, currently-broken 404 and needs a real fix, independent of the transient-majority story. Full detail in "Homepage Audit" below.

The SE-Ranking data-scarcity findings noted per-region in "Keyword Data by Region" below (UAE, Malaysia, Netherlands, and the Philippines returning zero or near-zero results across all seed/expansion sources for this niche persona) remain genuine, confirmed characteristics of that data source's coverage — not gaps in what was researched — and are unchanged from before.

## Keyword Data by Region

Data sources per region: all 11 regions have a `keywords-export.json` of primary tracked seed keywords (10 entries each, sorted below by volume descending; "No data" means SE-Ranking's bulk endpoint returned `is_data_found: false` for that keyword). India plus the five Tier 1 regions (Australia, Ireland, New Zealand, United Arab Emirates, United Kingdom) additionally have `related.json`, `questions.json`, and `longtail.json` from the deeper expansion pass — for each of those three files, the top 10 keywords by volume (across all seed groups in that file) are appended below the primary list and tagged in the `Source` column. The five Tier 2 regions (Germany, Malaysia, Netherlands, Philippines, Singapore) only have `longtail.json`, so only that source is appended. Longtail suggestions are returned by SE-Ranking as bare keyword strings with no volume/difficulty/CPC/intent attached (marked `n/a*` below) — this is a real API response-shape difference from `related.json`/`questions.json`, not missing data on our end.

### India

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| ganesha canvas painting | 2900 | 79 | $0.01 | Informational | Seed |
| canvas painting for bedroom | 390 | 11 | $0.01 | Informational | Seed |
| pooja room paintings | 210 | 9 | $0 | Informational/Navigational | Seed |
| vastu paintings for home | 170 | 7 | $0.01 | Commercial | Seed |
| wall art for living room india | 30 | 19 | $0.07 | Commercial | Seed |
| home decor paintings online | 20 | 28 | $0.08 | Commercial | Seed |
| radha krishna painting for home | No data | No data | No data | No data | Seed |
| housewarming gift painting india | No data | No data | No data | No data | Seed |
| budget wall art india | No data | No data | No data | No data | Seed |
| affordable canvas paintings online india | No data | No data | No data | No data | Seed |
| wall painting | 110000 | 88 | $0.01 | Informational | Related |
| canvas painting | 90500 | 90 | $0.01 | Informational | Related |
| paintings | 40500 | 87 | $0.15 | Informational | Related |
| art on wall | 22200 | 80 | $0.03 | Local/Commercial | Related |
| canvas painting ideas | 18100 | 92 | $0.05 | Informational | Related |
| canvas paintings | 18100 | 88 | $0.01 | Informational | Related |
| ganesha painting | 9900 | 85 | $0.01 | Commercial | Related |
| artwork | 8000 | 82 | $0.12 | Informational | Related |
| wall painting for bedroom | 6600 | 74 | $0.02 | Informational | Related |
| art painting | 6600 | 76 | $0.08 | Informational | Related |
| how to paint ganesha on a canvas | 10 | 12 | $0 | Informational | Question |
| acrylic canvas ganesha painting | n/a* | n/a* | n/a* | n/a* | Longtail |
| ganesha canvas paintings | n/a* | n/a* | n/a* | n/a* | Longtail |
| canvas paintings for bedroom | n/a* | n/a* | n/a* | n/a* | Longtail |
| glass painting designs for pooja room door | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

### Australia

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | 20 | 24 | $0.34 | Local/Transactional | Seed |
| contemporary indian art for sale | 10 | 24 | $0 | Local/Transactional | Seed |
| commission a painting online | 10 | 28 | $0 | Informational | Seed |
| buy original paintings online | 10 | 42 | $0 | Informational/Navigational | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |
| abstract art | 6600 | 78 | $0.49 | Informational | Related |
| abstract painting | 1600 | 81 | $0.47 | Informational | Related |
| printable abstract art | 880 | 23 | $0.37 | Informational | Related |
| abstract wall art | 610 | 11 | $0.39 | Informational | Related |
| abstract artists | 590 | 37 | $0.47 | Informational | Related |
| abstract landscape art | 590 | 7 | $0.37 | Informational | Related |
| abstract art portraits | 590 | 16 | $0 | Informational | Related |
| abstract art landscape paintings | 590 | 8 | $0.37 | Informational | Related |
| landscape art abstract | 590 | 8 | $0.37 | Informational | Related |
| landscape abstract art paintings | 590 | 8 | $0.37 | Informational | Related |
| where can i commission a painting online | 0 | 0 | $0 | — | Question |
| extra large original abstract art for sale | n/a* | n/a* | n/a* | n/a* | Longtail |
| large original abstract art for sale cheap | n/a* | n/a* | n/a* | n/a* | Longtail |
| large original abstract art for sale ebay | n/a* | n/a* | n/a* | n/a* | Longtail |
| large original abstract art for sale near me | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale australia | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale near me | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale online australia | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale online cheap | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale online near me | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale uk cheap | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

### Ireland

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | 10 | 24 | $0 | Local/Transactional | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |
| art | 6600 | 62 | $0.34 | Local/Commercial | Related |
| gallery dublin | 3100 | 73 | $0.28 | Local/Commercial | Related |
| wall art | 1900 | 54 | $0.36 | Local/Commercial | Related |
| art gallery | 1600 | 68 | $0.5 | Local/Commercial | Related |
| paintings | 1600 | 63 | $0.68 | Informational | Related |
| irish artist | 810 | 27 | $0.22 | Informational | Related |
| wall prints | 590 | 18 | $0.39 | Local/Commercial | Related |
| arts prints | 590 | 26 | $0.39 | Local/Commercial | Related |
| irish prints | 590 | 24 | $0.27 | Local/Commercial | Related |
| irish print | 590 | 23 | $0.27 | Local/Commercial | Related |
| buy original oil paintings online | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

> No **question keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords).

### New Zealand

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | 10 | 16 | $0 | Local/Transactional | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |
| artist nz | 2400 | 46 | $0.14 | Informational | Related |
| art nz | 990 | 42 | $0.22 | Informational | Related |
| abstract paintings | 480 | 44 | $0.26 | Informational | Related |
| abstract design | 480 | 8 | $0 | Local/Navigational | Related |
| abstract art paintings | 480 | 43 | $0.26 | Informational | Related |
| nz art sale | 480 | 26 | $0.17 | Local/Transactional | Related |
| abstract painting | 480 | 47 | $0.26 | Informational | Related |
| new zealand art for sale | 480 | 24 | $0.17 | Local/Transactional | Related |
| nz art for sale | 480 | 26 | $0.17 | Local/Transactional | Related |
| art for sale nz | 480 | 29 | $0.17 | Local/Transactional | Related |
| original abstract art for sale near me | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale nz | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art paintings for sale | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original oil paintings online | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

> No **question keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords).

### United Arab Emirates

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | No data | No data | No data | No data | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |

> No **related keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords).
> No **question keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords).
> No **long-tail keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords).
>
> This is confirmed genuine SE-Ranking data scarcity for this niche persona in this region (every one of the 10 tracked seed keywords came back `is_data_found: false`, and all three expansion files returned zero results across every seed) — it is not a bug in Tasks 3-5.

### United Kingdom

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | 110 | 16 | $0.56 | Local/Transactional | Seed |
| buy original paintings online | 20 | 43 | $0.85 | Informational | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |
| art | 60500 | 83 | $0.47 | Local/Commercial | Related |
| paintings | 14800 | 88 | $0.65 | Local/Commercial | Related |
| artwork | 12100 | 78 | $0.38 | Informational | Related |
| abstract art | 9900 | 59 | $0.38 | Informational | Related |
| art work | 5400 | 60 | $0.35 | Informational | Related |
| abstract wall art | 2900 | 57 | $0.26 | Informational | Related |
| abstract painting | 2900 | 64 | $0.38 | Informational | Related |
| art price | 2900 | 69 | $0.34 | Informational/Navigational | Related |
| art prints uk | 2900 | 55 | $0.38 | Informational | Related |
| art with pictures | 2400 | 67 | $0.34 | Informational | Related |
| abstract art original paintings for sale | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale toronto | n/a* | n/a* | n/a* | n/a* | Longtail |
| original paintings for sale abstract art | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy affordable original paintings of animals online | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original abstract paintings online | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original indian paintings online | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original oil painting online | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original painting online | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original painting online buy | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original painting online editing | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

> No **question keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords).

### Germany

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | 10 | 26 | $0 | Informational | Seed |
| contemporary indian art for sale | 10 | 21 | $0 | Transactional | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |

> No **long-tail keyword** data was returned by SE-Ranking for this region/persona (0 results across all seed keywords) — confirmed genuine data scarcity, not a bug.

### Malaysia

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | No data | No data | No data | No data | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |

> All 10 tracked seed keywords came back `is_data_found: false`, and long-tail data was also empty (0 results across all seed keywords) — confirmed genuine data scarcity for this niche persona in this region, not a bug.

### Netherlands

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | No data | No data | No data | No data | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |

> All 10 tracked seed keywords came back `is_data_found: false`, and long-tail data was also empty (0 results across all seed keywords) — confirmed genuine data scarcity, not a bug.

### Philippines

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | No data | No data | No data | No data | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| buy original paintings online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |
| buy original painting online | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

> 10 of 10 tracked seed keywords came back `is_data_found: false`; only 1 long-tail suggestion was returned across all seed keywords.

### Singapore

| Keyword | Volume | Difficulty | CPC | Intent | Source |
|---|---|---|---|---|---|
| original abstract art for sale | 10 | 26 | $0 | Local/Transactional | Seed |
| buy original paintings online | 10 | 62 | $0 | Informational | Seed |
| investment art original paintings | No data | No data | No data | No data | Seed |
| handcrafted canvas art | No data | No data | No data | No data | Seed |
| custom portrait painting commission | No data | No data | No data | No data | Seed |
| custom canvas painting commission | No data | No data | No data | No data | Seed |
| contemporary indian art for sale | No data | No data | No data | No data | Seed |
| commission a painting online | No data | No data | No data | No data | Seed |
| bespoke wall art commission | No data | No data | No data | No data | Seed |
| art collector gift original painting | No data | No data | No data | No data | Seed |
| abstract art original paintings for sale | n/a* | n/a* | n/a* | n/a* | Longtail |
| original abstract art for sale online | n/a* | n/a* | n/a* | n/a* | Longtail |
| buy original oil paintings online | n/a* | n/a* | n/a* | n/a* | Longtail |

*"n/a\*" = long-tail suggestion returned as a bare keyword string by SE-Ranking, with no volume/difficulty/CPC/intent metrics attached.*

## Competitor Keyword Gaps

All 22 originally planned region/competitor comparisons now exist on disk (`docs/seo/data/<region>/gap-<competitor>.json`, `theirsNotOurs` array): the five Tier 1 international regions (Australia, Ireland, New Zealand, United Arab Emirates, United Kingdom) each against Saatchi Art, Singulart, Artfinder, and uGallery (20 files), plus India against Fizdi and Sajaao (2 files). Across all 22 files there are 220 `theirsNotOurs` entries in total, of which 92 have the competitor ranking in a top-20 SERP position. Same methodology as before: for each file, entries where the competitor's SERP position is ≤20 were classified as a **quick win** (difficulty ≤40) or a **long-term target** (difficulty >40); each table below shows the top 15 by volume among that eligible set.

**A note on data quality:** across all 22 files, the majority of `theirsNotOurs` entries are still proper nouns — artist names, gallery names, and foreign-language personal names/queries (e.g., "李放", "óscar pulido", "zwickers gallery halifax", "yelena sidorova") — with volume 10-30 and limited direct commercial applicability to Artace Studio. This pattern held just as strongly across the 13 newly completed files as it did in the original 9; the Artfinder and uGallery comparisons in particular skew toward artist/gallery-name clutter clustered near the alphabetic tail of each competitor's ranked keyword set. The clear exception is the two India comparisons (Fizdi, Sajaao): those surfaced a genuine, materially higher-volume devotional-content keyword cluster (500, 320, and 140/mo, versus the 10-30/mo typical of the proper-noun clutter elsewhere) — see the India tables and "Prioritized Recommendations" below. The Ireland/Saatchi Art and UAE/Singulart topical clusters flagged in the original 9 files ("yves klein blue", the Arabic Picasso queries) remain genuine and are carried forward unchanged.

### Australia vs. Saatchi Art (saatchiart.com)

10 keywords found where Saatchi Art ranks and Artace Studio does not; 8 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| şahmeran | Saatchi Art (saatchiart.com) | 4 | 30 | 19 | Quick win |
| zorn palette paintings | Saatchi Art (saatchiart.com) | 9 | 30 | 19 | Quick win |
| 李放 | Saatchi Art (saatchiart.com) | 1 | 10 | 10 | Quick win |
| 李 放 | Saatchi Art (saatchiart.com) | 1 | 10 | 10 | Quick win |
| موقع الفن | Saatchi Art (saatchiart.com) | 14 | 10 | 50 | Long-term target |
| сountry | Saatchi Art (saatchiart.com) | 14 | 10 | 10 | Quick win |
| сhanel | Saatchi Art (saatchiart.com) | 13 | 10 | 44 | Long-term target |
| zulu tribal art | Saatchi Art (saatchiart.com) | 1 | 10 | 18 | Quick win |

### Australia vs. Singulart (singulart.com)

10 keywords found where Singulart ranks and Artace Studio does not; 4 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| zurier | Singulart (singulart.com) | 16 | 10 | 10 | Quick win |
| zuccolo | Singulart (singulart.com) | 19 | 10 | 8 | Quick win |
| zoey frank artist | Singulart (singulart.com) | 10 | 10 | 10 | Quick win |
| zio ziegler art for sale | Singulart (singulart.com) | 16 | 10 | 12 | Quick win |

### Australia vs. Artfinder (artfinder.com)

10 keywords found where Artfinder ranks and Artace Studio does not; 2 of those have the competitor in a top-20 position. Like most of the newly completed files, this pair is dominated by proper-noun/alphabet-tail clutter — nothing further to call out.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| zen pictures for bedroom | Artfinder (artfinder.com) | 6 | 10 | 9 | Quick win |
| zebra with glasses | Artfinder (artfinder.com) | 12 | 10 | 10 | Quick win |

### Australia vs. uGallery (ugallery.com)

10 keywords found where uGallery ranks and Artace Studio does not; 2 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| wild west art | uGallery (ugallery.com) | 20 | 30 | 14 | Quick win |
| world oil painting | uGallery (ugallery.com) | 10 | 10 | 44 | Long-term target |

### Ireland vs. Saatchi Art (saatchiart.com)

10 keywords found where Saatchi Art ranks and Artace Studio does not; 7 of those have the competitor in a top-20 position. This pair produced the highest-volume competitor-gap keyword found among the five Tier 1 international regions: "yves klein" (210, but difficulty 57 — a long-term target) and "yves klein blue" (170, difficulty 36 — a genuine quick win, and a real art-history content topic rather than a proper-noun/artist-profile query). (The India comparisons below now surface higher-volume keywords still — see "Prioritized Recommendations".)

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| yves klein | Saatchi Art (saatchiart.com) | 19 | 210 | 57 | Long-term target |
| yves klein blue | Saatchi Art (saatchiart.com) | 17 | 170 | 36 | Quick win |
| yoko akino artist | Saatchi Art (saatchiart.com) | 6 | 20 | 8 | Quick win |
| 李放 | Saatchi Art (saatchiart.com) | 5 | 10 | 10 | Quick win |
| yin yang art | Saatchi Art (saatchiart.com) | 5 | 10 | 11 | Quick win |
| yellow abstract art | Saatchi Art (saatchiart.com) | 8 | 10 | 22 | Quick win |
| xxxxii | Saatchi Art (saatchiart.com) | 7 | 10 | 14 | Quick win |

### Ireland vs. Singulart (singulart.com)

10 keywords found where Singulart ranks and Artace Studio does not; 3 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| yoko ono cut piece | Singulart (singulart.com) | 13 | 40 | 26 | Quick win |
| zentrum paul klee | Singulart (singulart.com) | 6 | 10 | 38 | Quick win |
| youth culture history | Singulart (singulart.com) | 13 | 10 | 18 | Quick win |

### Ireland vs. Artfinder (artfinder.com)

10 keywords found where Artfinder ranks and Artace Studio does not; 8 of those have the competitor in a top-20 position. Slightly more thematic than most (sculpture/design terms rather than pure proper nouns), but still low-volume and not a standout cluster.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| wolf art | Artfinder (artfinder.com) | 19 | 40 | 13 | Quick win |
| www art | Artfinder (artfinder.com) | 6 | 10 | 80 | Long-term target |
| wrapping artwork | Artfinder (artfinder.com) | 13 | 10 | 21 | Quick win |
| words related to art and design | Artfinder (artfinder.com) | 1 | 10 | 26 | Quick win |
| wood sculpture for sale | Artfinder (artfinder.com) | 9 | 10 | 8 | Quick win |
| wood abstract sculpture | Artfinder (artfinder.com) | 12 | 10 | 9 | Quick win |
| wolf and badger jewellery | Artfinder (artfinder.com) | 2 | 10 | 15 | Quick win |
| william blake what is poetry | Artfinder (artfinder.com) | 10 | 10 | 28 | Quick win |

### Ireland vs. uGallery (ugallery.com)

10 keywords found where uGallery ranks and Artace Studio does not; 2 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| watercolors art | uGallery (ugallery.com) | 18 | 50 | 23 | Quick win |
| watercolour paintings of venice | uGallery (ugallery.com) | 2 | 10 | 10 | Quick win |

### New Zealand vs. Saatchi Art (saatchiart.com)

10 keywords found where Saatchi Art ranks and Artace Studio does not; 6 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| šinko | Saatchi Art (saatchiart.com) | 2 | 20 | 17 | Quick win |
| 李放 | Saatchi Art (saatchiart.com) | 4 | 10 | 10 | Quick win |
| zoo animal paintings | Saatchi Art (saatchiart.com) | 11 | 10 | 9 | Quick win |
| zebra painting on canvas | Saatchi Art (saatchiart.com) | 6 | 10 | 8 | Quick win |
| zebra painting ideas | Saatchi Art (saatchiart.com) | 13 | 10 | 9 | Quick win |
| zebra painting for sale | Saatchi Art (saatchiart.com) | 16 | 10 | 8 | Quick win |

### New Zealand vs. Singulart (singulart.com)

10 keywords found where Singulart ranks and Artace Studio does not; 4 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| šinko | Singulart (singulart.com) | 11 | 20 | 17 | Quick win |
| zurich art gallery guide | Singulart (singulart.com) | 17 | 10 | 18 | Quick win |
| zurich art gallery | Singulart (singulart.com) | 9 | 10 | 34 | Quick win |
| zebra painting for sale | Singulart (singulart.com) | 8 | 10 | 8 | Quick win |

### New Zealand vs. Artfinder (artfinder.com)

10 keywords found where Artfinder ranks and Artace Studio does not; 5 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| zebra artwork | Artfinder (artfinder.com) | 16 | 20 | 9 | Quick win |
| zebra painting for sale | Artfinder (artfinder.com) | 12 | 10 | 8 | Quick win |
| zebra painting | Artfinder (artfinder.com) | 19 | 10 | 10 | Quick win |
| young park | Artfinder (artfinder.com) | 5 | 10 | 17 | Quick win |
| www art | Artfinder (artfinder.com) | 12 | 10 | 76 | Long-term target |

### New Zealand vs. uGallery (ugallery.com)

10 keywords found where uGallery ranks and Artace Studio does not; 3 of those have the competitor in a top-20 position. Notably, all 3 eligible entries here are genuine buyer-intent phrases ("where to buy original watercolor paintings") rather than proper nouns — low volume (10/mo each), but on-topic for Artace's own value proposition.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| winter scene acrylic painting | uGallery (ugallery.com) | 12 | 10 | 11 | Quick win |
| wildlife oil paintings for sale | uGallery (ugallery.com) | 13 | 10 | 5 | Quick win |
| where to buy original watercolor paintings | uGallery (ugallery.com) | 15 | 10 | 9 | Quick win |

### United Arab Emirates vs. Saatchi Art (saatchiart.com)

10 keywords found where Saatchi Art ranks and Artace Studio does not; 3 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| صورة للبيع | Saatchi Art (saatchiart.com) | 16 | 20 | 13 | Quick win |
| مواقع الفن | Saatchi Art (saatchiart.com) | 15 | 10 | 49 | Long-term target |
| صور للاب توب | Saatchi Art (saatchiart.com) | 7 | 10 | 10 | Quick win |

### United Arab Emirates vs. Singulart (singulart.com)

10 keywords found where Singulart ranks and Artace Studio does not; 7 of those have the competitor in a top-20 position. Unlike most other files, this one surfaces a coherent topical cluster rather than scattered proper nouns — Picasso-related informational queries in Arabic, all quick wins:

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| رسوم بيكاسو | Singulart (singulart.com) | 5 | 70 | 19 | Quick win |
| لوحات بيكاسو | Singulart (singulart.com) | 8 | 50 | 20 | Quick win |
| لوح بيكاسو | Singulart (singulart.com) | 10 | 50 | 19 | Quick win |
| ما هو الفن التجريدي | Singulart (singulart.com) | 12 | 20 | 19 | Quick win |
| بيكاسو ولوحاته | Singulart (singulart.com) | 6 | 20 | 20 | Quick win |
| بيكاسو لوحات | Singulart (singulart.com) | 3 | 20 | 46 | Long-term target |
| فنان تشكيلي اسباني | Singulart (singulart.com) | 3 | 10 | 10 | Quick win |

### United Arab Emirates vs. Artfinder (artfinder.com)

10 keywords found where Artfinder ranks and Artace Studio does not; 2 of those have the competitor in a top-20 position. One notable entry: "ديكور جدران غرف نوم" (bedroom wall decor, Arabic) is a real, on-topic commercial phrase rather than a proper noun, though low volume.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| ديكور جدران غرف نوم | Artfinder (artfinder.com) | 12 | 10 | 10 | Quick win |
| оrange | Artfinder (artfinder.com) | 14 | 10 | 64 | Long-term target |

### United Arab Emirates vs. uGallery (ugallery.com)

10 keywords found where uGallery ranks and Artace Studio does not; 1 of those has the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| western art | uGallery (ugallery.com) | 9 | 10 | 41 | Long-term target |

### United Kingdom vs. Saatchi Art (saatchiart.com)

10 keywords found where Saatchi Art ranks and Artace Studio does not; 3 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| óscar pulido | Saatchi Art (saatchiart.com) | 14 | 10 | 17 | Quick win |
| zwiefka | Saatchi Art (saatchiart.com) | 18 | 10 | 10 | Quick win |
| zwa chicago | Saatchi Art (saatchiart.com) | 17 | 10 | 7 | Quick win |

### United Kingdom vs. Singulart (singulart.com)

10 keywords found where Singulart ranks and Artace Studio does not; 5 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| zwickers gallery halifax | Singulart (singulart.com) | 11 | 10 | 7 | Quick win |
| zwicker's gallery halifax | Singulart (singulart.com) | 7 | 10 | 7 | Quick win |
| zwelethu mthethwa paintings | Singulart (singulart.com) | 13 | 10 | 6 | Quick win |
| zwelethu mthethwa artworks | Singulart (singulart.com) | 15 | 10 | 6 | Quick win |
| zvi adler | Singulart (singulart.com) | 16 | 10 | 7 | Quick win |

### United Kingdom vs. Artfinder (artfinder.com)

10 keywords found where Artfinder ranks and Artace Studio does not; 4 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| zoes norman | Artfinder (artfinder.com) | 1 | 30 | 6 | Quick win |
| zoe's norman | Artfinder (artfinder.com) | 2 | 30 | 7 | Quick win |
| zoocation | Artfinder (artfinder.com) | 11 | 10 | 9 | Quick win |
| zoie lam | Artfinder (artfinder.com) | 2 | 10 | 6 | Quick win |

### United Kingdom vs. uGallery (ugallery.com)

10 keywords found where uGallery ranks and Artace Studio does not; 4 of those have the competitor in a top-20 position.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| yelena sidorova | uGallery (ugallery.com) | 2 | 20 | 7 | Quick win |
| yelitza | uGallery (ugallery.com) | 11 | 10 | 12 | Quick win |
| yelena sidorova artist | uGallery (ugallery.com) | 1 | 10 | 6 | Quick win |
| www ugallery com | uGallery (ugallery.com) | 1 | 10 | 12 | Quick win |

### India vs. Fizdi (fizdi.com)

10 keywords found where Fizdi ranks and Artace Studio does not; 7 of those have the competitor in a top-20 position. This is the standout file in the entire 22-file set: it surfaces a genuine, high-volume Marathi/Hindi devotional-content cluster, not proper-noun clutter — "शंकर महाराज" (Shankar Maharaj) at 500/mo and difficulty 7 is the single highest-volume keyword found anywhere in the competitor-gap dataset (a genuine quick win at difficulty 7, though a few other entries elsewhere in the dataset score even lower), and "जाणता राजा फोटो" (a historical/devotional Maratha-heritage query) adds 140/mo at difficulty 11.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| शंकर महाराज | Fizdi (fizdi.com) | 6 | 500 | 7 | Quick win |
| जाणता राजा फोटो | Fizdi (fizdi.com) | 1 | 140 | 11 | Quick win |
| zentangle painting | Fizdi (fizdi.com) | 1 | 70 | 32 | Quick win |
| शंकर महाराज फोटो | Fizdi (fizdi.com) | 1 | 10 | 12 | Quick win |
| गणपाती फोटो | Fizdi (fizdi.com) | 1 | 10 | 12 | Quick win |
| zombie photographer | Fizdi (fizdi.com) | 5 | 10 | 9 | Quick win |
| zentangle wolf | Fizdi (fizdi.com) | 12 | 10 | 11 | Quick win |

### India vs. Sajaao (sajaao.com)

10 keywords found where Sajaao ranks and Artace Studio does not; 2 of those have the competitor in a top-20 position. Both eligible entries are genuinely useful: "vitthal rakhumai painting" continues the devotional cluster found against Fizdi above (Vitthal-Rakhumai is a widely worshipped Hindu deity pair, particularly in Maharashtra), and "paintings in pune" is a hyper-local commercial term that directly matches Artace Studio's own home base.

| Keyword | Competitor | Their Position | Volume | Difficulty | Classification |
|---|---|---|---|---|---|
| vitthal rakhumai painting | Sajaao (sajaao.com) | 6 | 320 | 10 | Quick win |
| paintings in pune | Sajaao (sajaao.com) | 10 | 40 | 12 | Quick win |

## Homepage Audit

A fresh technical/on-page site audit was run this pass via an SE-Ranking site-audit crawl of artacestudio.com, completed **2026-07-22 10:26:38**, crawling **154 pages**. This replaces the prior pass's "no fresh audit was run" placeholder — everything below is freshly verified from `docs/seo/data/site-audit/report.json` and `pages.json`, not carried over unverified from the old file.

**Overall score: 75%** (`score_percent` and `weighted_score_percent` both 75). Across the crawl: **306 errors, 109 warnings, 192 notices, 103 passed checks**. Domain-level stats at time of audit: 393 pages indexed in Google, 66 tracked backlinks, 47 domains linking in.

### Categorized issue breakdown

Only sections with at least one flagged issue are shown; Security, Redirects, Localization, JavaScript, CSS, Mobile Optimization, and "Other" all came back completely clean (zero errors/warnings/notices).

| Category | Issue | Status | Count |
|---|---|---|---|
| Sitemap | Noindex pages in XML sitemap | Error | 67 |
| Crawling & Indexing / Sitemap | 5XX HTTP status codes (same 66 URLs counted in both checks) | Error | 66 |
| Sitemap | Non-canonical pages in XML sitemap | Error | 56 |
| Content | Alt text missing (images) | Warning | 81 |
| Links | External links to 3XX redirects | Notice | 81 |
| Links | External links missing anchor text | Notice | 81 |
| Content | 4XX images (broken/not found) | Error | 48 |
| Content | Image too big | Warning | 24 |
| Links | Internal links missing anchor text | Notice | 10 |
| Meta Tags | Title tag too long | Notice | 8 |
| Crawling & Indexing | Blocked by robots.txt | Notice | 5 |
| Meta Tags | Description too long | Notice | 4 |
| Links | Pages with only one inbound internal link | Notice | 3 |
| Crawling & Indexing / Sitemap | 4XX HTTP status codes | Error | 2 / 1 |
| Speed & Performance | Slow page loading speed | Warning | 1 |
| Speed & Performance | Largest Contentful Paint (lab) | Warning | 1 |
| Speed & Performance | Time to Interactive | Warning | 1 |
| Content | No WWW redirect | Warning | 1 |

### The 66-page 5xx cluster: mostly transient, with one confirmed real exception

The crawl flagged 66 pages returning 503/500 status codes (62 × 503, 4 × 500) — the same 66 URLs are counted under both "5XX HTTP Status Codes" and "5XX pages in XML sitemap" above, since they're sitemap-listed pages that happened to 5xx during the crawl. Of the flagged pages we inspected in detail, 62 of 66 carry the page title "Worker exceeded resource limits | artacestudio.com | Cloudflare" and the remaining 4 carry "Worker threw exception | artacestudio.com | Cloudflare" — two distinct Cloudflare Worker-error signatures, not a generic server crash, and not literally identical across the cluster. Live spot-checking 8 of the 66 flagged URLs after the crawl completed found **7 of 8 now returning a normal 200 OK**. This strongly indicates the great majority of this cluster was a transient, crawler-triggered rate-limit event during the audit itself, not persistent site breakage. **Do not read this as "66 broken pages."**

One URL in this cluster is a genuine, confirmed exception: `https://artacestudio.com/collections/mahadev-nandi-canvas-painting-shiva-devotional-wall-art` is confirmed live right now as a real 404 — the collection page itself has been removed or renamed, independent of the Cloudflare-503 read the crawler happened to catch it under. This is a distinct, real defect that needs a fix (recreate the collection or 301-redirect it to a live replacement/parent page) and should be treated on its own, separate from the transient-majority finding above.

Two more URLs were flagged as 4xx (not part of the 5xx cluster): `/collections/all-products` (404) and `/cdn-cgi/l/email-protection` (404). The latter is Cloudflare's email-obfuscation endpoint, a routine crawler artifact rather than a real page. `/collections/all-products` was not part of the 8-URL live spot-check sample, so its current live status is unconfirmed either way — worth a quick manual check, but not asserted as broken or fine here.

### Cross-reference against the 2026-04-16 audit (`SEO-audit.txt`)

| Old finding | Old severity | Fresh audit result | Status |
|---|---|---|---|
| Missing meta descriptions sitewide | High | `description_missing = 0` across all 154 pages; homepage now has a 159-character description | **Resolved** |
| Generic homepage title tag | Medium | Homepage title is now "Handcrafted Canvas Paintings in India \| Artace Studio" | **Resolved** |
| Missing meta descriptions on product pages | High | `description_missing = 0` sitewide | **Resolved** |
| Blog section: no content published | High | `/blogs` now has 9 pages, including 3 long-form guides of 1,998–4,201 words each | **Resolved** |
| Thin product-page content (needs 200-300 words) | Medium | Average word count across 200-status pages is 1,295; only the `/blogs` index page itself is under 200 words | **Resolved** |
| Missing internal linking structure | Medium | Substantial internal linking now exists (e.g. homepage has 177 inlinks, the Mahadev Nandi product page has 57) — 10 links still lack anchor text and 3 pages have only one inbound link, so minor cleanup remains | **Largely resolved** |
| Missing image alt text | High | `image_no_alt = 81` images | **Still open** (now precisely quantified) |
| Canonical tags missing/self-referencing | Warning | `sitemap_non_canonical = 56` pages in the sitemap | **Still open**, larger in scope than previously known |
| Low indexed-page count / indexation warning | Warning | 393 pages indexed in Google; 67 sitemap URLs are noindex'd, a likely contributor | **Still open**, new detail (67 pages) |
| Core Web Vitals / LCP issues | Warning | `lighthouse_lcp` still flagged | **Still open** |
| Page speed / large images | Warning | 24 images flagged oversized (`image_big`); `loading_speed` still flagged | **Still open** |
| Structured Data (schema markup) | Fail | This site-audit crawler doesn't check for schema markup — no fresh data either way | **Unconfirmed this pass** |
| "Broken Links: Pass — no internal broken links found" | Pass | Contradicted: 66 5xx + 2 4xx found in this crawl, though most of the 5xx cluster looks transient (see above); one page is a confirmed genuine 404 | **Partially contradicted** |
| Sitemap hygiene (noindex + non-canonical listings) | Not previously flagged | 67 noindex'd and 56 non-canonical URLs sitting inside the XML sitemap | **New finding** |
| Broken product images | Not previously flagged | 48 images returning 404 | **New finding** |

The old audit's competitor-comparison table (Artace Studio vs. "Meera Arts Academy" and "Book An Artist," rated qualitatively 1-10 on technical score) covers a different competitor set than this project's SE-Ranking gap analysis (Saatchi Art, Singulart, Artfinder, uGallery, Fizdi, Sajaao) and was not re-run this pass — carried forward as unverified historical context only, not a fresh finding.

This existing audit's content-gap table also independently flagged "Vastu Paintings Guide" (High priority, Quick win effort) and "Where to Place Ganesha Painting at Home" (High priority, Moderate/half-day effort) as opportunities — both align directly with the highest-volume India keywords found in "Keyword Data by Region" above ("ganesha canvas painting" at 2,900/mo, "vastu paintings for home" at 170/mo with difficulty 7), a useful cross-check that the pre-existing audit's judgment holds up against real keyword-volume data.

## Prioritized Recommendations

Ordered by estimated impact (highest search volume / highest competitor-gap volume first for content and architecture items; highest severity/scope first for technical fixes).

1. **[Regional Architecture]** Build a dedicated India "Ganesha Canvas Painting" collection/category page. This is the single largest validated demand cluster in the entire dataset: the seed keyword itself is 2,900/mo (difficulty 79), and its Related cluster adds "ganesha painting" (9,900), "ganesha paintings" (2,400), and "art ganesha"/"ganesha art" (1,500 each) — a deep, real keyword family, not a one-off term.

2. **[Regional Architecture]** Build a Maharashtra-specific devotional content cluster around "vitthal rakhumai painting" (320/mo, difficulty 10) and the Marathi/Hindi "शंकर महाराज" / "जाणता राजा फोटो" cluster (500/mo at difficulty 7, and 140/mo at difficulty 11) surfaced by the newly completed India vs. Fizdi and India vs. Sajaao comparisons. "शंकर महाराज" is the single highest-volume keyword found anywhere in the full 22-file competitor-gap dataset, and this cluster sits squarely inside Artace Studio's existing devotional-painting range (Ganesha, Radha Krishna, Buddha are already sold). Worth a small dedicated collection/landing page alongside a "paintings in pune" hyper-local page or section (40/mo, difficulty 12, also from the Sajaao gap) — the latter echoes the old 2026-04-16 audit's own suggested keyword "where to buy original paintings in pune."

3. **[Regional Architecture]** Treat "wall painting" (110,000), "canvas painting" (90,500), and "paintings" (40,500) — the three highest-volume terms found anywhere in this dataset, all from India's Related data — as long-horizon head-term targets that justify a proper category/taxonomy structure. Difficulty is 87-90 on all three, so these are directional targets for site architecture, not near-term ranking bets.

4. **[Regional Architecture]** Build a "Vastu & Pooja Room Paintings" content hub for India. Both seed keywords are low-difficulty, high-relevance ("vastu paintings for home" at 170/mo, difficulty 7; "pooja room paintings" at 210/mo, difficulty 9), and the Related/Longtail data backs it with a genuine supporting cluster (pooja wallpaper 590, pooja room background design 590, temple wall painting design 480, pooja room wall paint 390). This directly executes the existing homepage audit's own top-rated "quick win" content gap.

5. **[Regional Architecture]** Build room-specific landing pages for India (bedroom, living room). "Canvas painting for bedroom" (390/mo) is backed by a strong Related cluster: "wall painting for bedroom" (6,600), "wall paintings for bedroom" (1,600), "art for living room" (5,700), "wall art for living room" (3,600).

6. **[Regional Architecture]** Prioritize the United Kingdom as the lead international market for the regional rollout. "Original abstract art for sale" (110/mo, difficulty 16) is the highest-volume validated keyword across all 10 international regions' seed lists, and the UK's Related data is the richest of any Tier 1 region by a wide margin (art 60,500; paintings 14,800; artwork 12,100; abstract art 9,900) — build this region's landing pages first among the six regions with full expansion data.

7. **[Regional Architecture]** Build an Ireland-specific localized landing page around "gallery dublin" (3,100/mo, Local/Commercial intent) and "irish artist" (810/mo) — genuine local-intent volume not replicated in any other Tier 1 region, worth a dedicated Dublin/Ireland-facing page rather than a generic international one.

8. **[Regional Architecture]** Build a New Zealand-specific "art for sale NZ" landing page. The Related data shows a tight, consistent cluster around 480/mo each ("artist nz" 2,400, "art nz" 990, "nz art sale", "new zealand art for sale", "nz art for sale", "art for sale nz") at moderate difficulty (24-29) — a genuine, low-competition quick-win cluster.

9. **[Regional Architecture]** Mine the now-complete 22 competitor-gap files selectively rather than wholesale — of 220 total `theirsNotOurs` entries (92 with the competitor in a top-20 position), the overwhelming majority across every region except India are artist names, gallery names, and foreign-language proper nouns with limited direct commercial applicability. The real, reusable signal is a small set of topical keywords: Ireland vs. Saatchi Art's "yves klein blue" (170/mo, difficulty 36, quick win), UAE vs. Singulart's Arabic-language Picasso cluster ("رسوم بيكاسو" 70, "لوحات بيكاسو"/"لوح بيكاسو" 50 each, all quick wins), and — the standout of the newly completed set — India's devotional cluster covered in Recommendation 2 above. Together these justify a small, targeted batch of art-history/educational blog posts plus the dedicated India devotional page.

10. **[Homepage Rebuild]** Fix the one confirmed, currently-live 404: `https://artacestudio.com/collections/mahadev-nandi-canvas-painting-shiva-devotional-wall-art`. Either recreate the collection page or 301-redirect it to a live replacement (e.g. the still-working `/shop/mahadev-nandi` product page, or a parent devotional-art collection). This is a real, standalone defect, not part of the transient crawl-time 5xx cluster.

11. **[Homepage Rebuild]** Spot-check the remaining ~58 URLs in the 66-page 5xx cluster that haven't yet been individually re-verified (only 8 were sampled live so far, 7 of which are fine). The Cloudflare "Worker exceeded resource limits" signature on all of them points to a transient rate-limit event during the crawl rather than a systemic outage, but a full re-crawl (ideally throttled, to avoid re-triggering the same rate limit) would confirm there isn't a second genuine breakage hiding in the cluster alongside the Mahadev Nandi one.

12. **[Homepage Rebuild]** Fix the newly-quantified sitemap hygiene problem: 67 URLs in the XML sitemap are marked `noindex` (a direct contradiction — noindex'd pages shouldn't be sitemap-listed at all) and 56 are non-canonical (pointing elsewhere via `rel="canonical"`). This wasn't caught by the 2026-04-16 audit and directly affects the "low indexed-page count" warning that audit did flag.

13. **[Homepage Rebuild]** Close out the two remaining "High"-severity items from the original audit, now precisely quantified by this crawl: add alt text to the 81 images still missing it, and fix the 48 broken (404) product images found.

14. **[Homepage Rebuild]** Address the still-open Page Speed / Core Web Vitals warnings: compress or resize the 24 oversized images flagged, and resolve the LCP/Time-to-Interactive/loading-speed warnings. These have been open since the 2026-04-16 audit and benefit every regional landing page recommended above simultaneously.

15. **[Homepage Rebuild]** Implement Product/Organization/BreadcrumbList schema markup. This site-audit crawler doesn't check for schema, so the old audit's "Fail" rating here is neither confirmed fixed nor freshly re-flagged — treat it as still outstanding and pair it with the new collection pages recommended above so they ship with schema from day one.

16. **[Homepage Rebuild]** Minor link-hygiene cleanup: add anchor text to the 10 internal links currently missing it, and add a second inbound internal link to the 3 pages that currently have only one. Lowest priority of the technical items — small polish, not a structural problem.
