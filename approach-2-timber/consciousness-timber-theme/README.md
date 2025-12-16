# Consciousness Networks Timber Theme

A code-first WordPress theme using Timber and Twig templating for consciousness research content.

## Features

✅ **Twig Templating** - Write clean, maintainable templates
✅ **Code-First** - All templates in version control
✅ **Custom Post Types** - Research papers structure
✅ **Modern PHP** - Object-oriented architecture
✅ **Git-Friendly** - Separate logic from presentation

## Installation

### 1. Upload theme to WordPress

```bash
# From your local machine
cd approach-2-timber
scp -i ~/.ssh/LightsailDefaultKey-us-east-1.pem -r consciousness-timber-theme bitnami@52.0.124.233:/tmp/

# On server
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem bitnami@52.0.124.233
sudo mv /tmp/consciousness-timber-theme /bitnami/wordpress/wp-content/themes/
sudo chown -R daemon:daemon /bitnami/wordpress/wp-content/themes/consciousness-timber-theme
```

### 2. Install Composer dependencies

```bash
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem bitnami@52.0.124.233
cd /bitnami/wordpress/wp-content/themes/consciousness-timber-theme
sudo composer install
```

### 3. Activate theme

```bash
sudo /opt/bitnami/wp-cli/bin/wp theme activate consciousness-timber-theme
```

## Converting from Elementor

### Step 1: Export Elementor Content

```php
// In WordPress, add this to a custom plugin or functions.php temporarily
function export_elementor_to_html($post_id) {
    if (class_exists('\Elementor\Plugin')) {
        $document = \Elementor\Plugin::$instance->documents->get($post_id);
        return $document->get_content();
    }
    return get_post_field('post_content', $post_id);
}

// Export all pages
$pages = get_posts(['post_type' => 'page', 'numberposts' => -1]);
foreach ($pages as $page) {
    $html = export_elementor_to_html($page->ID);
    file_put_contents("/tmp/page-{$page->ID}.html", $html);
}
```

### Step 2: Convert to Standard WordPress Content

```bash
# Use WP-CLI to update pages with clean HTML
sudo /opt/bitnami/wp-cli/bin/wp post update 305 --post_content="$(cat /tmp/page-305-clean.html)"
```

### Step 3: Gradually Migrate

1. Start with one page
2. Test thoroughly
3. Deactivate Elementor for that page
4. Repeat for each page

## Theme Structure

```
consciousness-timber-theme/
├── style.css              # Theme metadata & base styles
├── functions.php          # Theme setup & Timber initialization
├── index.php              # Main template controller
├── composer.json          # PHP dependencies (Timber)
├── views/                 # Twig templates
│   ├── base.twig         # Base layout (header/footer)
│   ├── single.twig       # Single post/page
│   ├── archive.twig      # List of posts
│   └── partials/         # Reusable components
└── lib/                   # Custom PHP classes
```

## Twig Template Examples

### Creating a Custom Research Page Template

Create `views/page-research.twig`:

```twig
{% extends "base.twig" %}

{% block content %}
    <article class="research-page">
        <h1>{{ post.title }}</h1>

        {# Custom fields for research metadata #}
        <div class="research-meta">
            <p><strong>Research Category:</strong> {{ post.meta('category') }}</p>
            <p><strong>Date Published:</strong> {{ post.date }}</p>
        </div>

        {{ post.content }}

        {# Include related papers #}
        {% include "partials/related-research.twig" %}
    </article>
{% endblock %}
```

### Creating a Papers Archive

Create `views/archive-research_paper.twig`:

```twig
{% extends "base.twig" %}

{% block content %}
    <h1>Research Papers</h1>

    {% for paper in posts %}
        <article>
            <h2><a href="{{ paper.link }}">{{ paper.title }}</a></h2>
            <p>{{ paper.preview(150) }}</p>
        </article>
    {% endfor %}
{% endblock %}
```

## Development Workflow

### 1. Edit Twig Templates Locally

```bash
# Clone your theme repository
git clone your-repo/consciousness-timber-theme
cd consciousness-timber-theme

# Edit templates
code views/single.twig

# Commit changes
git add views/single.twig
git commit -m "Update single post template layout"
```

### 2. Deploy to Server

```bash
# Push to git
git push origin main

# On server, pull changes
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem bitnami@52.0.124.233
cd /bitnami/wordpress/wp-content/themes/consciousness-timber-theme
sudo -u daemon git pull origin main
```

### 3. Test Changes

```bash
# Clear WordPress cache if using caching plugin
sudo /opt/bitnami/wp-cli/bin/wp cache flush
```

## Key Benefits Over Elementor

| Feature | Elementor | Timber + Twig |
|---------|-----------|---------------|
| Version Control | ❌ JSON in database | ✅ Files in Git |
| Code Review | ❌ Not possible | ✅ Easy PRs |
| Local Development | ⚠️ Requires DB sync | ✅ Just edit files |
| Performance | ⚠️ Heavy JavaScript | ✅ Server-side only |
| Portability | ❌ Locked to WP+Elementor | ✅ Twig works anywhere |
| Learning Curve | ✅ Visual, easy | ⚠️ Requires Twig knowledge |

## Migration Checklist

- [ ] Install Timber plugin
- [ ] Upload custom theme
- [ ] Install Composer dependencies
- [ ] Activate theme (test on staging first)
- [ ] Convert one page from Elementor to clean HTML
- [ ] Test SEO (meta tags, structure)
- [ ] Test responsiveness
- [ ] Gradually migrate remaining pages
- [ ] Deactivate Elementor when done

## Troubleshooting

### Timber not found error
```bash
cd /bitnami/wordpress/wp-content/themes/consciousness-timber-theme
sudo composer install
```

### Templates not loading
Check Timber directories in functions.php:
```php
Timber::$dirname = ['views', 'templates'];
```

### Styling issues
The theme includes minimal CSS. Add your styles to style.css or enqueue additional stylesheets.
