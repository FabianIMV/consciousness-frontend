import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getDictionary } from '@/lib/dictionaries';
import {
  graph,
  itemListNode,
  organizationNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';
import { DEFAULT_LOCALE, alternatesFor, localePath, type Locale } from '@/lib/site';
import {
  REVALIDATE_SECONDS,
  decodeHtmlEntities,
  excerptFrom,
  getFeaturedImage,
  getFeaturedImageAlt,
  getPosts,
  readingTime,
  stripHtml,
} from '@/lib/wordpress';

export const revalidate = REVALIDATE_SECONDS;

const DESCRIPTION: Record<Locale, string> = {
  en: 'Reviews and critical readings of primary research on consciousness, quantum mechanics, neuroscience, and artificial intelligence, from an independent research journal.',
  es: 'Reseñas y lecturas críticas de investigación primaria sobre consciencia, mecánica cuántica, neurociencia e inteligencia artificial, desde una revista de investigación independiente.',
};

export function generateMetadata({ params }: { params: { lang: Locale } }): Metadata {
  const locale = params.lang;
  const t = getDictionary(locale);

  return {
    title: {
      absolute: `Consciousness Networks — ${t.home.title}`,
    },
    description: DESCRIPTION[locale],
    alternates: alternatesFor(locale, '/'),
    openGraph: {
      type: 'website',
      url: alternatesFor(locale, '/').canonical,
      title: `Consciousness Networks — ${t.home.title}`,
      description: DESCRIPTION[locale],
    },
  };
}

function formatDate(date: string, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const locale = params.lang ?? DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const posts = await getPosts();
  const [lede, ...rest] = posts;

  const entries = posts.map((post) => ({
    slug: post.slug,
    title: decodeHtmlEntities(stripHtml(post.title.rendered)),
  }));

  const structuredData = graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode({
      locale,
      path: '/',
      name: `Consciousness Networks — ${t.home.title}`,
      description: DESCRIPTION[locale],
      type: 'CollectionPage',
    }),
    entries.length ? itemListNode(locale, entries.map((e) => ({ name: e.title, path: `/${e.slug}` }))) : null,
  ]);

  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} active="research" path="/" />

      <div className="page__body">
        <section className="page-hero">
          <div className="container">
            <p className="eyebrow page-hero__eyebrow">{t.home.eyebrow}</p>
            <h1 className="page-hero__title">{t.home.title}</h1>
            <p className="standfirst">{t.home.subtitle}</p>
          </div>
        </section>

        <div className="container">
          <div className="home-layout">
            <main id="main">
              {!posts.length && <p className="standfirst">{t.home.empty}</p>}

              {lede && (
                <article className="lede">
                  {getFeaturedImage(lede) && (
                    <figure className="lede__figure">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getFeaturedImage(lede)!}
                        alt={getFeaturedImageAlt(lede)}
                        width={1200}
                        height={675}
                        fetchPriority="high"
                      />
                    </figure>
                  )}

                  <div>
                    <p className="metadata">
                      {t.home.latest} · <time dateTime={lede.date}>{formatDate(lede.date, locale)}</time> ·{' '}
                      {t.article.readingTime(readingTime(lede.content.rendered))}
                    </p>

                    <h2 className="lede__title">
                      <Link href={localePath(locale, `/${lede.slug}`)}>
                        {decodeHtmlEntities(stripHtml(lede.title.rendered))}
                      </Link>
                    </h2>

                    <p className="lede__excerpt">{excerptFrom(lede.content.rendered, 260)}</p>

                    <Link href={localePath(locale, `/${lede.slug}`)} className="lede__more">
                      {t.home.readArticle}
                    </Link>
                  </div>
                </article>
              )}

              {rest.length > 0 && (
                <section aria-labelledby="archive-heading">
                  <h2
                    id="archive-heading"
                    className="section-heading"
                    style={{ marginTop: 'var(--spacing-12)' }}
                  >
                    {t.home.archive}
                  </h2>

                  <div className="entry-list">
                    {rest.map((post) => {
                      const image = getFeaturedImage(post);
                      const href = localePath(locale, `/${post.slug}`);

                      return (
                        <article
                          key={post.id}
                          className={image ? 'entry entry--with-figure' : 'entry'}
                        >
                          <div>
                            <p className="metadata">
                              <time dateTime={post.date}>{formatDate(post.date, locale)}</time> ·{' '}
                              {t.article.readingTime(readingTime(post.content.rendered))}
                            </p>

                            <h3 className="entry__title">
                              <Link href={href}>{decodeHtmlEntities(stripHtml(post.title.rendered))}</Link>
                            </h3>

                            <p className="entry__excerpt">{excerptFrom(post.content.rendered, 180)}</p>

                            <Link href={href} className="entry__more">
                              {t.home.readMore}
                            </Link>
                          </div>

                          {image && (
                            <figure className="entry__figure">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image}
                                alt={getFeaturedImageAlt(post)}
                                width={400}
                                height={300}
                                loading="lazy"
                                decoding="async"
                              />
                            </figure>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </main>

            <aside className="home-aside">
              <nav aria-labelledby="aside-sections">
                <h2 id="aside-sections" className="aside-block__heading">
                  {t.home.sidebarSections}
                </h2>
                <div className="aside-nav">
                  <Link href={localePath(locale, '/')} aria-current="page">
                    {t.nav.research}
                  </Link>
                  <Link href={localePath(locale, '/papers')}>{t.nav.papers}</Link>
                  <Link href={localePath(locale, '/about')}>{t.nav.about}</Link>
                  <Link href={localePath(locale, '/contact')}>{t.nav.contact}</Link>
                </div>
              </nav>

              <section aria-labelledby="aside-reading">
                <h2 id="aside-reading" className="aside-block__heading">
                  {t.home.sidebarReading}
                </h2>
                <p className="aside-block__text">{t.home.sidebarReadingText}</p>
                <Link href={localePath(locale, '/papers')} className="aside-link">
                  {t.home.sidebarReadingCta}
                </Link>
              </section>

              <section aria-labelledby="aside-about">
                <h2 id="aside-about" className="aside-block__heading">
                  {t.home.sidebarAbout}
                </h2>
                <p className="aside-block__text">{t.home.sidebarAboutText}</p>
                <Link href={localePath(locale, '/about')} className="aside-link">
                  {t.home.sidebarAboutCta}
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <SiteFooter locale={locale} />
    </div>
  );
}
