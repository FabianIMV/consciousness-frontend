import Link from 'next/link';
import { getFeaturedImage, processContent, decodeHtmlEntities, getPostBySlug, getPosts, stripHtml, truncate } from '@/lib/wordpress';
import { translateContent } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.flatMap(post => [
    { lang: 'en', slug: post.slug },
    { lang: 'es', slug: post.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; lang: string };
}): Promise<Metadata> {
  const { slug, lang } = params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };

  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const description = truncate(stripHtml(post.content.rendered), 160);
  const featuredImage = getFeaturedImage(post);
  const url = `https://consciousnessnetworks.com/${lang}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `https://consciousnessnetworks.com/en/${slug}`,
        es: `https://consciousnessnetworks.com/es/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: post.date,
      modifiedTime: post.modified || post.date,
      images: featuredImage
        ? [{ url: `https://consciousnessnetworks.com${featuredImage}`, width: 1200, height: 630, alt: title }]
        : [],
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
  const { lang, slug } = params;
  const page = await getPostBySlug(slug);

  if (!page) {
    notFound();
  }

  const featuredImage = getFeaturedImage(page);
  const titleRaw = decodeHtmlEntities(page.title.rendered);
  const contentRaw = processContent(page.content.rendered);

  const [
    title,
    content,
    backLabel,
    researchLabel,
    papersLabel,
    aboutLabel,
    contactLabel,
    exploreMoreTitle,
    exploreMoreText,
    viewAllArticlesLabel,
    footerText,
  ] = await Promise.all([
    translateContent(titleRaw, lang),
    translateContent(contentRaw, lang),
    translateContent('Back to Research', lang),
    translateContent('Research', lang),
    translateContent('Papers', lang),
    translateContent('About', lang),
    translateContent('Contact', lang),
    translateContent('Explore More Research', lang),
    translateContent('Discover more insights into consciousness and quantum mechanics', lang),
    translateContent('View All Articles', lang),
    translateContent(`© ${new Date().getFullYear()} Consciousness Networks. All rights reserved.`, lang),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://consciousnessnetworks.com/${lang}/${slug}#article`,
        headline: titleRaw,
        description: truncate(stripHtml(page.content.rendered), 160),
        datePublished: page.date,
        dateModified: page.modified || page.date,
        author: {
          '@type': 'Organization',
          name: 'Consciousness Networks',
          url: 'https://consciousnessnetworks.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Consciousness Networks',
          url: 'https://consciousnessnetworks.com',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://consciousnessnetworks.com/${lang}/${slug}`,
        },
        ...(featuredImage && {
          image: {
            '@type': 'ImageObject',
            url: `https://consciousnessnetworks.com${featuredImage}`,
          },
        }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Research', item: `https://consciousnessnetworks.com/${lang}` },
          { '@type': 'ListItem', position: 2, name: titleRaw, item: `https://consciousnessnetworks.com/${lang}/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="header-glass" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
        <div className="container" style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href={`/${lang}`} className="glow-on-hover header-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
          }}>
            Consciousness Networks
          </Link>

          <nav className="nav-desktop" style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
            <Link href={`/${lang}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>{researchLabel}</Link>
            <Link href={`/${lang}/papers`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>{papersLabel}</Link>
            <Link href={`/${lang}/about`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>{aboutLabel}</Link>
            <Link href={`/${lang}/contact`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>{contactLabel}</Link>
          </nav>

          <nav className="nav-mobile" style={{ display: 'none', gap: 'var(--spacing-4)' }}>
            <Link href={`/${lang}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{researchLabel}</Link>
            <Link href={`/${lang}/papers`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{papersLabel}</Link>
            <Link href={`/${lang}/about`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{aboutLabel}</Link>
            <Link href={`/${lang}/contact`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{contactLabel}</Link>
          </nav>
        </div>
      </header>

      {/* Article */}
      <article style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
        {featuredImage && (
          <div style={{
            width: '100%',
            height: '480px',
            overflow: 'hidden',
            background: 'var(--bg-gradient-subtle)',
          }}>
            <img
              src={featuredImage}
              alt={titleRaw}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="container">
          <div style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            padding: 'var(--spacing-10) var(--spacing-4)',
          }}>
            <Link href={`/${lang}`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              color: 'var(--primary-purple)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--spacing-8)',
              textDecoration: 'none',
            }}>
              ← {backLabel}
            </Link>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 'var(--font-black)',
              color: 'var(--text-primary)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--spacing-6)',
            }}>
              {title}
            </h1>

            <div style={{
              marginBottom: 'var(--spacing-10)',
              paddingBottom: 'var(--spacing-6)',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <time className="metadata" dateTime={page.date}>
                {new Date(page.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                fontSize: 'var(--text-lg)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--text-secondary)',
              }}
            />
          </div>
        </div>

        <section style={{
          marginTop: 'var(--spacing-16)',
          padding: 'var(--spacing-12) 0',
          background: 'var(--bg-gradient-subtle)',
          borderTop: '1px solid var(--border-light)',
        }}>
          <div className="container">
            <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-4)',
              }}>
                {exploreMoreTitle}
              </h2>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-6)' }}>
                {exploreMoreText}
              </p>
              <Link href={`/${lang}`} className="btn btn-primary">
                {viewAllArticlesLabel}
              </Link>
            </div>
          </div>
        </section>
      </article>

      <footer style={{
        padding: 'var(--spacing-10) 0',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-secondary)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="metadata">{footerText}</p>
        </div>
      </footer>
    </>
  );
}
