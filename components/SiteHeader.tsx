import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from '@/lib/site';

export type NavKey = 'research' | 'papers' | 'about' | 'contact';

const NAV: Array<{ key: NavKey; path: string }> = [
  { key: 'research', path: '/' },
  { key: 'papers', path: '/papers' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

/**
 * @param active  Navigation entry to highlight.
 * @param exact   Whether `active` is the page itself. An article belongs to the
 *                Research section but is not the Research page, so it highlights
 *                without claiming `aria-current="page"`.
 * @param path    Route without a locale prefix (`/papers`, `/the-soul-crisis`),
 *                used to link to the same page in the other language.
 */
export default function SiteHeader({
  locale,
  active,
  exact = true,
  path = '/',
}: {
  locale: Locale;
  active?: NavKey;
  exact?: boolean;
  path?: string;
}) {
  const t = getDictionary(locale);
  const otherLocale = LOCALES.find((l) => l !== locale) ?? DEFAULT_LOCALE;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={localePath(locale, '/')} className="masthead">
          Consciousness Networks
        </Link>

        <nav className="site-nav" aria-label={t.nav.primary}>
          {NAV.map(({ key, path: navPath }) => (
            <Link
              key={key}
              href={localePath(locale, navPath)}
              className={
                active === key ? 'site-nav__link site-nav__link--active' : 'site-nav__link'
              }
              aria-current={active === key && exact ? 'page' : undefined}
            >
              {t.nav[key]}
            </Link>
          ))}

          <Link href={localePath(otherLocale, path)} className="lang-switch" hrefLang={otherLocale}>
            {t.nav.switchLanguage}
          </Link>
        </nav>
      </div>
    </header>
  );
}
