/**
 * Site-wide constants and URL helpers.
 *
 * English is served from the root (`/papers`), Spanish from a prefix (`/es/papers`).
 * `middleware.ts` rewrites root paths to the internal `/en/...` segment, so every
 * link we render must use `localePath` — linking to `/en/...` directly would send
 * visitors and crawlers through a 307 redirect on every navigation.
 */

export const SITE_URL = 'https://consciousnessnetworks.com';
export const SITE_NAME = 'Consciousness Networks';

export const CONTACT_EMAIL = 'contact@consciousnessnetworks.com';

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Locale of the HTML document, e.g. `en-US` / `es-ES`. */
export const HTML_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
};

/**
 * Public path for a route in a given locale.
 * `localePath('en', '/papers') === '/papers'`, `localePath('es', '/papers') === '/es/papers'`
 */
export function localePath(locale: Locale, path = ''): string {
  const clean = path === '/' ? '' : path;
  if (locale === DEFAULT_LOCALE) return clean || '/';
  return `/${locale}${clean}`;
}

/** Absolute canonical URL for a route in a given locale. */
export function localeUrl(locale: Locale, path = ''): string {
  const p = localePath(locale, path);
  return p === '/' ? SITE_URL : `${SITE_URL}${p}`;
}

/** `alternates` block for Next metadata: canonical plus every hreflang variant. */
export function alternatesFor(locale: Locale, path = '') {
  return {
    canonical: localeUrl(locale, path),
    languages: {
      en: localeUrl('en', path),
      es: localeUrl('es', path),
      'x-default': localeUrl(DEFAULT_LOCALE, path),
    },
  };
}
