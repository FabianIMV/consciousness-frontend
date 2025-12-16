<?php
/**
 * Main template file
 *
 * This is the fallback template for Timber.
 * It loads the corresponding Twig template.
 */

$context = Timber::context();

// Get posts for the current query
$context['posts'] = Timber::get_posts();

// Check if we're on a single post or archive
if (is_singular()) {
    // Single post/page
    $context['post'] = Timber::get_post();
    $templates = ['single-' . $context['post']->post_type . '.twig', 'single.twig', 'base.twig'];
} else {
    // Archive/list view
    $templates = ['archive.twig', 'index.twig', 'base.twig'];
}

// Render the Twig template
Timber::render($templates, $context);
