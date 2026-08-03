<?php
add_action('rest_api_init', function () {
    register_rest_route('artace-test/v1', '/ping', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return new WP_REST_Response(['ok' => true], 200);
        },
    ]);
});