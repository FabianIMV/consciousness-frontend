import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/site';

/**
 * URL strategy: English is the site's canonical language and is served from the
 * root (`/papers`), Spanish from a prefix (`/es/papers`). Routes live under the
 * internal `app/[lang]` segment, so root paths are rewritten to `/en/...`
 * without the visitor seeing it.
 *
 * `/en/...` stays reachable — it was the URL shape the site used before — but
 * redirects permanently to the root form so crawlers consolidate on one URL per
 * page. Internal links are built with `localePath()` and never hit this branch.
 */
/**
 * Next generates metadata images under the segment that declares them, so the
 * social card lives at `/en/opengraph-image`. That URL is what ends up in the
 * `og:image` tag, and redirecting it would make every unfurler pay a hop — or
 * fail, for the ones that do not follow redirects.
 */
const METADATA_ROUTE = /\/(opengraph-image|twitter-image|icon|apple-icon)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (METADATA_ROUTE.test(pathname)) return NextResponse.next();

  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  const prefixedLocale = LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (prefixedLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /**
   * Skips API routes, Next internals, and any path with a file extension —
   * `/sitemap.xml`, `/robots.txt`, and `/llms.txt` are served by their own
   * handlers and must not be treated as a locale.
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)'],
};
