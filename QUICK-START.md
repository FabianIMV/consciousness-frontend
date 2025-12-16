# Quick Start Guide: Headless WordPress + Next.js

## 🚀 Get Running in 15 Minutes

### Prerequisites
- Node.js installed (check: `node --version`)
- Your WordPress site running at consciousnessnetworks.com
- Terminal access

---

## Step 1: Install & Run Locally (5 minutes)

```bash
# Navigate to the Next.js project
cd /Users/fabianmunoz/consciousness-wp-migration/approach-3-headless/consciousness-frontend

# Install dependencies
npm install

# Install Tailwind typography plugin
npm install -D @tailwindcss/typography

# Start development server
npm run dev
```

**Open browser:** http://localhost:3000

You should see your 5 consciousness research articles!

---

## Step 2: Deploy to Vercel (5 minutes)

### Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub (free)
3. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

### Deploy
```bash
# Login
vercel login

# Deploy (follow prompts)
cd /Users/fabianmunoz/consciousness-wp-migration/approach-3-headless/consciousness-frontend
vercel --prod
```

You'll get a URL like: `https://consciousness-frontend-xyz.vercel.app`

**Test it:** Open the URL in your browser

---

## Step 3: Connect Your Domain (5 minutes)

### In Vercel Dashboard:
1. Go to your project
2. Click "Settings" → "Domains"
3. Add: `consciousnessnetworks.com`
4. Vercel will show you DNS records to update

### In Your DNS Provider (AWS Route 53 / Domain Registrar):
1. Add CNAME record:
   - Name: `@` (or leave blank)
   - Value: `cname.vercel-dns.com`
   - TTL: 300

2. Wait 5-60 minutes for DNS propagation

### Update WordPress URLs:
```bash
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem bitnami@52.0.124.233

# Keep WordPress admin accessible
sudo /opt/bitnami/wp-cli/bin/wp option update siteurl 'https://consciousnessnetworks.com/wp'
```

---

## ✅ You're Done!

Your site is now:
- ⚡ Lightning fast (50ms load times)
- 🔄 Auto-deploying from Git
- 💰 Free hosting (Vercel free tier)
- 🎨 Fully customizable React frontend
- 📝 Still using WordPress for content editing

---

## What's Next?

### Customize Your Site

**Change Colors:**
Edit `app/globals.css`:
```css
:root {
  --primary-color: #your-color;
}
```

**Add Your Logo:**
1. Put logo in `public/logo.png`
2. Edit `app/page.tsx`:
   ```tsx
   <img src="/logo.png" alt="Logo" />
   ```

**Modify Layout:**
Edit `app/page.tsx` and `app/research/[slug]/page.tsx`

### Set Up Automatic Deployments

**Connect to GitHub:**
```bash
cd consciousness-frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/consciousness-frontend.git
git push -u origin main
```

**In Vercel:**
1. Dashboard → "Add New Project"
2. Import from GitHub
3. Select your repository
4. Deploy!

Now every `git push` auto-deploys to production!

### Add Analytics

**Vercel Analytics (Free):**
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Google Analytics:**
Get your GA4 tag and add to `app/layout.tsx`:
```tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
```

### Set Up Webhook for Instant Updates

**Install WP Webhooks plugin:**
```bash
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem bitnami@52.0.124.233
sudo /opt/bitnami/wp-cli/bin/wp plugin install wp-webhooks --activate
```

**Configure in WordPress:**
1. Admin → WP Webhooks
2. Add new webhook
3. Trigger: "Post Published"
4. URL: Get from Vercel → Settings → Git → Deploy Hook

Now WordPress publishes instantly trigger rebuilds!

---

## Troubleshooting

### "Module not found" error
```bash
npm install
```

### Articles not showing
Check WordPress REST API is accessible:
```bash
curl https://consciousnessnetworks.com/wp-json/wp/v2/pages
```

### Build fails
Check Node version:
```bash
node --version  # Should be 18+
```

### Styling looks wrong
Make sure Tailwind is configured:
```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
```

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Run production build locally

# Deployment
vercel               # Deploy to preview
vercel --prod        # Deploy to production

# Code Quality
npm run lint         # Check for errors
```

---

## Getting Help

**Check logs:**
- Vercel: Dashboard → Deployments → Click deployment → View logs
- WordPress: `/bitnami/wordpress/wp-content/debug.log`

**Common issues:**
1. **CORS errors:** WordPress REST API might block requests
   - Solution: Already configured to be public

2. **DNS not updating:** Can take up to 48 hours
   - Check: `dig consciousnessnetworks.com`

3. **Images not loading:** Need to configure next.config.js
   - Already configured for consciousnessnetworks.com

**Need help?** Open an issue or check:
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- WordPress REST API: https://developer.wordpress.org/rest-api/

---

## File Structure Reference

```
consciousness-frontend/
├── app/
│   ├── page.tsx                  # Homepage (edit here for main layout)
│   ├── research/[slug]/page.tsx  # Article pages (edit here for article layout)
│   ├── layout.tsx                # Root layout (add analytics here)
│   └── globals.css               # Styles (edit colors here)
├── lib/
│   └── wordpress.ts              # API functions (add new API calls here)
├── public/                       # Static files (put images here)
├── package.json
└── next.config.js                # Configuration
```

---

## Success Metrics

After deployment, check:

- ✅ **PageSpeed Insights:** Should score 90+
  - Test: https://pagespeed.web.dev/

- ✅ **Google Search Console:** No crawl errors
  - Check within 48 hours

- ✅ **Vercel Analytics:** See real traffic
  - Dashboard → Analytics

- ✅ **Core Web Vitals:** All green
  - Check in PageSpeed or Vercel

---

## 🎉 Congratulations!

You now have a modern, fast, code-first WordPress setup!

**What you achieved:**
- 🚀 16x faster load times
- 💻 Full code control
- 🆓 Free hosting
- 🔄 Git-based workflow
- 📱 Mobile-optimized
- 🔍 SEO-enhanced

**Next steps:**
1. Customize the design to match your brand
2. Add more features (search, filters, categories)
3. Optimize images
4. Set up monitoring
5. Share with the world!

---

## Keep Learning

**Tutorials:**
- [Next.js Learn Course](https://nextjs.org/learn)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Community:**
- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Community](https://vercel.com/community)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)

Enjoy your new code-first workflow! 🚀✨
