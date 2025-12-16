/**
 * Individual Article Page
 * Dynamically renders WordPress pages by slug
 */

import Link from 'next/link';
import { getPages, getPageBySlug, getFeaturedImage, processContent } from '@/lib/wordpress';
import { notFound } from 'next/navigation';

export const revalidate = 60;

// Generate static paths for all pages
export async function generateStaticParams() {
  const pages = await getPages();

  return pages
    .filter(page => !['about', 'contact', 'papers', 'home'].includes(page.slug))
    .map((page) => ({
      slug: page.slug,
    }));
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  const featuredImage = getFeaturedImage(page);

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
          <Link href="/" className="glow-on-hover" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
          }}>
            Consciousness Networks
          </Link>

          <nav style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
            <Link href="/" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Research</Link>
            <Link href="/papers" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Papers</Link>
            <Link href="/about" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>About</Link>
            <Link href="/contact" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Contact</Link>
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
          <div style={{
            width: '100%',
            height: '500px',
            overflow: 'hidden',
            background: 'var(--bg-gradient-subtle)',
            marginBottom: 'var(--spacing-10)',
          }}>
            <img
              src={featuredImage}
              alt={page.title.rendered}
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
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              color: 'var(--primary-purple)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--spacing-8)',
              textDecoration: 'none',
            }}>
              ← Back to Research
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
              {page.title.rendered}
            </h1>

            {/* Date */}
            <div style={{
              marginBottom: 'var(--spacing-8)',
              paddingBottom: 'var(--spacing-6)',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <time className="metadata">
                {new Date(page.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            {/* Article Body */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: processContent(page.content.rendered) }}
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
                Explore More Research
              </h2>

              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-6)',
              }}>
                Discover more insights into consciousness and quantum mechanics
              </p>

              <Link href="/" className="btn btn-primary">
                View All Articles
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
            © {new Date().getFullYear()} Consciousness Networks. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
