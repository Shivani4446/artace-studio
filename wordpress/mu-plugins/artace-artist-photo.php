<?php
/**
 * Plugin Name: Artace Artist Photo (REST)
 * Description: Adds a read-only `artace_photo` field (image URL or null) to the
 * `artist` taxonomy in the REST API (/wp-json/wp/v2/artist), so the headless
 * storefront can show the photo set on an artist's WordPress profile.
 *
 * The photo is resolved, first match wins, from:
 *   1. An ACF image field on the artist term whose name contains
 *      photo / image / avatar / picture / portrait.
 *   2. Term meta: thumbnail_id, artist_photo, profile_photo, photo, image,
 *      artist_image, avatar (attachment ID, URL, or ACF-style array).
 *   3. The WordPress user linked to the artist (user meta artist_store_name
 *      equal to the term name): user meta artist_photo, profile_photo,
 *      profile_picture, avatar, wp_user_avatar.
 *
 * Install: copy into wp-content/mu-plugins/ on api.artacestudio.com.
 * Every lookup is defensive: any failure returns null rather than an error.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Turns an attachment ID, URL string, or ACF/array image value into a URL.
 *
 * @param mixed $value
 * @return string|null
 */
function artace_artist_photo_to_url($value) {
    if (is_array($value)) {
        if (!empty($value['url']) && is_string($value['url'])) {
            return esc_url_raw($value['url']);
        }
        if (!empty($value['ID'])) {
            $value = $value['ID'];
        } elseif (!empty($value['id'])) {
            $value = $value['id'];
        } else {
            return null;
        }
    }

    if (is_numeric($value) && (int) $value > 0) {
        $url = wp_get_attachment_image_url((int) $value, 'large');
        return $url ? $url : null;
    }

    if (is_string($value)) {
        $value = trim($value);
        if ($value !== '' && preg_match('#^https?://#i', $value)) {
            return esc_url_raw($value);
        }
    }

    return null;
}

/**
 * @param int    $term_id
 * @param string $term_name
 * @return string|null
 */
function artace_artist_photo_for_term($term_id, $term_name) {
    // 1. ACF image fields on the term.
    if (function_exists('get_fields')) {
        $fields = get_fields('term_' . $term_id);
        if (is_array($fields)) {
            foreach ($fields as $name => $value) {
                if (preg_match('/photo|image|avatar|picture|portrait/i', (string) $name)) {
                    $url = artace_artist_photo_to_url($value);
                    if ($url) {
                        return $url;
                    }
                }
            }
        }
    }

    // 2. Term meta.
    $term_keys = array('thumbnail_id', 'artist_photo', 'profile_photo', 'photo', 'image', 'artist_image', 'avatar');
    foreach ($term_keys as $key) {
        $url = artace_artist_photo_to_url(get_term_meta($term_id, $key, true));
        if ($url) {
            return $url;
        }
    }

    // 3. The linked artist user.
    if ($term_name !== '') {
        $users = get_users(array(
            'meta_key'   => 'artist_store_name',
            'meta_value' => $term_name,
            'number'     => 1,
            'fields'     => 'ID',
        ));
        if (!empty($users)) {
            $user_id   = (int) $users[0];
            $user_keys = array('artist_photo', 'profile_photo', 'profile_picture', 'avatar', 'wp_user_avatar');
            foreach ($user_keys as $key) {
                $url = artace_artist_photo_to_url(get_user_meta($user_id, $key, true));
                if ($url) {
                    return $url;
                }
            }
        }
    }

    return null;
}

add_action('rest_api_init', function () {
    if (!taxonomy_exists('artist')) {
        return;
    }

    register_rest_field('artist', 'artace_photo', array(
        'get_callback' => function ($term) {
            try {
                $term_id   = isset($term['id']) ? (int) $term['id'] : 0;
                $term_name = isset($term['name']) ? (string) $term['name'] : '';
                if ($term_id <= 0) {
                    return null;
                }
                return artace_artist_photo_for_term($term_id, $term_name);
            } catch (Throwable $e) {
                return null;
            }
        },
        'schema'       => array(
            'description' => 'Artist profile photo URL, or null.',
            'type'        => array('string', 'null'),
            'context'     => array('view', 'embed'),
            'readonly'    => true,
        ),
    ));
});
