# WordPress JWT Setup Guide

This guide fixes:

`{"code":"rest_no_route","message":"No route was found matching the URL and request method.","data":{"status":404}}`

for:

`https://artacestudio.com/wp-json/jwt-auth/v1/token`

## 1. Install and activate the JWT plugin

1. Log in to WordPress Admin.
2. Go to `Plugins` -> `Add New Plugin`.
3. Search for `JWT Authentication for WP REST API`.
4. Click `Install Now`.
5. Click `Activate`.

## 2. Add JWT config to `wp-config.php`

1. Open your WordPress root folder (hosting file manager, FTP, or SSH).
2. Edit `wp-config.php`.
3. Add these lines above:
   `/* That's all, stop editing! Happy publishing. */`

```php
define('JWT_AUTH_SECRET_KEY', 'paste-a-very-long-random-secret-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

Notes:
- Use a long random secret for `JWT_AUTH_SECRET_KEY`.
- `JWT_AUTH_CORS_ENABLE` is optional but commonly needed for frontend apps.

## 3. Flush permalinks

1. In WordPress Admin, go to `Settings` -> `Permalinks`.
2. Click `Save Changes` without changing anything.

This refreshes rewrite rules so REST routes register correctly.

## 4. Verify JWT route exists

1. Open:
   `https://artacestudio.com/wp-json`
2. Search the response for:
   `jwt-auth/v1`

If missing, plugin is not active or blocked by config/cache/security tooling.

## 5. Ensure Authorization header reaches WordPress

JWT depends on the `Authorization` header. Configure your server:

### Apache (`.htaccess` in WordPress root)

```apache
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [E=HTTP_AUTHORIZATION:%1]
```

### Nginx (server/location block)

```nginx
fastcgi_param HTTP_AUTHORIZATION $http_authorization;
```

Then reload Nginx.

## 6. Set Next.js environment variables

In `.env.local`:

```env
WORDPRESS_JWT_AUTH_URL=https://artacestudio.com/wp-json/jwt-auth/v1/token
WOOCOMMERCE_SITE_URL=https://artacestudio.com
```

Restart your Next.js server after editing env files.

## 7. Test with POST (not browser URL bar)

Windows PowerShell:

```powershell
curl -X POST "https://artacestudio.com/wp-json/jwt-auth/v1/token" `
  -H "Content-Type: application/json" `
  -d "{\"username\":\"your_wp_username\",\"password\":\"your_wp_password\"}"
```

Expected success response includes a `token`.

If you still get `rest_no_route`, the route is not registered on WordPress yet (plugin/config/rewrite/server issue).

## 8. Admin-only alternative (no `wp-config.php` access)

If you cannot edit server files, do this instead:

1. Install a JWT plugin that can be configured from WordPress Admin only.
   Examples:
   - `Simple JWT Login`
   - `miniOrange JWT Authentication`
2. In the plugin settings:
   - Enable login endpoint
   - Enable register/signup endpoint
   - Configure allowed CORS origins for your frontend domain
3. In WooCommerce:
   - Go to `WooCommerce` -> `Settings` -> `Accounts & Privacy`
   - Enable customer account creation where needed
4. Update your Next.js `.env.local` to use that plugin endpoint:

```env
WORDPRESS_JWT_AUTH_URL=<plugin-login-endpoint>
WOOCOMMERCE_SITE_URL=https://artacestudio.com
```

Note:
- The `JWT Authentication for WP REST API` plugin specifically requires `JWT_AUTH_SECRET_KEY` in `wp-config.php`.
- If server-file edits are impossible, use a plugin with admin UI based setup.
