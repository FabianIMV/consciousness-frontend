import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getDictionary } from '@/lib/dictionaries';
import { translateContent } from '@/lib/i18n';
import {
  articleNode,
  breadcrumbNode,
  graph,
  organizationNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';
import {
  DEFAULT_LOCALE,
  LOCALES,
  SITE_URL,
  alternatesFor,
  formatDate,
  isLocale,
  localePath,
  ogImageFor,
} from '@/lib/site';
import { absoluteUrl } from '@/lib/urls';
import {
  REVALIDATE_SECONDS,
  decodeHtmlEntities,
  excerptFrom,
  getFeaturedImage,
  getFeaturedImageAlt,
  getPostBySlug,
  getPosts,
  isSameTitle,
  readingTime,
  sanitizeContent,
  stripHtml,
  timestamps,
  wordCount,
  type WordPressPost,
} from '@/lib/wordpress';

export const revalidate = REVALIDATE_SECONDS;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.flatMap((post) => LOCALES.map((lang) => ({ lang, slug: post.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; lang: string };
}): Promise<Metadata> {
  const { slug } = params;
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Page not found', robots: { index: false, follow: true } };

  // Translated too: leaving these in English gave the Spanish page a title and
  // description byte-identical to the English one on a different canonical URL.
  const [title, description] = await Promise.all([
    translateContent(decodeHtmlEntities(stripHtml(post.title.rendered)), locale),
    translateContent(excerptFrom(post.content.rendered, 155), locale),
  ]);

  const image = getFeaturedImage(post);
  const path = `/${slug}`;
  const canonical = alternatesFor(locale, path).canonical;
  const { published, modified } = timestamps(post);

  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      publishedTime: published,
      modifiedTime: modified,
      images: image
        ? [{ url: absoluteUrl(image, SITE_URL), alt: getFeaturedImageAlt(post) }]
        : ogImageFor(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string; lang: string };
}) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const [post, posts] = await Promise.all([getPostBySlug(params.slug), getPosts()]);
  if (!post) notFound();

  const path = `/${params.slug}`;
  const titleRaw = decodeHtmlEntities(stripHtml(post.title.rendered));
  // The share card and schema may use an image from the body; the page itself
  // only leads with one the editor chose, since the body already shows its own.
  const image = getFeaturedImage(post);
  const hero = getFeaturedImage(post, { fromBody: false });
  const { published, modified } = timestamps(post);
  const minutes = readingTime(post.content.rendered);

  // `posts` is newest first; numbering runs from the oldest, as on the index.
  const position = posts.findIndex((entry) => entry.slug === post.slug);
  const number = position === -1 ? null : posts.length - position;
  const older = position === -1 ? undefined : posts[position + 1];
  const newer = position > 0 ? posts[position - 1] : undefined;

  const pagerTitle = (entry?: WordPressPost) =>
    entry ? translateContent(decodeHtmlEntities(stripHtml(entry.title.rendered)), locale) : undefined;

  const [title, description, body, olderTitle, newerTitle] = await Promise.all([
    translateContent(titleRaw, locale),
    translateContent(excerptFrom(post.content.rendered, 155), locale),
    translateContent(
      sanitizeContent(post.content.rendered, locale, {
        dropLeadingHeading: (heading) => isSameTitle(heading, titleRaw),
      }),
      locale
    ),
    pagerTitle(older),
    pagerTitle(newer),
  ]);

  const structuredData = graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode({ locale, path, name: title, description }),
    articleNode({
      locale,
      path,
      headline: title,
      description,
      datePublished: published,
      dateModified: modified,
      image,
      wordCount: wordCount(post.content.rendered),
    }),
    breadcrumbNode(locale, [
      { name: t.nav.research, path: '/' },
      { name: titleRaw, path },
    ]),
  ]);

  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} active="research" exact={false} path={path} />

      <main id="main" tabIndex={-1} className="page__body">
        <article>
          <header className="container article-header">
            <div className="reading">
              <p className="article-header__kicker mono">
                <Link href={localePath(locale, '/')}>{t.nav.research}</Link>
                {number !== null && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="article-header__number">{t.article.number(number)}</span>
                  </>
                )}
              </p>

              <h1 className="article-header__title">{title}</h1>

              <p className="article-meta mono">
                <span>
                  {t.article.published}{' '}
                  <time dateTime={published}>{formatDate(published, locale)}</time>
                </span>
                <span>{t.article.readingTime(minutes)}</span>
                {formatDate(modified, locale) !== formatDate(published, locale) && (
                  <span>
                    {t.article.updated}{' '}
                    <time dateTime={modified}>{formatDate(modified, locale)}</time>
                  </span>
                )}
              </p>
            </div>
          </header>

          {hero && (
            <figure className="container article-figure">
              <div className="reading">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero}
                  alt={getFeaturedImageAlt(post)}
                  width={1600}
                  height={900}
                  fetchPriority="high"
                />
              </div>
            </figure>
          )}

          <div className="container">
            <div className="reading">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </div>
        </article>

        {(older || newer) && (
          <nav className="container pager" aria-label={t.article.pagerLabel}>
            <div className="reading pager__inner">
              {older && (
                <Link href={localePath(locale, `/${older.slug}`)} className="pager__link" rel="prev">
                  <span className="mono">← {t.article.previous}</span>
                  <span className="pager__title">{olderTitle}</span>
                </Link>
              )}
              {newer && (
                <Link
                  href={localePath(locale, `/${newer.slug}`)}
                  className="pager__link pager__link--next"
                  rel="next"
                >
                  <span className="mono">{t.article.next} →</span>
                  <span className="pager__title">{newerTitle}</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
