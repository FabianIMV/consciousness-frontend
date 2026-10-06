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
| Look of components pasted in posts   | `styles/wordpress.css`                           |
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

A printed journal, not an app. Warm paper, near-black ink, hairline rules, and
one red — the editor's pencil — kept for marks that mean something: entry
numbers, the active section, link underlines, quotation rules.

Newsreader sets everything that is read or operated; IBM Plex Mono sets data —
dates, numbers, reading times, labels. Headlines are regular weight and get
their presence from size and tight leading, not from bold.

The home page is a numbered index, not a grid of cards. Articles lead with their
headline, not an image; an image appears where the author placed it in the body.

No gradients, glow effects, glassmorphism, rounded cards, drop shadows, pills,
or emoji — in the chrome or in WordPress content, which is why the sanitiser
discards author CSS rather than containing it.
