<?php
/**
 * Plugin Name: NCAPA Directory
 * Description: Custom congressional directory plugin.
 * version: 1.0
 */

defined('ABSPATH') || exit;

function ncapa_hello() {
    return '<h2>NCAPA Directory Plug in working!</h2>';
}

add_shortcode('ncapa_test', 'ncapa_hello');


/**
 * Database connection for ncapa
 */

function ncapa_display_members() {
    $db = new wpdb (
        NCAPA_DB_USER,
        NCAPA_DB_PASSWORD,
        NCAPA_DB_NAME,
        NCAPA_DB_HOST
    );

    $members = $db->get_results(
        "SELECT first_name, last_name FROM members LIMIT 10"
    );

    if ($db->last_error) {
        return '<p>Database query has failed</p>';
    }


    // Check whether members exist
    if (empty($members)) {
        return '<p>No congressional members found.</p>';
    }

    $output = '<h2>Congressional Members</h2>';
    $output .= '<ul>';

    foreach ($members as $member) {
        $output .= '<li>' .
            esc_html($member->first_name . ' ' . $member->last_name) . 
            '</li>';
    }

    $output .= '</ul>';

    return $output;

}


add_shortcode('ncapa_members', 'ncapa_display_members');

add_action('rest_api_init', function() {
    register_rest_route(
        '/ncapa/v1', '/states', [
            'methods' => 'GET',
            'callback' => 'ncapa_get_all_states',
            'permission_callback' => '__return_true'
        ]);
    register_rest_route(
        'ncapa/v1',
        '/states/(?P<state_code>[A-Za-z]{2})',
        [
            'methods' => 'GET',
            'callback' => 'ncapa_get_state',
            'permission_callback' => '__return_true'
        ]
    );
});

function ncapa_get_all_states(WP_REST_Request $request) {
    $db = new wpdb(
        NCAPA_DB_USER,
        NCAPA_DB_PASSWORD,
        NCAPA_DB_NAME,
        NCAPA_DB_HOST
    );

    if (!$db->ready) {
        throw new WP_Error(
            'db_error',
            'Unables to connect to db',
            ['status' => 500]
        );
    }

    $states = $db->get_results(
        "SELECT state_id, state_name, state_code
        FROM states
        ORDER BY state_name ASC
        ",
        ARRAY_A
    );

    if ($db->last_error) {
        return new WP_Error(
            'db_error',
            'Unable to retrieve states',
            ['status' => 500]
        );
    }

    return new WP_REST_Response([
        'states' => $states
    ], 200);
}

 
function ncapa_get_state(WP_REST_Request $request) {
    // transform sent state code to upper case 
    $state_code = strtoupper($request['state_code']);

    // connect to mysql db
    $db = new wpdb(
        NCAPA_DB_USER,
        NCAPA_DB_PASSWORD,
        NCAPA_DB_NAME,
        NCAPA_DB_HOST
    );

    // retrieve state information by query and represents returned record as an associative array 
    $state = $db->get_row(
        $db->prepare(
            "SELECT state_id, state_name, state_code
            FROM states
            WHERE state_code = %s",
            $state_code
        ),
        ARRAY_A
    );


    if ($db->last_error) {
        return new WP_Error(
            'database_error',
            'Unable to retrieve state.',
            ['status' => 500]
        );
    }

    // if state var is empty returns error 
    if (!$state) {
        return new WP_Error(
            'state_not_found',
            'State does not exist',
            ['status' => 404]
        );
    }

    // queries members table and stores in array
    $members = $db->get_results(
        $db->prepare(
            "SELECT
                m.member_id,
                m.first_name,
                m.last_name,
                m.bioguide_id,
                m.party,
                m.chamber,
                m.term_start,
                m.term_end,
                m.website,
                m.phone,
                d.district_number
            FROM members m
            LEFT JOIN districts d
                ON m.district_id = d.district_id
            WHERE m.state_id = %d
            ORDER BY m.last_name",
            $state['state_id']
        ),
        ARRAY_A
    );


    if ($db->last_error) {
        return new WP_Error(
            'database_error',
            'Unable to retrieve members',
            ['status' => 500]
        );
    }

    // returns as json object 
    return new WP_REST_Response([
        'state' => [
            'id' => (int) $state['state_id'],
            'name' => $state['state_name'],
            'code' => $state['state_code']
        ],
        'members' => $members
    ], 200);
}

// everything below is needed to actually load my js html and css throught wordpress 
add_filter('template_include', function($template) {
    if (isset($_GET['ncapa_states'])) {
        return plugin_dir_path(__FILE__) . 'templates/state-list-page.php';
    }
    if (!is_admin() && isset($_GET['ncapa_state'])) {
        return plugin_dir_path(__FILE__) . 
            'templates/state-page.php';
    }

    return $template;
});

// load css and js script so wordpress can use them 
add_action('wp_enqueue_scripts', function() {
    if (!is_admin() && isset($_GET['ncapa_state'])) {
        wp_enqueue_style(
            'ncapa-state-css',
            plugin_dir_url(__FILE__) . 'assets/css/state-page.css',
            [],
            '1.0'
        );

        wp_enqueue_script(
            'ncap-state-js',
            plugin_dir_url(__FILE__) . 'js/state-page.js',
            [],
            '1.0',
            true
        );
    }

    if (!is_admin() && isset($_GET['ncapa_states'])) {
            wp_enqueue_script(
                'ncapa-state-list-js',
                plugin_dir_url(__FILE__) . 'js/state-list-page.js',
                [],
                '1.3',
                true
        );
    }
});