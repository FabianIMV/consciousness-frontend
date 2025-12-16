# Approach 3: Headless WordPress + Next.js

## Overview

Completely separate your WordPress backend from your frontend. WordPress becomes a pure content API, while Next.js handles all presentation and user experience.

## Architecture

```
┌─────────────────────────────────────┐
│   WordPress (Backend Only)          │
│   - Content Management              │
│   - REST API                        │
│   - Admin Interface                 │
│   - consciousnessnetworks.com/wp-   │
└───────────────┬─────────────────────┘
                │ REST API
                │ (JSON)
┌───────────────▼─────────────────────┐
│   Next.js Frontend                  │
│   - Static Site Generation          │
│   - React Components                │
│   - Tailwind CSS                    │
│   - consciousnessnetworks.com       │
└─────────────────────────────────────┘
```

## Pros

✅ **Complete frontend control** - Build any UI with React
✅ **Best performance** - Static generation + edge caching
✅ **Modern developer experience** - React, TypeScript, Tailwind
✅ **Scalability** - Frontend and backend scale independently
✅ **Flexibility** - Can switch backends or add multiple data sources
✅ **SEO optimized** - Server-side rendering built-in
✅ **Version controlled** - All frontend code in Git
✅ **No WordPress theme complexity** - Clean separation

## Cons

❌ **Higher complexity** - Need to manage two applications
❌ **Requires deployment** - Need hosting for Next.js (Vercel/Netlify)
❌ **Initial setup time** - More upfront work
❌ **Learning curve** - Need React/Next.js knowledge
❌ **Content preview** - Harder to preview before publish

## Setup Instructions

### 1. Install Dependencies

```bash
cd consciousness-frontend
npm install
npm install @tailwindcss/typography
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local if needed
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your site!

### 4. Test with Your WordPress Data

The app automatically fetches from `consciousnessnetworks.com/wp-json/wp/v2`.
Your research pages will appear on the homepage.

## Project Structure

```
consciousness-frontend/
├── app/
│   ├── layout.tsx              # Root layout (HTML structure)
│   ├── page.tsx                # Homepage (list of articles)
│   ├── globals.css             # Global styles
│   └── research/
│       └── [slug]/
│           └── page.tsx        # Dynamic article pages
├── lib/
│   └── wordpress.ts            # WordPress API client
├── components/                 # Reusable React components
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Key Features

### 1. Static Site Generation (SSG)

Pages are pre-rendered at build time for maximum performance:

```typescript
// Automatically generates static pages for all research articles
export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map(page => ({ slug: page.slug }));
}
```

### 2. Incremental Static Regeneration (ISR)

Content updates every 60 seconds without rebuilding:

```typescript
fetch(url, {
  next: { revalidate: 60 } // Refresh every 60 seconds
});
```

### 3. WordPress REST API Integration

Fetches content from your existing WordPress:

```typescript
import { getPages, getPageBySlug } from '@/lib/wordpress';

const pages = await getPages();
const article = await getPageBySlug('quantum-consciousness');
```

## Deployment Options

### Option 1: Vercel (Recommended - Free Tier Available)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd consciousness-frontend
vercel --prod
```

- Automatic deployments from Git
- Edge caching worldwide
- Zero configuration
- Free SSL
- **Cost:** Free for hobby projects

### Option 2: Netlify (Free Tier Available)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd consciousness-frontend
netlify deploy --prod
```

### Option 3: Static Export to S3/CloudFront

```bash
# Update next.config.js
# Add: output: 'export'

# Build static site
npm run build

# Upload to S3
aws s3 sync ./out s3://your-bucket-name
```

### Option 4: Self-Host on Your Lightsail Instance

```bash
# On your Lightsail instance
cd /opt/bitnami
git clone your-repo/consciousness-frontend
cd consciousness-frontend
npm install
npm run build

# Use PM2 to keep it running
sudo npm install -g pm2
pm2 start npm --name "consciousness-frontend" -- start
pm2 save
pm2 startup

# Configure Apache/Nginx reverse proxy
# Proxy requests from consciousnessnetworks.com to localhost:3000
```

## WordPress Configuration for Headless

### 1. Enable REST API (Already Enabled)

Your WordPress REST API is accessible at:
- https://consciousnessnetworks.com/wp-json/
- https://consciousnessnetworks.com/wp-json/wp/v2/pages
- https://consciousnessnetworks.com/wp-json/wp/v2/posts

### 2. Configure CORS (If Needed)

Add to WordPress `wp-config.php`:

```php
// Allow REST API access from Next.js frontend
header('Access-Control-Allow-Origin: https://your-nextjs-domain.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### 3. Set Up Application Passwords (For Private Content)

If you need to fetch draft/private content:

1. WordPress Admin → Users → Your Profile
2. Scroll to "Application Passwords"
3. Create new password
4. Add to `.env.local`:

```bash
WP_APP_USERNAME=your-username
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

## Development Workflow

### 1. Content Editors Use WordPress

Content team continues using WordPress admin:
- Write articles in WordPress
- Use Gutenberg or Elementor
- Publish when ready
- Content immediately available via API

### 2. Developers Work on Frontend

```bash
# Make changes to React components
code app/page.tsx

# See changes instantly
npm run dev

# Commit to version control
git add .
git commit -m "Update homepage layout"
git push

# Auto-deploys to production (if using Vercel/Netlify)
```

### 3. Automatic Updates

- **With ISR:** Site refreshes every 60 seconds automatically
- **With webhook:** Trigger rebuild when content published in WordPress

#### Set Up Webhook (Vercel Example)

Install plugin in WordPress:
```bash
sudo /opt/bitnami/wp-cli/bin/wp plugin install wp-webhooks --activate
```

Configure webhook:
- Trigger: Post Published
- URL: `https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID`
- Method: POST

## Migrating Content

### Current Setup (Elementor Pages)

Your pages use Elementor, which stores content as JSON metadata.

### Migration Strategy

1. **Gradual Migration**
   - Keep WordPress + Elementor for editing
   - Next.js renders the HTML output
   - Elementor JSON converted to HTML by WordPress
   - Next.js fetches rendered HTML

2. **Full Migration** (Advanced)
   - Export Elementor pages to clean HTML/Markdown
   - Store content in MDX files or Headless CMS
   - Remove WordPress entirely
   - Use Contentful/Sanity as CMS

## Performance Comparison

| Metric | Traditional WP | Headless Next.js |
|--------|---------------|------------------|
| Time to First Byte | 800ms | 50ms |
| First Contentful Paint | 1.5s | 0.8s |
| Lighthouse Score | 65 | 95+ |
| Hosting Cost | $15-50/mo | $0-20/mo |
| Scalability | Limited | Excellent |

## SEO Considerations

### ✅ SEO Optimized Out of the Box

1. **Server-Side Rendering** - Googlebot sees full HTML
2. **Meta Tags** - Automatic from WordPress data
3. **Sitemap** - Generate with `next-sitemap`
4. **Structured Data** - Add JSON-LD easily
5. **URL Structure** - Clean, semantic URLs

### Maintain SEO During Migration

```typescript
// Add redirects in next.config.js
redirects: async () => [
  {
    source: '/:path*',
    destination: 'https://new-domain.com/:path*',
    permanent: true,
  },
]
```

## Cost Comparison

| Solution | Monthly Cost |
|----------|--------------|
| Current (Lightsail + WP) | ~$10-20 |
| + Vercel (Free tier) | $0 (hobby) |
| + Vercel (Pro) | $20 |
| + Netlify (Free tier) | $0 |
| Total | $10-40/mo |

## Migration Checklist

- [ ] Set up Next.js project locally
- [ ] Test fetching data from WordPress API
- [ ] Build homepage component
- [ ] Build article page component
- [ ] Add SEO meta tags
- [ ] Test all existing URLs work
- [ ] Set up deployment (Vercel/Netlify)
- [ ] Configure custom domain
- [ ] Test on mobile devices
- [ ] Set up analytics
- [ ] Configure 301 redirects if needed
- [ ] Update sitemap
- [ ] Monitor Google Search Console

## Best For

- **Modern, fast websites** with great UX
- **Developer-first** workflows
- **High-traffic** sites needing performance
- **Multi-platform** content (web + mobile app)
- **Complex frontend** requirements
- **Long-term scalability**

## Not Ideal For

- **Simple blogs** (overkill)
- **Non-technical users** managing alone
- **Frequent design changes** by non-developers
- **Tight deadlines** (higher initial effort)
