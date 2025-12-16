#!/bin/bash
# WP-CLI Bulk Operations Script
# Demonstrates batch operations on WordPress content

set -e

SSH_KEY="$HOME/.ssh/LightsailDefaultKey-us-east-1.pem"
SERVER="bitnami@52.0.124.233"
WP_CLI="sudo /opt/bitnami/wp-cli/bin/wp"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== WordPress Bulk Operations ===${NC}"

# Function to execute WP-CLI command
run_wp() {
    ssh -i "$SSH_KEY" "$SERVER" "$WP_CLI $@"
}

# 1. List all published pages
echo -e "\n${GREEN}1. Published Pages:${NC}"
run_wp post list --post_type=page --post_status=publish --fields=ID,post_title,post_date --format=table

# 2. Search content
echo -e "\n${GREEN}2. Search for 'quantum' in content:${NC}"
run_wp post list --post_type=page --s=quantum --fields=ID,post_title --format=table

# 3. Export specific posts
echo -e "\n${GREEN}3. Database export:${NC}"
run_wp db export - | wc -l
echo "  (Database exported and counted lines)"

# 4. Get site options
echo -e "\n${GREEN}4. Key site options:${NC}"
echo "  Site URL: $(run_wp option get siteurl)"
echo "  Active Theme: $(run_wp theme list --status=active --field=name)"
echo "  Active Plugins: $(run_wp plugin list --status=active --field=name | tr '\n' ', ')"

# 5. Post statistics
echo -e "\n${GREEN}5. Content Statistics:${NC}"
echo "  Total Pages: $(run_wp post list --post_type=page --format=count)"
echo "  Total Posts: $(run_wp post list --post_type=post --format=count)"
echo "  Published Pages: $(run_wp post list --post_type=page --post_status=publish --format=count)"
echo "  Draft Posts: $(run_wp post list --post_type=post --post_status=draft --format=count)"

echo -e "\n${BLUE}=== Operations Complete ===${NC}"
