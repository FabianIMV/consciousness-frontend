/**
 * Individual Article Page
 * Dynamically renders WordPress pages by slug
 */

import Link from 'next/link';
import { getPageBySlug, getFeaturedImage, processContent, decodeHtmlEntities } from '@/lib/wordpress';
import { translateContent } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({
  params,
}: {
  params: { slug: string; lang: string };
}) {
  const { lang, slug } = params;
  const page = await getPageBySlug(slug);

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
    footerText
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
    translateContent(`© ${new Date().getFullYear()} Consciousness Networks. All rights reserved.`, lang)
  ]);

  return (
    <>
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
            <Link href={`/${lang}`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{researchLabel}</Link>
            <Link href={`/${lang}/papers`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{papersLabel}</Link>
            <Link href={`/${lang}/about`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{aboutLabel}</Link>
            <Link href={`/${lang}/contact`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{contactLabel}</Link>
          </nav>

          <nav className="nav-mobile" style={{ display: 'none', gap: 'var(--spacing-4)' }}>
            <Link href={`/${lang}`} style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{researchLabel}</Link>
            <Link href={`/${lang}/papers`} style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{papersLabel}</Link>
            <Link href={`/${lang}/about`} style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{aboutLabel}</Link>
            <Link href={`/${lang}/contact`} style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>{contactLabel}</Link>
          </nav>
        </div>
      </header>

      {/* Main Article */}
      <article style={{
        paddingTop: 'var(--header-height)',
        minHeight: '100vh',
      }}>
        {/* Featured Image */}
        {featuredImage && (
          <div className="article-featured-image" style={{
            width: '100%',
            height: '500px',
            overflow: 'hidden',
            background: 'var(--bg-gradient-subtle)',
            marginBottom: 'var(--spacing-10)',
          }}>
            <img
              src={featuredImage}
              alt={title || page.title.rendered}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="container">
          <div style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            padding: 'var(--spacing-8) var(--spacing-4)',
          }}>
            {/* Back Link */}
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

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-5xl)',
              fontWeight: 'var(--font-black)',
              color: 'var(--text-primary)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--spacing-8)',
            }}>
              {title}
            </h1>

            {/* Date */}
            <div style={{
              marginBottom: 'var(--spacing-8)',
              paddingBottom: 'var(--spacing-6)',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <time className="metadata">
                {new Date(page.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            {/* Article Body */}
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

        {/* Related Articles CTA */}
        <section style={{
          marginTop: 'var(--spacing-16)',
          padding: 'var(--spacing-12) 0',
          background: 'var(--bg-gradient-subtle)',
          borderTop: '1px solid var(--border-light)',
        }}>
          <div className="container">
            <div style={{
              maxWidth: 'var(--content-max)',
              margin: '0 auto',
              textAlign: 'center',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-4)',
              }}>
                {exploreMoreTitle}
              </h2>

              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-6)',
              }}>
                {exploreMoreText}
              </p>

              <Link href={`/${lang}`} className="btn btn-primary">
                {viewAllArticlesLabel}
              </Link>
            </div>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer style={{
        padding: 'var(--spacing-10) 0',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-secondary)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="metadata">
            {footerText}
          </p>
        </div>
      </footer>
    </>
  );
}
