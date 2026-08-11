# consciousnessnetworks.com

Next.js 14 frontend for Consciousness Networks, an independent research journal.
Content is authored in WordPress and read over the REST API; this application
renders it, owns the design, and handles routing, metadata, and the contact form.

## Architecture

```
Browser  ──►  Next.js (Vercel)  ──►  WordPress REST API (Lightsail)
                    │
                    └──►  /wp-content/uploads/*  proxied to WordPress over HTTPS
```

- **Frontend** — Next.js App Router, React server components, no client-side data
  fetching. Pages are statically generated and revalidated every 60 seconds.
- **Backend** — WordPress on Lightsail at `wp.consciousnessnetworks.com`, used
  headlessly. Editors work in Elementor; the frontend never links to it.
- **Media** — WordPress serves uploads over plain HTTP. `next.config.js` rewrites
  `/wp-content/uploads/*` to the backend so browsers only make HTTPS requests,
  and `toRelativeUrl()` rewrites URLs in content to match.
- **Email** — the contact form posts to `/api/contact`, which sends through Resend.

## Routing and languages

English is the canonical language and is served from the root; Spanish is served
under `/es`:

| Page     | English    | Spanish       |
| -------- | ---------- | ------------- |
| Research | `/`        | `/es`         |
| Papers   | `/papers`  | `/es/papers`  |
| About    | `/about`   | `/es/about`   |
| Contact  | `/contact` | `/es/contact` |
| Article  | `/<slug>`  | `/es/<slug>`  |

Routes live under the internal `app/[lang]` segment. `middleware.ts` rewrites
root paths to `/en/...` internally and permanently redirects any public `/en/...`
URL to its root form, so each page has exactly one indexable URL.

**Always build links with `localePath()` from `lib/site.ts`.** Hardcoding
`/en/...` sends every visitor and crawler through a redirect.

Interface copy is translated at author time in `lib/dictionaries.ts`. Article and
page bodies come from WordPress in English and are machine-translated by
`lib/i18n.ts` when `GEMINI_API_KEY` is set; without a key they fall back to
English and the rest of the page still renders in Spanish.

## Content coming from WordPress

`content.rendered` cannot be trusted to be a clean HTML fragment. Elementor's
text widget lets an editor paste an entire HTML document, and at least one
published page does exactly that. `sanitizeContent()` in `lib/wordpress.ts`:

- strips the document wrapper (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`,
  `<meta>`, `<title>`, `<link>`) and any `<script>`;
- scopes every rule of an embedded stylesheet under `.article-content`, so CSS
  written for a standalone page cannot restyle the site around it, and drops
  page-level `background`/`color` declarations that would fight the theme;
- demotes `<h1>` to `<h2>`, since the page already renders its own `<h1>`;
- rewrites media URLs to the HTTPS proxy path and internal links to the current
  locale;
- adds `loading`, `decoding`, and a fallback `alt` to body images.

## Local development

```bash
npm install
cp .env.example .env.local     # fill in what you need
npm run dev
```

The production WordPress host is not reachable from every network. To work
offline, or to get a deterministic dataset, run the mock backend:

```bash
npm run mock:wp                                                    # terminal 1
WORDPRESS_API_URL=http://127.0.0.1:8081/wp-json/wp/v2 npm run dev  # terminal 2
```

The mock serves the same endpoints and response shape as WordPress, using a real
captured page (`tests/fixtures/wp-page-papers.json`) plus representative posts —
including the pasted-full-document case the sanitiser has to survive.

## Checks

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit, strict mode
npm run build       # production build
npm run check:site  # crawl a running instance
```

`check:site` crawls every internal link from a running build and fails on dead
links, redirect hops on internal links, missing or duplicate canonicals, missing
titles or descriptions, incorrect heading structure, images without alt text,
incomplete hreflang sets, invalid JSON-LD, sitemap entries that redirect or 404,
and unknown paths that fail to return 404.

```bash
npm run build && npm start        # terminal 1
npm run check:site                # terminal 2
```

## Environment variables

| Variable                   | Required | Purpose                                                             |
| -------------------------- | -------- | ------------------------------------------------------------------- |
| `WORDPRESS_API_URL`        | no       | REST API root. Defaults to the production backend.                   |
| `WORDPRESS_UPLOADS_ORIGIN` | no       | Origin proxied for `/wp-content/uploads`.                            |
| `RESEND_API_KEY`           | yes      | Contact form delivery. Without it `/api/contact` returns 503.        |
| `CONTACT_EMAIL`            | no       | Recipient address. Defaults to `contact@consciousnessnetworks.com`.  |
| `CONTACT_FROM`             | no       | Sender identity registered with Resend.                              |
| `GEMINI_API_KEY`           | no       | Machine translation of article bodies into Spanish.                  |
| `GEMINI_MODEL`             | no       | Overrides the translation model.                                     |

## Deployment

Vercel builds and deploys `main` automatically. Work on a branch and open a pull
request; do not push directly to `main`.

## Layout

```
app/
  [lang]/            locale segment — all pages live here
    [slug]/          article pages
    papers/          reading list, backed by the WordPress "papers" page
    about/           backed by the WordPress "about" page
    contact/         contact form
    layout.tsx       document shell, locale validation, default metadata
    opengraph-image.tsx
  api/contact/       contact form handler
  llms.txt/          plain-text index for answer engines
  robots.ts
  sitemap.ts
components/          SiteHeader, SiteFooter, EditorialPage, ContactForm, JsonLd
lib/
  site.ts            URL and locale helpers — the source of truth for links
  dictionaries.ts    interface copy, per locale
  wordpress.ts       REST client, text helpers, content sanitiser
  schema.ts          schema.org graph builders
  i18n.ts            machine translation of WordPress bodies
scripts/             mock WordPress backend, site crawler
styles/              design tokens and typography
```
