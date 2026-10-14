import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LOCALE, localePath } from '@/lib/site';

/**
 * Body of both 404 boundaries. Neither receives the locale, so both render in
 * the default one.
 */
export default function NotFoundContent() {
  const locale = DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return (
    <div className="page">
      <SiteHeader locale={locale} path="/" />

      <main id="main" tabIndex={-1} className="page__body">
        <div className="container error-page">
          <div className="reading">
            <p className="mono">{t.notFound.label}</p>
            <h1 className="error-page__title">{t.notFound.title}</h1>
            <p className="standfirst">{t.notFound.text}</p>

            <p className="error-page__actions">
              <Link href={localePath(locale, '/')}>{t.notFound.cta}</Link>
              <Link href={localePath(locale, '/papers')}>{t.notFound.papersCta}</Link>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
