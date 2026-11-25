<?php
/**
 * Plugin Name: Artace REST Cache Headers
 * Description: Marks the public, read-only catalog REST responses the
 * headless storefront reads (WooCommerce Store API products/categories/tags,
 * blog posts, artist profiles) as cacheable, so Cloudflare / LiteSpeed can
 * answer repeat requests without reaching PHP. This is the WordPress half of
 * the 429 fix — see docs/woocommerce-429-runbook.md.
 *
 * Install: copy into wp-content/mu-plugins/ on api.artacestudio.com.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Seconds a shared cache (Cloudflare edge / LiteSpeed) may serve a response
// before revalidating, and how long it may keep serving a stale copy while
// it refreshes or while the origin is erroring.
const ARTACE_REST_CACHE_S_MAXAGE = 300;
const ARTACE_REST_CACHE_STALE_WHILE_REVALIDATE = 600;
const ARTACE_REST_CACHE_STALE_IF_ERROR = 86400;

/**
 * Route prefixes that are public, read-only and identical for every visitor.
 * Never add cart/checkout/batch/order routes here.
 */
function artace_rest_cache_is_cacheable_route($route) {
    $prefixes = array(
        '/wc/store/v1/products',   // also matches /products/categories, /products/tags, /products/attributes
        '/wp/v2/posts',
        '/wp/v2/categories',
        '/wp/v2/tags',
        '/wp/v2/media',
        '/wp/v2/artist',           // artist profiles published from dashboard.artacestudio.com
    );
    foreach ($prefixes as $prefix) {
        if (strpos($route, $prefix) === 0) {
            return true;
        }
    }
    return false;
}

add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if (!($response instanceof WP_REST_Response)) {
        return $response;
    }

    if ($request->get_method() !== 'GET') {
        return $response;
    }

    // Only successful responses — never let a CDN pin an error.
    if ($response->get_status() !== 200) {
        return $response;
    }

    if (!artace_rest_cache_is_cacheable_route($request->get_route())) {
        return $response;
    }

    // Anything carrying credentials or a logged-in user may be personalised.
    if (
        is_user_logged_in() ||
        $request->get_header('authorization') ||
        $request->get_param('consumer_key') ||
        $request->get_param('context') === 'edit'
    ) {
        $response->header('Cache-Control', 'private, no-store');
        return $response;
    }

    $response->header(
        'Cache-Control',
        sprintf(
            'public, max-age=60, s-maxage=%d, stale-while-revalidate=%d, stale-if-error=%d',
            ARTACE_REST_CACHE_S_MAXAGE,
            ARTACE_REST_CACHE_STALE_WHILE_REVALIDATE,
            ARTACE_REST_CACHE_STALE_IF_ERROR
        )
    );
    // LiteSpeed Cache (Hostinger) honours this to cache the REST response
    // at the server level.
    $response->header('X-LiteSpeed-Cache-Control', 'public,max-age=' . ARTACE_REST_CACHE_S_MAXAGE);
    // The Store API sets a nonce on every response, which makes CDNs refuse
    // to cache it. Product reads don't need it. (WP_REST_Response has no
    // remove_header(); rewrite the header map instead.)
    $headers = $response->get_headers();
    unset($headers['Nonce'], $headers['X-WC-Store-API-Nonce'], $headers['Nonce-Timestamp'], $headers['User-ID']);
    $response->set_headers($headers);

    return $response;
}, 99, 3);

// The Store API starts a WooCommerce session (and sends Set-Cookie) on every
// request, including anonymous product reads. A Set-Cookie header makes
// Cloudflare and LiteSpeed bypass the cache entirely, so strip it for the
// cacheable read routes above.
add_action('rest_api_init', function () {
    $route = isset($GLOBALS['wp']->query_vars['rest_route'])
        ? $GLOBALS['wp']->query_vars['rest_route']
        : '';
    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : '';
    if ($route === '' || $method !== 'GET' || !artace_rest_cache_is_cacheable_route($route)) {
        return;
    }
    add_filter('send_headers', function () {
        header_remove('Set-Cookie');
    }, 99);
    add_filter('rest_pre_serve_request', function ($served) {
        header_remove('Set-Cookie');
        return $served;
    }, 99);
}, 1);
