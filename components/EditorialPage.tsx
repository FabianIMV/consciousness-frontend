import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader, { type NavKey } from '@/components/SiteHeader';
import { WP_CONTENT_CLASS } from '@/lib/wordpress';
import type { Locale } from '@/lib/site';

/**
 * Standing page backed by a WordPress page: hero, then the sanitised body.
 * Used by /papers and /about, which differ only in their copy and schema type.
 */
export default function EditorialPage({
  locale,
  active,
  path,
  eyebrow,
  title,
  subtitle,
  content,
  fallbackText,
  structuredData,
}: {
  locale: Locale;
  active: NavKey;
  path: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  content: string;
  fallbackText: string;
  structuredData: unknown;
}) {
  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} active={active} path={path} />

      <div className="page__body">
        <section className="page-hero">
          <div className="container container--reading">
            <p className="eyebrow page-hero__eyebrow">{eyebrow}</p>
            <h1 className="page-hero__title">{title}</h1>
            <p className="standfirst">{subtitle}</p>
          </div>
        </section>

        <main id="main">
          <div className="container container--reading" style={{ paddingBlock: 'var(--spacing-12)' }}>
            {content ? (
              <div className={WP_CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="standfirst">{fallbackText}</p>
            )}
          </div>
        </main>
      </div>

      <SiteFooter locale={locale} />
    </div>
  );
}
