/**
 * Papers Page - Consciousness Networks
 * Must-read papers and publications
 */

import Link from 'next/link';
import { getPageBySlug, processContent } from '@/lib/wordpress';
import { translateContent } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Must-Read Papers on Consciousness & Quantum Physics',
  description: 'Curated collection of groundbreaking research papers at the intersection of consciousness, artificial intelligence, quantum physics, and neuroscience.',
};

export default async function Papers({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const page = await getPageBySlug('papers');
  const titleRaw = page?.title.rendered || 'Papers Must Read';
  const contentRaw = page ? processContent(page.content.rendered) : '';

  const [title, content, researchLabel, papersLabel, aboutLabel, contactLabel] = await Promise.all([
    translateContent(titleRaw, lang),
    translateContent(contentRaw, lang),
    translateContent('Research', lang),
    translateContent('Papers', lang),
    translateContent('About', lang),
    translateContent('Contact', lang)
  ]);

  return (
    <>
      {/* Header */}
      <header className="header-glass" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
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
            letterSpacing: 'var(--tracking-tight)',
          }}>
            Consciousness Networks
          </Link>

          <nav className="nav-desktop" style={{ display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center' }}>
            <Link href={`/${lang}`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>
              {researchLabel}
            </Link>
            <Link href={`/${lang}/papers`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--primary-purple)',
            }}>
              {papersLabel}
            </Link>
            <Link href={`/${lang}/about`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>
              {aboutLabel}
            </Link>
            <Link href={`/${lang}/contact`} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>
              {contactLabel}
            </Link>
          </nav>

          <nav className="nav-mobile" style={{ display: 'none', gap: 'var(--spacing-4)' }}>
            <Link href="/" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Home</Link>
            <Link href="/papers" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--primary-purple)',
            }}>Papers</Link>
            <Link href="/about" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>About</Link>
            <Link href="/contact" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Contact</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section style={{
          padding: 'var(--spacing-10) 0',
          background: 'var(--bg-gradient-subtle)',
        }}>
          <div className="container">
            <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', textAlign: 'center' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-black)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-4)',
              }}>
                {title}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: 'var(--spacing-10) 0' }}>
          <div className="container">
            <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
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
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'var(--spacing-16)',
        padding: 'var(--spacing-10) 0',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-secondary)',
      }}>
        <div className="container">
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <p className="metadata">
              © {new Date().getFullYear()} Consciousness Networks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
