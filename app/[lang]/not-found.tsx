import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LOCALE, localePath } from '@/lib/site';

/**
 * `notFound()` inside a locale segment renders here. The locale is not
 * available to a not-found boundary, so this falls back to the default one.
 */
export default function LocaleNotFound() {
  const locale = DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return (
    <div className="page">
      <SiteHeader locale={locale} path="/" />

      <div className="page__body">
        <main id="main" className="container error-page">
          <p className="eyebrow">{t.notFound.eyebrow}</p>
          <h1 className="error-page__title">{t.notFound.title}</h1>
          <p className="error-page__text">{t.notFound.text}</p>

          <div className="error-page__actions">
            <Link href={localePath(locale, '/')} className="btn btn--primary">
              {t.notFound.cta}
            </Link>
            <Link href={localePath(locale, '/papers')} className="btn btn--secondary">
              {t.notFound.papersCta}
            </Link>
          </div>
        </main>
      </div>

      <SiteFooter locale={locale} />
    </div>
  );
}
