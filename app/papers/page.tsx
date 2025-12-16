/**
 * About Page - Consciousness Networks
 */

'use client';

import Link from 'next/link';
import { getPageBySlug, processContent } from '@/lib/wordpress';
import { useEffect, useState } from 'react';

export default function About() {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('About');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageBySlug('papers').then(page => {
      if (page) {
        setTitle(page.title.rendered);
        setContent(processContent(page.content.rendered));
      }
      setLoading(false);
    });
  }, []);

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
          <Link href="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-tight)',
          }} className="glow-on-hover">
            Consciousness Networks
          </Link>

          <nav style={{ display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center' }}>
            <Link href="/" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>
              Research
            </Link>
            <Link href="/papers" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--primary-purple)',
            }}>
              Papers
            </Link>
            <Link href="/about" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>
              About
            </Link>
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-12) 0' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '48px',
                    height: '48px',
                    border: '4px solid var(--bg-tertiary)',
                    borderTopColor: 'var(--primary-purple)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                </div>
              ) : (
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                  style={{
                    fontSize: 'var(--text-lg)',
                    lineHeight: 'var(--leading-relaxed)',
                    color: 'var(--text-secondary)',
                  }}
                />
              )}
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
