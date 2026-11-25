# WooCommerce 429 / false-404 runbook

## What was happening

- The storefront runs on Cloudflare Pages (edge runtime). Every page render
  fetches from `api.artacestudio.com` (Hostinger). Next's data cache is
  per-Cloudflare-datacenter, so cold caches across many datacenters each hit
  Hostinger directly, from shared Cloudflare egress IPs.
- A single product page made **~10–13 WordPress requests** (the same
  `wc/v3/products/{id}` fetched 5×, plus FAQ, variations, two ACF endpoints,
  `wp/v2/product`, related, featured, blogs).
- Every 429 was **retried twice within ~1.5s**, tripping the limit harder.
- A 429 on the product lookup returned `[]` → `notFound()` → **404**. A
  `cache: "no-store"` "live re-check" then fired an uncached request on every
  miss (including bots hitting dead URLs).

## What the code now does

| Change | File |
|---|---|
| 429 is no longer retried; 5xx/network get 1 retry | `lib/http/fetch-with-retry.ts` |
| One memoised `wc/v3` fetch per product, shared by artist/FAQ/print/atelier/info readers; ACF + `wp/v2` only as fallback; variations only for variable products; credentials removed from query strings | `app/shop/[slug]/page.tsx` |
| WooCommerce error ≠ 404: throws → self-retrying "busy" page | `app/shop/[slug]/error.tsx`, `app/samora/shop/[slug]/error.tsx`, `components/shared/StorefrontRetry.tsx` |
| Miss re-check uses a 15s cache instead of `no-store` | `app/shop/[slug]/page.tsx` |
| Shop listing keeps already-loaded pages if a later page fails; client no longer re-fetches the whole catalog on every visit | `app/shop/page.tsx`, `lib/api-route-handlers/store/products/route.ts`, `components/shop/ShopCatalog.tsx` |
| Cacheable headers on public catalog REST routes, Set-Cookie stripped | `wordpress/mu-plugins/artace-rest-cache.php` |

Warm pages already survive outages: Next's fetch cache only stores 200s and
keeps serving the stale copy when a background refresh fails.

## Server-side steps (do once)

1. **Install the mu-plugin.** Upload `wordpress/mu-plugins/artace-rest-cache.php`
   to `wp-content/mu-plugins/` on api.artacestudio.com. Verify:
   `curl -sI "https://api.artacestudio.com/wp-json/wc/store/v1/products?per_page=1"`
   → `cache-control: public, max-age=60, s-maxage=300, …` and no `set-cookie`.
2. **Proxy `api.artacestudio.com` through Cloudflare** (orange cloud in DNS) if
   it isn't already, then add a **Cache Rule**:
   - When: hostname = `api.artacestudio.com` AND URI path starts with
     `/wp-json/wc/store/v1/products` (add `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/artist`)
     AND request method = GET
   - Then: *Eligible for cache*, Edge TTL = *Use cache-control header if present*,
     Browser TTL = respect origin.
   This is the biggest win: the storefront's fetches become same-zone cache
   hits and stop reaching Hostinger.
3. **Hostinger hPanel → Security:** turn off (or set to "low") any *bot
   protection / DDoS / rate limiting* for `api.artacestudio.com` — once it's
   behind Cloudflare, every request arrives from Cloudflare IPs and per-IP limits
   will throttle the storefront itself. Ask Hostinger support to allowlist
   [Cloudflare's IP ranges](https://www.cloudflare.com/ips/) if a limit can't be
   disabled from the panel.
4. **Security plugins (Wordfence / LiteSpeed / iThemes):** disable rate
   limiting for REST requests, or allowlist Cloudflare IP ranges. In Wordfence:
   *Firewall → Rate Limiting → "How should we treat Google's crawlers"* is not
   enough — set *"If anyone's requests exceed"* to *Unlimited* or allowlist the
   ranges under *Allowlisted IP addresses*.
5. **LiteSpeed Cache plugin** (if active): *Cache → Cache REST API = ON*.
6. **Object cache:** enable Redis/Memcached object cache in hPanel if your
   plan supports it — cuts PHP time per REST request substantially.

## Confirming the fix

- `curl -sI` the URL from step 1 twice — second response should have
  `cf-cache-status: HIT`.
- Cloudflare dashboard → Analytics → Cache: rising hit ratio on `api.`.
- Product URLs that failed should now show either the page or the "taking a
  little longer to load" retry screen — never the 404 page — during outages.
