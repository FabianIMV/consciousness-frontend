import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LOCALE, LOCALES, SITE_NAME, localePath, type Locale } from '@/lib/site';

export type NavKey = 'research' | 'papers' | 'about' | 'contact';

const NAV: Array<{ key: NavKey; path: string }> = [
  { key: 'research', path: '/' },
  { key: 'papers', path: '/papers' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

/** The network mark from `app/icon.svg`, drawn in the current ink with red nodes. */
function Mark() {
  return (
    <svg className="masthead__mark" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="16" cy="16" r="13.2" />
        <path d="M16 7.6 10.2 13.4 12.8 22.4h6.4l2.6-9z" />
        <path d="M10.2 13.4h11.6M16 7.6v14.8" />
      </g>
      <g className="masthead__nodes">
        <circle cx="16" cy="7.6" r="1.9" />
        <circle cx="10.2" cy="13.4" r="1.9" />
        <circle cx="21.8" cy="13.4" r="1.9" />
        <circle cx="12.8" cy="22.4" r="1.9" />
        <circle cx="19.2" cy="22.4" r="1.9" />
      </g>
    </svg>
  );
}

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
          <Mark />
          <span>{SITE_NAME}</span>
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

          <Link
            href={localePath(otherLocale, path)}
            className="lang-switch"
            hrefLang={otherLocale}
            lang={otherLocale}
          >
            {t.nav.switchLanguage}
          </Link>
        </nav>
      </div>
    </header>
  );
}
