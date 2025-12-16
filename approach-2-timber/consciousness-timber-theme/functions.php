<?php
/**
 * Consciousness Networks Timber Theme
 *
 * This theme uses Timber for Twig templating.
 * All templates are in the /views directory.
 */

// Load Composer dependencies (Timber)
require_once __DIR__ . '/vendor/autoload.php';

// Initialize Timber
$timber = new Timber\Timber();

// Set the directories where Twig templates live
Timber::$dirname = ['views', 'templates'];

/**
 * Theme setup
 */
class ConsciousnessTimberTheme {

    public function __construct() {
        add_action('after_setup_theme', [$this, 'theme_supports']);
        add_filter('timber/context', [$this, 'add_to_context']);
        add_filter('timber/twig', [$this, 'add_to_twig']);
    }

    /**
     * Add theme supports
     */
    public function theme_supports() {
        add_theme_support('title-tag');
        add_theme_support('post-thumbnails');
        add_theme_support('menus');
        add_theme_support('html5', [
            'comment-list',
            'comment-form',
            'search-form',
            'gallery',
            'caption',
        ]);

        // Register navigation menus
        register_nav_menus([
            'primary' => __('Primary Menu', 'consciousness-timber'),
        ]);
    }

    /**
     * Add global context variables available in all Twig templates
     */
    public function add_to_context($context) {
        // Site info
        $context['site'] = new Timber\Site();

        // Navigation menu
        $context['menu'] = new Timber\Menu('primary');

        // Custom site data
        $context['site_tagline'] = 'Mapping the architecture of interconnected cosmic consciousness';

        return $context;
    }

    /**
     * Add custom Twig functions
     */
    public function add_to_twig($twig) {
        // Add custom Twig filter for formatting dates
        $twig->addFilter(new \Twig\TwigFilter('format_research_date', function($date) {
            return date('F j, Y', strtotime($date));
        }));

        // Add custom function for research paper links
        $twig->addFunction(new \Twig\TwigFunction('research_link', function($paper_id) {
            return home_url("/papers/{$paper_id}");
        }));

        return $twig;
    }
}

new ConsciousnessTimberTheme();

/**
 * Custom post type for Research Papers
 */
function register_research_papers_cpt() {
    register_post_type('research_paper', [
        'labels' => [
            'name' => 'Research Papers',
            'singular_name' => 'Research Paper',
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true, // Enable Gutenberg & REST API
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
        'rewrite' => ['slug' => 'papers'],
    ]);
}
add_action('init', 'register_research_papers_cpt');

/**
 * Add custom fields to posts (using Advanced Custom Fields or similar)
 * This is where you'd add metadata for consciousness research
 */
function get_post_metadata($post_id) {
    return [
        'research_category' => get_post_meta($post_id, 'research_category', true),
        'quantum_relevance' => get_post_meta($post_id, 'quantum_relevance', true),
        'publication_date' => get_post_meta($post_id, 'publication_date', true),
    ];
}
