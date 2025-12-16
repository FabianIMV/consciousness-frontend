#!/bin/bash
# WP-CLI Script: Create a new consciousness research post
# Usage: ./create-post.sh "Post Title" "post-slug" "/path/to/content.html"

set -e

# Configuration
SSH_KEY="$HOME/.ssh/LightsailDefaultKey-us-east-1.pem"
SERVER="bitnami@52.0.124.233"
WP_CLI="sudo /opt/bitnami/wp-cli/bin/wp"

POST_TITLE="${1:-Untitled Post}"
POST_SLUG="${2:-untitled-post}"
CONTENT_FILE="${3}"

if [ -z "$CONTENT_FILE" ] || [ ! -f "$CONTENT_FILE" ]; then
    echo "Error: Content file not provided or doesn't exist"
    echo "Usage: $0 'Post Title' 'post-slug' '/path/to/content.html'"
    exit 1
fi

# Read content from file
CONTENT=$(cat "$CONTENT_FILE")

# Escape content for command line
CONTENT_ESCAPED=$(echo "$CONTENT" | sed "s/'/'\\\\''/g")

echo "Creating post: $POST_TITLE"
echo "Slug: $POST_SLUG"

# Create post via SSH + WP-CLI
POST_ID=$(ssh -i "$SSH_KEY" "$SERVER" "$WP_CLI post create \
    --post_type=post \
    --post_title='$POST_TITLE' \
    --post_name='$POST_SLUG' \
    --post_content='$CONTENT_ESCAPED' \
    --post_status=draft \
    --porcelain")

echo "✓ Post created successfully!"
echo "  ID: $POST_ID"
echo "  URL: https://consciousnessnetworks.com/?p=$POST_ID"
echo ""
echo "To publish: ssh -i $SSH_KEY $SERVER \"$WP_CLI post update $POST_ID --post_status=publish\""
