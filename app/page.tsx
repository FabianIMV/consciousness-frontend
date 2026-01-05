/**
 * Homepage - Consciousness Networks
 * Medium-inspired layout with sidebars
 */

import Link from 'next/link';
import { getPages, getFeaturedImage, stripHtml, truncate } from '@/lib/wordpress';

export const revalidate = 60;

export default async function Home() {
  const pages = await getPages();
  const articles = pages.filter(page =>
    !['about', 'contact', 'papers', 'home'].includes(page.slug)
  );

  // Featured article (first one)
  const featured = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Fixed Header */}
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
          <Link href="/" className="glow-on-hover header-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
          }}>
            Consciousness Networks
          </Link>

          <nav className="nav-desktop" style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
            <Link href="/" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--primary-purple)',
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

          <nav className="nav-mobile" style={{ display: 'none', gap: 'var(--spacing-4)' }}>
            <Link href="/" style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--primary-purple)',
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
              fontWeight: 'var(--font-medium)',
              color: 'var(--text-secondary)',
            }}>Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div style={{ paddingTop: 'var(--header-height)' }}>
        <div className="container layout-3col" style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr 280px',
          gap: 'var(--spacing-8)',
          padding: 'var(--spacing-8) var(--spacing-6)',
          maxWidth: '1400px',
        }}>

          {/* LEFT SIDEBAR - Quick Links */}
          <aside className="sidebar-left" style={{
            position: 'sticky',
            top: 'calc(var(--header-height) + var(--spacing-8))',
            height: 'fit-content',
          }}>
            <div style={{
              padding: 'var(--spacing-6) 0',
            }}>
              <h3 style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginBottom: 'var(--spacing-4)',
              }}>Quick Links</h3>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <Link href="/" style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--primary-purple)',
                  padding: 'var(--spacing-2) 0',
                  borderLeft: '2px solid var(--primary-purple)',
                  paddingLeft: 'var(--spacing-3)',
                  fontWeight: 'var(--font-semibold)',
                }}>Latest Research</Link>
                <Link href="/papers" style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  padding: 'var(--spacing-2) 0',
                  borderLeft: '2px solid transparent',
                  paddingLeft: 'var(--spacing-3)',
                  transition: 'all var(--transition-base)',
                }}>Must-Read Papers</Link>
                <Link href="/about" style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  padding: 'var(--spacing-2) 0',
                  borderLeft: '2px solid transparent',
                  paddingLeft: 'var(--spacing-3)',
                }}>About Us</Link>
                <Link href="/contact" style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  padding: 'var(--spacing-2) 0',
                  borderLeft: '2px solid transparent',
                  paddingLeft: 'var(--spacing-3)',
                }}>Contact</Link>
              </nav>
            </div>
          </aside>

          {/* CENTER - Main Content */}
          <main>
            {/* Hero Section */}
            <section style={{
              marginBottom: 'var(--spacing-12)',
              padding: 'var(--spacing-8) 0',
            }}>
              <div className="badge" style={{ marginBottom: 'var(--spacing-4)' }}>
                Quantum Consciousness Research
              </div>

              <h1 className="gradient-text" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-5xl)',
                fontWeight: 'var(--font-black)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--spacing-4)',
              }}>
                Exploring the Architecture of Consciousness
              </h1>

              <p className="lead" style={{
                fontSize: 'var(--text-xl)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--spacing-6)',
              }}>
                Research at the intersection of quantum mechanics, neuroscience, and artificial intelligence
              </p>
            </section>

            {/* Featured Article */}
            {featured && (
              <section id="featured" style={{ marginBottom: 'var(--spacing-10)' }}>
                <Link href={`/${featured.slug}`} className="card" style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  overflow: 'hidden',
                }}>
                  {getFeaturedImage(featured) && (
                    <div className="featured-image" style={{
                      width: '100%',
                      height: '400px',
                      overflow: 'hidden',
                      background: 'var(--bg-gradient-subtle)',
                    }}>
                      <img
                        src={getFeaturedImage(featured)!}
                        alt={featured.title.rendered}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ padding: 'var(--spacing-8)' }}>
                    <div className="badge badge-quantum" style={{ marginBottom: 'var(--spacing-3)' }}>
                      Featured
                    </div>

                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--spacing-4)',
                      lineHeight: 'var(--leading-tight)',
                    }}>
                      {stripHtml(featured.title.rendered)}
                    </h2>

                    <p style={{
                      fontSize: 'var(--text-lg)',
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--text-secondary)',
                    }}>
                      {truncate(stripHtml(featured.content.rendered), 200)}
                    </p>
                  </div>
                </Link>
              </section>
            )}

            {/* More Articles */}
            <section>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                marginBottom: 'var(--spacing-6)',
                color: 'var(--text-primary)',
              }}>
                Recent Research
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-6)',
              }}>
                {otherArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/${article.slug}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: getFeaturedImage(article) ? '200px 1fr' : '1fr',
                      gap: 'var(--spacing-6)',
                      padding: 'var(--spacing-6)',
                      borderRadius: 'var(--border-radius-lg)',
                      border: '1px solid var(--border-light)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all var(--transition-base)',
                      background: 'var(--bg-primary)',
                    }}
                    className="card article-card-grid"
                  >
                    {getFeaturedImage(article) && (
                      <div className="article-card-image" style={{
                        width: '200px',
                        height: '150px',
                        borderRadius: 'var(--border-radius)',
                        overflow: 'hidden',
                        background: 'var(--bg-gradient-subtle)',
                      }}>
                        <img
                          src={getFeaturedImage(article)!}
                          alt={article.title.rendered}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-2)',
                      }}>
                        {stripHtml(article.title.rendered)}
                      </h3>

                      <p style={{
                        fontSize: 'var(--text-base)',
                        color: 'var(--text-secondary)',
                        lineHeight: 'var(--leading-relaxed)',
                        marginBottom: 'var(--spacing-3)',
                      }}>
                        {truncate(stripHtml(article.content.rendered), 150)}
                      </p>

                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--primary-purple)',
                        fontWeight: 'var(--font-semibold)',
                      }}>
                        Read more →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>

          {/* RIGHT SIDEBAR - Featured Papers */}
          <aside className="sidebar-right" style={{
            position: 'sticky',
            top: 'calc(var(--header-height) + var(--spacing-8))',
            height: 'fit-content',
          }}>
            {/* Featured Papers */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-6)',
              marginBottom: 'var(--spacing-6)',
            }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-4)',
              }}>
                Must-Read Papers
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <Link href="/papers" className="badge badge-quantum" style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                }}>Quantum Consciousness</Link>
                <Link href="/papers" className="badge badge-ai" style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                }}>Morphic Resonance</Link>
                <Link href="/papers" className="badge badge-morphic" style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                }}>ZPF Theory</Link>
              </div>

              <Link href="/papers" style={{
                display: 'block',
                marginTop: 'var(--spacing-4)',
                fontSize: 'var(--text-sm)',
                color: 'var(--primary-purple)',
                fontWeight: 'var(--font-semibold)',
                textDecoration: 'none',
              }}>
                View all papers →
              </Link>
            </div>

            {/* About Box */}
            <div style={{
              background: 'var(--bg-gradient-subtle)',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-6)',
              border: '1px solid var(--border-purple)',
            }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-3)',
              }}>
                About This Research
              </h3>

              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--spacing-4)',
              }}>
                Exploring the quantum nature of consciousness through interdisciplinary research.
              </p>

              <Link href="/about" className="btn btn-secondary" style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: 'var(--text-sm)',
                padding: 'var(--spacing-3) var(--spacing-4)',
              }}>
                Learn More
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: 'var(--spacing-16)',
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
    </div>
  );
}
