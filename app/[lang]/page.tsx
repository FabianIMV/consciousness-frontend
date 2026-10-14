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
import {
  DEFAULT_LOCALE,
  alternatesFor,
  formatDate,
  localePath,
  ogImageFor,
  type Locale,
} from '@/lib/site';
import {
  REVALIDATE_SECONDS,
  decodeHtmlEntities,
  excerptFrom,
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

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const locale = params.lang ?? DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const posts = await getPosts();

  // Headlines and excerpts are translated here too. Without this, a Spanish
  // reader saw Spanish chrome wrapped around English headlines, and the link
  // text stopped matching the title on the article page it opened.
  const entries = await Promise.all(
    posts.map(async (post, index) => {
      const [title, excerpt] = await Promise.all([
        translateContent(decodeHtmlEntities(stripHtml(post.title.rendered)), locale),
        translateContent(excerptFrom(post.content.rendered, index === 0 ? 320 : 200), locale),
      ]);

      return {
        id: post.id,
        slug: post.slug,
        // Numbered in order of publication, oldest first, like a journal's issues.
        number: posts.length - index,
        title,
        excerpt,
        href: localePath(locale, `/${post.slug}`),
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

  const digits = String(entries.length).length;
  const pad = (n: number) => String(n).padStart(Math.max(2, digits), '0');

  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} active="research" path="/" />

      <main id="main" tabIndex={-1} className="page__body">
        <section className="intro">
          <div className="container intro__inner">
            <h1 className="intro__title">{t.home.title}</h1>
            <div className="intro__aside">
              <p className="intro__text">{t.home.subtitle}</p>
              {entries.length > 0 && <p className="mono">{t.home.count(entries.length)}</p>}
            </div>
          </div>
        </section>

        <div className="container">
          {!entries.length && <p className="standfirst">{t.home.empty}</p>}

          {lede && (
            <article className="lede">
              <p className="lede__meta mono">
                <span className="lede__number">{t.article.number(lede.number)}</span>
                <span>{t.home.latest}</span>
                <time dateTime={lede.published}>{formatDate(lede.published, locale)}</time>
                <span>{t.article.readingTime(lede.minutes)}</span>
              </p>

              <h2 className="lede__title">
                <Link href={lede.href}>{lede.title}</Link>
              </h2>

              <p className="lede__excerpt">{lede.excerpt}</p>
            </article>
          )}

          {rest.length > 0 && (
            <section className="index" aria-labelledby="archive-heading">
              <h2 id="archive-heading" className="section-label mono">
                {t.home.archive}
              </h2>

              <ol className="index__list">
                {rest.map((entry) => (
                  <li key={entry.id} className="index__item">
                    <span className="index__number mono">{pad(entry.number)}</span>
                    <time className="index__date mono" dateTime={entry.published}>
                      {formatDate(entry.published, locale, 'short')}
                    </time>
                    <div className="index__body">
                      <h3 className="index__title">
                        <Link href={entry.href} className="index__link">
                          {entry.title}
                        </Link>
                      </h3>
                      <p className="index__excerpt">{entry.excerpt}</p>
                    </div>
                    <span className="index__minutes mono">{t.article.minutes(entry.minutes)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
