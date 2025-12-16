# Approach 1: WP-CLI Automation

## Overview
Manage WordPress content entirely from the command line using WP-CLI. This approach keeps your existing WordPress setup but enables code-first workflows.

## Pros
✅ **Non-invasive** - Works with existing setup
✅ **Version controllable** - All operations scriptable
✅ **Automatable** - Easy CI/CD integration
✅ **No learning curve** - Standard WordPress underneath
✅ **SEO friendly** - No structural changes

## Cons
❌ **Elementor compatibility** - Still relies on page builder for complex layouts
❌ **Limited templating** - Can't control presentation layer easily
❌ **SSH dependency** - Requires server access for each operation
❌ **Not truly code-first** - Content still in database, not files

## Setup

### 1. Make scripts executable
```bash
chmod +x *.sh
```

### 2. Create a new post
```bash
./create-post.sh "My Post Title" "my-post-slug" "./sample-content.html"
```

### 3. Run bulk operations
```bash
./bulk-operations.sh
```

## Key WP-CLI Commands

### Content Management
```bash
# Create post
wp post create --post_title="Title" --post_content="Content" --post_status=publish

# Update post
wp post update 123 --post_content="New content"

# List posts
wp post list --post_type=post --format=table

# Delete post
wp post delete 123 --force
```

### Export/Import
```bash
# Export all content
wp export --dir=/tmp/export

# Import content
wp import export.xml --authors=create

# Database backup
wp db export backup.sql
```

### Plugin & Theme Management
```bash
# Install plugin
wp plugin install timber-library --activate

# Update all plugins
wp plugin update --all

# Activate theme
wp theme activate astra
```

## Workflow Example

### Creating a Series of Posts from Markdown Files

```bash
#!/bin/bash
# convert-markdown-posts.sh

for md_file in posts/*.md; do
    title=$(head -1 "$md_file" | sed 's/^# //')
    slug=$(basename "$md_file" .md)

    # Convert markdown to HTML (requires pandoc)
    html=$(pandoc "$md_file" -t html)

    # Create post
    ./create-post.sh "$title" "$slug" <(echo "$html")
done
```

## Migration Path from Elementor

If you want to move away from Elementor:

1. **Export Elementor content as HTML**
   ```bash
   wp post list --post_type=page --format=ids | xargs -I % wp post get % --field=post_content > page-%.html
   ```

2. **Convert to standard WordPress posts**
   - Strip Elementor shortcodes
   - Clean HTML
   - Re-import as regular posts

3. **Gradually migrate pages** one at a time

## Best For

- **Quick automation** without changing architecture
- **Content pipelines** that feed into WordPress
- **Backup/restore** workflows
- **Maintaining existing Elementor** site while adding code-first capabilities

## Not Ideal For

- **Full control** over frontend presentation
- **Modern React/Vue** workflows
- **Completely code-based** content (still uses DB)
- **Headless** architectures
