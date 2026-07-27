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
  isLocale,
  localePath,
  ogImageFor,
  type Locale,
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
  readingTime,
  sanitizeContent,
  stripHtml,
  timestamps,
  wordCount,
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

function formatDate(date: string, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string; lang: string };
}) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const path = `/${params.slug}`;
  const titleRaw = decodeHtmlEntities(stripHtml(post.title.rendered));
  const image = getFeaturedImage(post);
  const { published, modified } = timestamps(post);
  const minutes = readingTime(post.content.rendered);

  const [title, description, body] = await Promise.all([
    translateContent(titleRaw, locale),
    translateContent(excerptFrom(post.content.rendered, 155), locale),
    translateContent(sanitizeContent(post.content.rendered, locale), locale),
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

      <div className="page__body">
        <main id="main" tabIndex={-1}>
          <article>
          {image && (
            <figure className="article-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={getFeaturedImageAlt(post)}
                width={1600}
                height={800}
                fetchPriority="high"
              />
            </figure>
          )}

          <div className="container container--reading">
            <header className="article-header">
              <Link href={localePath(locale, '/')} className="back-link">
                ← {t.article.back}
              </Link>

              <h1 className="article-header__title">{title}</h1>

              <div className="article-meta metadata">
                <span>
                  {t.article.published}{' '}
                  <time dateTime={published}>{formatDate(published, locale)}</time>
                </span>
                <span className="article-meta__separator" aria-hidden="true">
                  ·
                </span>
                <span>{t.article.readingTime(minutes)}</span>
                {modified !== published && (
                  <>
                    <span className="article-meta__separator" aria-hidden="true">
                      ·
                    </span>
                    <span>
                      {t.article.updated}{' '}
                      <time dateTime={modified}>{formatDate(modified, locale)}</time>
                    </span>
                  </>
                )}
              </div>
            </header>

            <div className="article-content" dangerouslySetInnerHTML={{ __html: body }} />
          </div>

          <section className="article-outro">
            <div className="container container--reading">
              <h2 className="article-outro__title">{t.article.moreTitle}</h2>
              <p className="article-outro__text">{t.article.moreText}</p>
              <Link href={localePath(locale, '/')} className="btn btn--primary">
                {t.article.moreCta}
              </Link>
            </div>
          </section>
          </article>
        </main>
      </div>

      <SiteFooter locale={locale} />
    </div>
  );
}
