# Product Schema Generation via Webhook and Polling Design

## Overview
This design implements a hybrid approach for dynamic JSON-LD schema generation for WooCommerce products:
1. Primary: Real-time schema generation via WooCommerce webhook
2. Fallback: Nightly polling job to catch missed events and refresh schemas

## Problem
Dynamic product schemas were implemented but not appearing on the live website due to two issues:
1. Schema generator files were never actually created despite being imported
2. Schema was incorrectly injected via `other` metadata instead of `jsonLd` property

Both issues have been resolved, but we need to ensure schemas are generated when new products are added.

## Goals
- Generate JSON-LD schema for products immediately when created/updated in WooCommerce
- Ensure schema exists before any user or search engine visits the product page
- Provide fallback mechanism to handle missed webhooks
- Maintain idempotent generation to prevent duplicate work
- Keep schema fresh with periodic refreshes

## Solution Architecture

### Components
1. **Webhook Endpoint** - Receives real-time product events from WooCommerce
2. **Schema Generation Service** - Idempotent function to generate and cache schema
3. **Nightly Polling Job** - Scans for recent products and regenerates schemas
4. **Cache Layer** - Stores generated schemas with TTL

### Data Flow
```
WooCommerce Admin → Webhook (product.created/updated) → Webhook Endpoint → 
Schema Generator → Cache (Next.js ISR) → Product Page → jsonLd metadata

Nightly Cron → Poll WooCommerce API (last 72h) → Schema Generator → Cache
```

## Detailed Design

### 1. Webhook Endpoint (`/app/api/webhooks/woocommerce/route.ts`)
```typescript
// Verify webhook signature using WooCommerce secret
// Parse product ID from webhook payload
// Call schema generation service
// Return 200 OK on success
```

### 2. Schema Generation Service (`lib/schema/service.ts`)
```typescript
export async function generateAndCacheProductSchema(
  productId: number,
  forceRefresh = false
): Promise<void> {
  // Check cache unless forceRefresh
  // Fetch product data from WooCommerce Store API
  // Generate complete schema using existing lib/schema functions
  // Cache result with 7-day TTL using Next.js unstable_cache
  // Handle errors gracefully
}
```

### 3. Nightly Polling Job (`/app/api/cron/product-schema/route.ts`)
```typescript
// Vercel cron or GitHub Actions scheduled at 03:00 UTC
// Fetch products modified in last 72 hours from WooCommerce REST API
// For each product, call generateAndCacheProductSchema(productId, true)
// Log results and errors
```

### 4. Cache Implementation
- Uses Next.js `unstable_cache` with tags
- Tag format: `product-schema-${productId}`
- TTL: 7 days (604800 seconds)
- Automatic revalidation on tag change

## Integration Points

### Existing Code (Already Fixed)
- `app/shop/[slug]/page.tsx`: 
  - Fixed schema injection: changed from `other: { schema: JSON.stringify(schema) }` to `jsonLd: schema`
  - Import: `import { generateProductSchema } from "@/lib/schema";`
  
- Schema generator files:
  - `lib/schema/types.ts` - TypeScript interfaces
  - `lib/schema/offer.ts` - Offer schema generator
  - `lib/schema/aggregate-rating.ts` - Rating schema
  - `lib/schema/review.ts` - Review schema
  - `lib/schema/breadcrumb.ts` - Breadcrumb schema
  - `lib/schema/product.ts` - Main product schema aggregator
  - `lib/schema/index.ts` - Module exports

### New Files to Create
1. `app/api/webhooks/woocommerce/route.ts` - Webhook handler
2. `app/api/cron/product-schema/route.ts` - Nightly cron job
3. `lib/schema/service.ts` - Schema generation service with caching
4. `lib/schema/validation.ts` (optional) - Schema validation utilities

## Security Considerations
- Webhook endpoint validates X-WC-Webhook-Signature header
- Uses WooCommerce webhook secret stored in environment variables
- Rate limiting to prevent abuse
- Input validation on webhook payload
- Sanitization of product data before schema generation

## Error Handling & Monitoring
- Webhook endpoint logs errors but always returns 200 to prevent WooCommerce retries
- Schema generation failures are logged with product ID for manual investigation
- Nightly job sends alerts on failure rate > 5%
- Metrics: successful generations, cache hits/misses, generation duration

## Testing Strategy
1. Unit tests for schema generation service
2. Integration tests for webhook endpoint with mock WooCommerce payload
3. End-to-end test: create product in WooCommerce dev store → verify schema appears
4. Cache expiration test
5. Nightly job test with fixture data

## Deployment Requirements
- Vercel: Configure webhook endpoint in WooCommerce settings
- Vercel: Set up cron job for `/app/api/cron/product-schema` (03:00 UTC)
- Environment variables: 
  - `WOOCOMMERCE_WEBHOOK_SECRET`
  - `WOOCOMMERCE_STORE_URL`
  - `WOOCOMMERCE_CONSUMER_KEY` (for nightly job)
  - `WOOCOMMERCE_CONSUMER_SECRET` (for nightly job)

## Success Criteria
1. Schema appears in page source within 5 seconds of product creation in WooCommerce admin
2. Schema validator (https://schema.org/validator) shows no errors
3. Google Rich Results Test detects Product schema with all required fields
4. Nightly job runs successfully and logs processed count
5. Cache hit rate > 95% for product schema requests after warmup