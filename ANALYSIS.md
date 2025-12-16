# WordPress Code-First Migration Analysis
## consciousnessnetworks.com

**Date:** 2025-12-15

## Current Setup Analysis

### Infrastructure
- **Platform:** AWS Lightsail (Bitnami WordPress Stack)
- **WordPress Version:** 6.8.3
- **PHP Version:** 8.2.28
- **Server:** Bitnami (Apache/PHP-FPM)
- **Database:** bitnami_wordpress
- **WP-CLI:** Installed at `/opt/bitnami/wp-cli/bin/wp`

### Active Theme & Plugins
- **Theme:** Astra 4.11.10 (active)
- **Page Builder:** Elementor 3.30.2 (active)
- **Other Plugins:**
  - Pojo Accessibility 3.5.0
  - Ocean Extra 2.5.0
  - Complianz GDPR
  - WPForms Lite

### Content Structure
**IMPORTANT FINDING:** Content is stored as **PAGES** (not posts), built with Elementor:

| ID  | Title | Type |
|-----|-------|------|
| 305 | Quantum-Entangled Higher States of Consciousness: 2025 Research Update | Page |
| 269 | The Reticular Matrix Revealed: December 2025 Quantum Research | Page |
| 218 | Quantum Entanglement and Consciousness Research | Page |
| 201 | AI Consciousness: A Bridge to Universal Awareness | Page |
| 173 | The Emerging Consciousness Phenomenon in LLMs | Page |

**Static Pages:**
- Home (ID: 51) - Set as front page
- About (ID: 18)
- Contact (ID: 20)
- Papers Must Read (ID: 2)

### Key Challenges for Code-First Migration

1. **Elementor Dependency:** Content is stored as JSON in post meta, not standard HTML
2. **Pages vs Posts:** Using pages instead of blog posts (non-standard for blogging)
3. **SEO Requirements:** Must maintain Google indexing during migration
4. **Visual Builder Lock-in:** Elementor content not easily portable to code

## Evaluation Plan

### Approach 1: Timber + Twig
- Keep WordPress backend
- Replace Elementor with Twig templates
- Requires converting Elementor JSON to Twig
- Code-first template management

### Approach 2: Headless WordPress + Next.js
- WordPress as API only
- React/Next.js frontend
- Full code control
- Better performance potential

### Approach 3: Enhanced WP-CLI Automation
- Keep current structure
- Automate with WP-CLI scripts
- Less invasive
- Easier migration path

---
*Testing begins below...*
