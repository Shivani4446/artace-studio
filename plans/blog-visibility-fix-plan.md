# Blog Visibility Fix Plan

## Current Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────────┐         ┌──────────────────────────┐ │
│   │   Frontend (Next.js) │         │   Backend (WordPress)    │ │
│   │                      │         │                          │ │
│   │  artacestudio.com    │ ──────► │  api.artacestudio.com    │ │
│   │                      │  Fetch  │  (WP REST API)           │ │
│   │  /blogs              │  Posts  │  /wp-json/wp/v2/posts    │ │
│   │  /blogs/[slug]       │         │                          │ │
│   └──────────────────────┘         └──────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Problem Analysis

Your Next.js frontend is correctly configured to fetch blog posts from `api.artacestudio.com/wp-json/wp/v2/posts`. However, based on the existing [`WORDPRESS_JWT_SETUP.md`](artace-studio/WORDPRESS_JWT_SETUP.md) documentation, the issue is:

**The WordPress REST API is returning `401 UNAUTHORIZED` when your frontend tries to fetch posts.**

This means the posts exist in WordPress, but the REST API is blocking public access to them.

### Root Causes (in order of likelihood)

1. **Security Plugin Blocking REST API** - Plugins like Wordfence, All In One WP Security, or iThemes Security often block public REST API access by default
2. **REST API Restriction Plugin** - A plugin specifically designed to restrict REST API endpoints
3. **Custom Code in functions.php** - Custom authentication filters that block anonymous REST requests
4. **JWT Configuration Issues** - The JWT plugin may not be properly configured

---

## Solution Plan

### Phase 1: Diagnosis (Do this first)

| Step | Action | How to Verify |
|------|--------|---------------|
| 1.1 | Test public posts endpoint | Visit `https://api.artacestudio.com/wp-json/wp/v2/posts?per_page=1` in browser - should return JSON with posts |
| 1.2 | Check HTTP response status | If you see 401/403 error, REST API is blocked |
| 1.3 | Identify blocking plugin | See Phase 2 below |

### Phase 2: Fix WordPress REST API (Hostinger/WordPress Side)

| Step | Action | Details |
|------|--------|---------|
| 2.1 | Deactivate security plugins temporarily | Start with Wordfence, then All In One WP Security, then iThemes |
| 2.2 | After each deactivation, test the endpoint | `https://api.artacestudio.com/wp-json/wp/v2/posts?per_page=1` |
| 2.3 | Whitelist REST API routes in the blocking plugin | Allow: `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/categories` |
| 2.4 | Check theme functions.php | Look for `rest_authentication_errors` filter that may be blocking |
| 2.5 | Flush WordPress permalinks | Settings → Permalinks → Save Changes |
| 2.6 | Clear all caches | Server cache, plugin cache, Cloudflare cache |

### Phase 3: Verify Frontend Integration

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Test `/blog-test` page | Should display blog posts |
| 3.2 | Test `/blogs` page | Should display blog archive |
| 3.3 | Test `/blogs/[slug]` | Should display individual blog post |

### Phase 4: Optional - Enable JWT Authentication (if needed for user-specific features)

If you need authenticated endpoints (e.g., for user accounts linked to WordPress):

| Step | Action |
|------|--------|
| 4.1 | Configure JWT_AUTH_SECRET_KEY in wp-config.php |
| 4.2 | Update .env.local with JWT credentials |
| 4.3 | Test token generation endpoint |

---

## Quick Diagnostic Commands

You can run these in your browser console or terminal:

```bash
# Test if public posts are accessible
curl "https://api.artacestudio.com/wp-json/wp/v2/posts?per_page=1"

# Test categories endpoint
curl "https://api.artacestudio.com/wp-json/wp/v2/categories"
```

**Expected successful response:**
```json
[{"id":1,"slug":"hello-world","title":{"rendered":"Hello world!"},...}]
```

**If you see 401 or 403, the REST API is blocked.**

---

## Files Involved

The frontend code is already correctly configured:

- [`artace-studio/app/blogs/page.tsx`](artace-studio/app/blogs/page.tsx) - Blog listing page (fetches from `/wp-json/wp/v2/posts`)
- [`artace-studio/app/blogs/[slug]/page.tsx`](artace-studio/app/blogs/[slug]/page.tsx) - Individual blog post page
- [`artace-studio/app/blog-test/page.tsx`](artace-studio/app/blog-test/page.tsx) - Test page for debugging

No code changes needed on the frontend - the issue is entirely on the WordPress side.
