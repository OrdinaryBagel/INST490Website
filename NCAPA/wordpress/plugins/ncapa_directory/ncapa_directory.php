<?php
/**
 * Plugin Name: NCAPA Directory
 * Description: Custom congressional directory plugin.
 * version: 1.0
 */

defined('ABSPATH') || exit;

function ncapa_hello() {
    return '<h2>NCAPA Directory Plugin is working!</h2>';
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