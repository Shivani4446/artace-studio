# WordPress JWT + Blog Fetch Fix (Exact Steps)

Current status from your `/wp-json` response:

- `jwt-auth/v1` exists
- `/jwt-auth/v1/token` exists (POST)
- So JWT plugin route is correctly registered

Your remaining issue is:

- `/wp-json/wp/v2/posts` returns `401 UNAUTHORIZED`
- This is a WordPress REST restriction issue (plugin/custom code/server), not a missing JWT route

## Step 1: Confirm `wp-config.php` values

In cPanel -> File Manager -> WordPress root -> `wp-config.php`, ensure these exist above:
`/* That's all, stop editing! Happy publishing. */`

```php
define('JWT_AUTH_SECRET_KEY', 'your-long-random-secret');
define('JWT_AUTH_CORS_ENABLE', true);
```

## Step 2: Confirm `.htaccess` forwards Authorization header

In WordPress root `.htaccess`, add:

```apache
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [E=HTTP_AUTHORIZATION:%1]
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

## Step 3: Refresh rewrite rules + clear cache

1. WordPress Admin -> `Settings` -> `Permalinks` -> `Save Changes`
2. Clear cache plugin cache
3. Clear server cache
4. Clear Cloudflare cache (if used)

## Step 4: Test JWT token endpoint (must pass)

Use Postman or terminal:

```bash
curl -X POST "https://artacestudio.com/wp-json/jwt-auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_WP_USERNAME","password":"YOUR_WP_PASSWORD"}'
```

Expected: JSON with `token`.

If this fails:

- credentials wrong, or
- plugin config/server blocking POST

## Step 5: Test JWT validate endpoint

```bash
curl -X POST "https://artacestudio.com/wp-json/jwt-auth/v1/token/validate" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: success JSON.

## Step 6: Test WordPress authenticated endpoint

```bash
curl "https://artacestudio.com/wp-json/wp/v2/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: user object.

If this returns unauthorized:

- Authorization header is still stripped, or
- REST restriction plugin blocks authenticated REST access

## Step 7: Test public posts endpoint

Open:

`https://artacestudio.com/wp-json/wp/v2/posts?per_page=1`

Expected: posts array.

If this returns 401 (your current case):

- a security/restriction rule is blocking public REST routes

## Step 8: Find blocker plugin (important)

In WP Admin -> Plugins, temporarily deactivate one by one:

- Wordfence
- All In One WP Security
- iThemes/Solid Security
- Disable REST API / REST API Toolbox
- miniOrange auth/security plugins
- any custom “JWT auth” or API lock plugin

After each deactivate, retest:
`/wp-json/wp/v2/posts?per_page=1`

When it starts working, that plugin is the blocker.

## Step 9: Whitelist required routes in blocker plugin

Allow:

- `/wp-json/wp/v2/posts`
- `/wp-json/wp/v2/categories`
- `/wp-json/wp/v2/users/me`
- `/wp-json/jwt-auth/v1/token`
- `/wp-json/jwt-auth/v1/token/validate`

## Step 10: Check custom code filters

Check active theme `functions.php` and `mu-plugins` for:

- `rest_authentication_errors`

If present, remove/adjust code that blocks anonymous REST requests globally.

## Step 11: App env check

In your Next.js `.env.local`:

```env
WOOCOMMERCE_SITE_URL=https://artacestudio.com
WORDPRESS_JWT_AUTH_URL=https://artacestudio.com/wp-json/jwt-auth/v1/token
```

Restart Next.js dev server after changes.

## Step 12: Final app test

1. Login in your app
2. Open `/blog-test`
3. Open `/blogs`

Expected: blogs load without 401.

---

If still failing after Step 8, collect and share:

- Active plugin list
- Result of Step 4
- Result of Step 6
- Result of Step 7

That will identify the exact failing layer quickly.
