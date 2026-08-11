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
import { translateContent } from '@/lib/i18n';
import { DEFAULT_LOCALE, alternatesFor, localePath, ogImageFor, type Locale } from '@/lib/site';
import {
  REVALIDATE_SECONDS,
  decodeHtmlEntities,
  excerptFrom,
  getFeaturedImage,
  getFeaturedImageAlt,
  getPosts,
  readingTime,
  stripHtml,
  timestamps,
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
      images: ogImageFor(locale),
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

  // Headlines and excerpts are translated here too. Without this, a Spanish
  // reader saw Spanish chrome wrapped around English headlines, and the link
  // text stopped matching the title on the article page it opened.
  const entries = await Promise.all(
    posts.map(async (post) => {
      const [title, excerpt] = await Promise.all([
        translateContent(decodeHtmlEntities(stripHtml(post.title.rendered)), locale),
        translateContent(excerptFrom(post.content.rendered, 260), locale),
      ]);

      return {
        id: post.id,
        slug: post.slug,
        title,
        excerpt,
        href: localePath(locale, `/${post.slug}`),
        image: getFeaturedImage(post),
        imageAlt: getFeaturedImageAlt(post),
        published: timestamps(post).published,
        minutes: readingTime(post.content.rendered),
      };
    })
  );

  const [lede, ...rest] = entries;

  const structuredData = graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode({
      locale,
      path: '/',
      name: `Consciousness Networks — ${t.home.title}`,
      description: DESCRIPTION[locale],
      type: 'CollectionPage',
      mainEntity: entries.length ? `${alternatesFor(locale, '/').canonical}#itemlist` : undefined,
    }),
    entries.length
      ? itemListNode(
          locale,
          '/',
          entries.map((entry) => ({ name: entry.title, path: `/${entry.slug}` }))
        )
      : null,
  ]);

  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} active="research" path="/" />

      <div className="page__body">
        <main id="main" tabIndex={-1}>
          <section className="page-hero">
            <div className="container">
              <p className="eyebrow page-hero__eyebrow">{t.home.eyebrow}</p>
              <h1 className="page-hero__title">{t.home.title}</h1>
              <p className="standfirst">{t.home.subtitle}</p>
            </div>
          </section>

          <div className="container">
            <div className="home-layout">
              <div>
                {!entries.length && <p className="standfirst">{t.home.empty}</p>}

                {lede && (
                  <article className="lede">
                    {lede.image && (
                      <figure className="lede__figure">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={lede.image}
                          alt={lede.imageAlt}
                          width={1200}
                          height={675}
                          fetchPriority="high"
                        />
                      </figure>
                    )}

                    <div>
                      <p className="metadata">
                        {t.home.latest} ·{' '}
                        <time dateTime={lede.published}>{formatDate(lede.published, locale)}</time> ·{' '}
                        {t.article.readingTime(lede.minutes)}
                      </p>

                      <h2 className="lede__title">
                        <Link href={lede.href}>{lede.title}</Link>
                      </h2>

                      <p className="lede__excerpt">{lede.excerpt}</p>

                      <Link href={lede.href} className="lede__more">
                        {t.home.readArticle}
                      </Link>
                    </div>
                  </article>
                )}

                {rest.length > 0 && (
                  <section aria-labelledby="archive-heading">
                    <h2 id="archive-heading" className="section-heading archive-heading">
                      {t.home.archive}
                    </h2>

                    <div className="entry-list">
                      {rest.map((entry) => (
                        <article
                          key={entry.id}
                          className={entry.image ? 'entry entry--with-figure' : 'entry'}
                        >
                          <div>
                            <p className="metadata">
                              <time dateTime={entry.published}>
                                {formatDate(entry.published, locale)}
                              </time>{' '}
                              · {t.article.readingTime(entry.minutes)}
                            </p>

                            <h3 className="entry__title">
                              <Link href={entry.href}>{entry.title}</Link>
                            </h3>

                            <p className="entry__excerpt">{entry.excerpt}</p>

                            <Link href={entry.href} className="entry__more">
                              {t.home.readMore}
                            </Link>
                          </div>

                          {entry.image && (
                            <figure className="entry__figure">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={entry.image}
                                alt={entry.imageAlt}
                                width={400}
                                height={300}
                                loading="lazy"
                                decoding="async"
                              />
                            </figure>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="home-aside">
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
        </main>
      </div>

      <SiteFooter locale={locale} />
    </div>
  );
}
