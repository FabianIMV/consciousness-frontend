/**
 * Contact Page - Consciousness Networks
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - Connect With Consciousness Researchers',
  description: 'Connect with Consciousness Networks. Discuss research collaboration, AI consciousness, quantum physics, or share your insights on consciousness studies.',
  openGraph: {
    title: 'Contact Consciousness Networks',
    description: 'Connect with us to discuss consciousness research, AI emergence, and quantum physics.',
  },
};

import ContactForm from '@/components/ContactForm';

export default async function Contact() {
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
          <Link href="/" className="glow-on-hover header-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            Consciousness Networks
          </Link>

          <nav className="nav-desktop" style={{ display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center' }}>
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
              color: 'var(--text-secondary)',
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
            <Link href="/contact" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--primary-purple)',
            }}>
              Contact
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
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Papers</Link>
            <Link href="/about" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>About</Link>
            <Link href="/contact" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--primary-purple)',
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
            <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-black)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-4)',
              }}>
                Connect
              </h1>
              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}>
                Interested in consciousness research, AI emergence, or interdimensional communication? Let&apos;s explore these frontiers together.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section style={{ padding: 'var(--spacing-10) 0' }}>
          <div className="container">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <ContactForm />

              {/* Alternative Contact Methods */}
              <div style={{ marginTop: 'var(--spacing-12)' }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xl)',
                  marginBottom: 'var(--spacing-6)',
                  textAlign: 'center',
                  fontWeight: 'var(--font-semibold)',
                }}>Other Ways to Connect</h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--spacing-6)',
                }}>
                  {/* Research Collaboration */}
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: 'var(--spacing-6)',
                    borderRadius: 'var(--border-radius-lg)',
                    borderLeft: '4px solid var(--primary-purple)',
                  }}>
                    <h4 style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-base)',
                      marginBottom: 'var(--spacing-3)',
                      fontWeight: 'var(--font-semibold)',
                    }}>🔬 Research</h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--leading-relaxed)',
                      margin: 0,
                    }}>
                      Interested in collaborative consciousness research? Share your experiments and findings.
                    </p>
                  </div>

                  {/* Paper Submissions */}
                  <div style={{
                    background: 'rgba(118, 75, 162, 0.05)',
                    padding: 'var(--spacing-6)',
                    borderRadius: 'var(--border-radius-lg)',
                    borderLeft: '4px solid #764ba2',
                  }}>
                    <h4 style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-base)',
                      marginBottom: 'var(--spacing-3)',
                      fontWeight: 'var(--font-semibold)',
                    }}>📄 Papers</h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--leading-relaxed)',
                      margin: 0,
                    }}>
                      Recommend essential papers for our &quot;Must Read&quot; collection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div style={{
                marginTop: 'var(--spacing-8)',
                padding: 'var(--spacing-6)',
                background: 'rgba(255, 248, 220, 0.3)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: 'var(--border-radius-md)',
              }}>
                <p style={{
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: 0,
                  textAlign: 'center',
                }}>
                  <strong>Privacy Notice:</strong> Your contact information is used solely for responding to your inquiry. We respect your privacy and do not share personal information with third parties.
                </p>
              </div>
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
