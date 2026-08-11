# Working on this repository

## Workflow

`main` deploys to production automatically. Never push to it directly.

```bash
git checkout -b <short-descriptive-branch>
# make the change
npm run lint && npm run typecheck && npm run build
git commit
git push -u origin <branch>
# open a pull request
```

Before merging anything that touches routing, metadata, or WordPress content
handling, run the crawler against a production build:

```bash
npm run mock:wp                                                      # terminal 1
WORDPRESS_API_URL=http://127.0.0.1:8081/wp-json/wp/v2 npm run build
npm start                                                            # terminal 2
npm run check:site                                                   # terminal 3
```

## Where to make a change

| I want to change…                    | Edit                                            |
| ------------------------------------ | ----------------------------------------------- |
| Article or page text                 | WordPress, not this repository                   |
| Navigation, buttons, labels, errors  | `lib/dictionaries.ts` (both locales)             |
| Colours, type, spacing               | `styles/tokens.css`                              |
| Component appearance                 | `app/globals.css`                                |
| Article body styling                 | `styles/typography.css`, `.article-content`      |
| Header or footer                     | `components/SiteHeader.tsx`, `SiteFooter.tsx`    |
| A page's title, description, sharing | that page's `generateMetadata`                   |
| schema.org output                    | `lib/schema.ts`                                  |
| URLs, locales, canonical links       | `lib/site.ts` and `middleware.ts`                |

## Conventions

- **Links.** Build every internal href with `localePath(locale, path)`. A
  hardcoded `/en/...` costs a redirect on every navigation and splits the URL a
  crawler indexes.
- **Copy.** Every user-visible string goes in `lib/dictionaries.ts` with both an
  English and a Spanish value. TypeScript will not let you add one without the
  other.
- **Styling.** Use the classes in `app/globals.css` and the tokens in
  `styles/tokens.css`. Inline `style` is for one-off spacing only; a value worth
  reusing belongs in a token.
- **WordPress HTML.** Always pass it through `sanitizeContent()` before rendering.
  Rendering `content.rendered` directly is what previously let a pasted stylesheet
  break the site layout.
- **Metadata.** Set `alternates: alternatesFor(locale, path)` on every page. Do
  not add `<link rel="canonical">` by hand — two canonicals is worse than none.

## Design intent

Near-black ink on paper, hairline rules, and a single navy accent reserved for
links and active state. Serif for anything that is read, sans for anything that
is operated. Emphasis comes from typography and whitespace.

No gradients, glow effects, glassmorphism, drop shadows on cards, or emoji.
