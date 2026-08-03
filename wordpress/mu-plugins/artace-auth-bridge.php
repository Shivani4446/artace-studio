<?php
/**
 * Plugin Name: Artace Auth Bridge
 * Description: Server-to-server REST endpoints used by the Next.js app to
 * generate and validate WordPress password-reset keys, so the reset email
 * itself can be composed and sent by the Next.js app instead of wp-login.php.
 */

if (!defined('ABSPATH')) {
    exit;
}

// If the shared secret hasn't been configured yet in wp-config.php, disable
// this plugin entirely rather than fatal-erroring on the undefined constant.
if (!defined('ARTACE_AUTH_BRIDGE_SECRET') || ARTACE_AUTH_BRIDGE_SECRET === '') {
    return;
}

function artace_auth_bridge_check_secret($request) {
    $provided = $request->get_header('X-Artace-Secret');
    if (!is_string($provided) || $provided === '') {
        return false;
    }
    return hash_equals(ARTACE_AUTH_BRIDGE_SECRET, $provided);
}

function artace_auth_bridge_request_reset($request) {
    if (!artace_auth_bridge_check_secret($request)) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 401);
    }

    $identifier = sanitize_text_field((string) $request->get_param('username_or_email'));

    if ($identifier === '') {
        return new WP_REST_Response(['found' => false], 200);
    }

    $user = is_email($identifier) ? get_user_by('email', $identifier) : false;
    if (!$user) {
        $user = get_user_by('login', $identifier);
    }

    if (!$user) {
        return new WP_REST_Response(['found' => false], 200);
    }

    $key = get_password_reset_key($user);

    if (is_wp_error($key)) {
        return new WP_REST_Response(['found' => false], 200);
    }

    return new WP_REST_Response([
        'found' => true,
        'login' => $user->user_login,
        'email' => $user->user_email,
        'firstName' => $user->first_name ?: $user->display_name,
        'key' => $key,
    ], 200);
}

function artace_auth_bridge_reset_password($request) {
    if (!artace_auth_bridge_check_secret($request)) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 401);
    }

    $login = sanitize_text_field((string) $request->get_param('login'));
    $key = sanitize_text_field((string) $request->get_param('key'));
    $password = (string) $request->get_param('password');

    if ($login === '' || $key === '' || $password === '') {
        return new WP_REST_Response([
            'ok' => false,
            'message' => 'The reset link is incomplete. Request a new password reset email.',
        ], 200);
    }

    $user = check_password_reset_key($key, $login);

    if (is_wp_error($user)) {
        return new WP_REST_Response([
            'ok' => false,
            'message' => 'This reset link is invalid or has expired. Request a new one.',
        ], 200);
    }

    reset_password($user, $password);

    return new WP_REST_Response([
        'ok' => true,
        'message' => 'Your password has been updated. You can sign in now.',
    ], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('artace-auth/v1', '/request-reset', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'artace_auth_bridge_request_reset',
    ]);

    register_rest_route('artace-auth/v1', '/reset-password', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'artace_auth_bridge_reset_password',
    ]);
});
