<?php
defined('ABSPATH') || exit;
get_header();
?>

<main class="ncapa-state">
    <a href="/?ncapa_states" class="back-link">
       ← Back to States List
    </a>

    <header class="state-header">
        <h1 id="state-name">Loading...</h1>
        <p>Congressional representation, community demographics, and civic engagement</p>
    </header>

    <section class="state-stats">
        <div class="state-card">
            <h3>Total Population</h3>
            <p id="population-count">--</p>
        </div>

        <div class="state-card">
            <h3>U.S Senators</h3>
            <p id="senator-count">--</p>
        </div>

        <div class="state-card">
            <h3>U.S House of Representatives</h3>
            <p id="rep-count">--</p>
        </div>
    </section>

    <section class="congress-section">
        <h2 id="senator-overview-title">U.S. Senators</h2>
        <div id="senators-list"></div>

        <h2 id="representative-overview-title">U.S. Representatives</h2>
        <div id="representatives-list"></div>
    </section>

    <section class="demographics-section">
        <h2>Key Demographics</h2>
        <p>Demographic information coming soon maybe hopefully!!!</p>
    </section>
</main>

<?php get_footer(); ?>