<?php
/**
 * Plugin Name: Artace Blog Clusters (REST)
 * Description: Adds two read-only fields to blog posts in the REST API
 * (/wp-json/wp/v2/posts) so the headless storefront can group the blog
 * archive into topic clusters:
 *
 *   - `artace_pillar` (bool): true when the post is ticked as
 *     "This post is Pillar Content" in Rank Math. Each pillar post is a
 *     cornerstone and creates a cluster on /blogs.
 *   - `artace_primary_category` (int): Rank Math's primary category term ID,
 *     or 0 when unset. A cornerstone's cluster is named after this category;
 *     without it the storefront uses the post's most specific category.
 *
 * Read-only on purpose: Rank Math keeps saving these values itself, and
 * nothing written through the REST API can change them.
 *
 * Install: copy into wp-content/mu-plugins/ on api.artacestudio.com.
 * Changes reach /blogs within ~10 minutes (REST cache + storefront revalidate).
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_field('post', 'artace_pillar', array(
        'get_callback' => function ($post) {
            return get_post_meta((int) $post['id'], 'rank_math_pillar_content', true) === 'on';
        },
        'schema' => array(
            'description' => 'Rank Math pillar (cornerstone) content flag.',
            'type'        => 'boolean',
            'context'     => array('view', 'edit'),
            'readonly'    => true,
        ),
    ));

    register_rest_field('post', 'artace_primary_category', array(
        'get_callback' => function ($post) {
            $term_id = (int) get_post_meta((int) $post['id'], 'rank_math_primary_category', true);
            if ($term_id <= 0) {
                return 0;
            }
            // Only report it if the post is still actually in that category.
            return has_term($term_id, 'category', (int) $post['id']) ? $term_id : 0;
        },
        'schema' => array(
            'description' => 'Rank Math primary category term ID (0 when unset).',
            'type'        => 'integer',
            'context'     => array('view', 'edit'),
            'readonly'    => true,
        ),
    ));
});
