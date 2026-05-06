import Link from 'next/link';
import type { Metadata } from 'next';
import { translateContent } from '@/lib/i18n';
import ContactForm from '@/components/ContactForm';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const url = `https://consciousnessnetworks.com/${params.lang}/contact`;
  return {
    title: 'Contact — Consciousness Networks',
    description: 'Write to us about research collaboration, paper submissions, or any questions related to consciousness science and quantum cognition.',
    alternates: {
      canonical: url,
      languages: {
        en: 'https://consciousnessnetworks.com/en/contact',
        es: 'https://consciousnessnetworks.com/es/contact',
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: 'Contact — Consciousness Networks',
      description: 'Write to us about research collaboration, paper submissions, or any questions related to consciousness science and quantum cognition.',
    },
  };
}

export default async function Contact({ params }: { params: { lang: string } }) {
  const { lang } = params;

  const [
    researchLabel,
    papersLabel,
    aboutLabel,
    contactLabel,
    heroTitle,
    heroText,
    collaborationTitle,
    collaborationHeading,
    collaborationText,
    papersHeading,
    papersText,
    privacyNotice,
    footerText,
  ] = await Promise.all([
    translateContent('Research', lang),
    translateContent('Papers', lang),
    translateContent('About', lang),
    translateContent('Contact', lang),
    translateContent('Get in Touch', lang),
    translateContent('Questions about consciousness research, quantum cognition, or interested in collaborating? Write to us.', lang),
    translateContent('Research & Collaboration', lang),
    translateContent('Research collaboration', lang),
    translateContent('Working on empirical or theoretical consciousness research? We welcome exchanges with other researchers and institutions.', lang),
    translateContent('Paper submissions', lang),
    translateContent('Know a paper that belongs in our reading list? Share it with us and we\'ll review it for inclusion.', lang),
    translateContent('Your contact information is used solely to respond to your inquiry and is never shared with third parties.', lang),
    translateContent(`© ${new Date().getFullYear()} Consciousness Networks. All rights reserved.`, lang),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        name: 'Contact Consciousness Networks',
        url: `https://consciousnessnetworks.com/${lang}/contact`,
        publisher: {
          '@type': 'Organization',
          name: 'Consciousness Networks',
          url: 'https://consciousnessnetworks.com',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Research', item: `https://consciousnessnetworks.com/${lang}` },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: `https://consciousnessnetworks.com/${lang}/contact` },
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

      <header className="header-glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
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
            <Link href={`/${lang}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
              {researchLabel}
            </Link>
            <Link href={`/${lang}/papers`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
              {papersLabel}
            </Link>
            <Link href={`/${lang}/about`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
              {aboutLabel}
            </Link>
            <Link href={`/${lang}/contact`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--primary-purple)' }}>
              {contactLabel}
            </Link>
          </nav>

          <nav className="nav-mobile" style={{ display: 'none', gap: 'var(--spacing-4)' }}>
            <Link href={`/${lang}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{researchLabel}</Link>
            <Link href={`/${lang}/papers`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{papersLabel}</Link>
            <Link href={`/${lang}/about`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{aboutLabel}</Link>
            <Link href={`/${lang}/contact`} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--primary-purple)' }}>{contactLabel}</Link>
          </nav>
        </div>
      </header>

      <main style={{ paddingTop: 'var(--header-height)' }}>
        <section style={{
          padding: 'var(--spacing-16) 0 var(--spacing-10)',
          background: 'var(--bg-gradient-subtle)',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div className="container">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <p style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--primary-purple)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 'var(--spacing-3)',
              }}>
                {contactLabel}
              </p>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, var(--text-4xl))',
                fontWeight: 'var(--font-black)',
                color: 'var(--text-primary)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--spacing-4)',
              }}>
                {heroTitle}
              </h1>
              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}>
                {heroText}
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: 'var(--spacing-12) 0' }}>
          <div className="container">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <ContactForm />

              <div style={{
                marginTop: 'var(--spacing-12)',
                paddingTop: 'var(--spacing-10)',
                borderTop: '1px solid var(--border-light)',
              }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  marginBottom: 'var(--spacing-6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                }}>{collaborationTitle}</h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'var(--spacing-4)',
                }}>
                  <div style={{
                    padding: 'var(--spacing-5)',
                    borderLeft: '3px solid var(--primary-purple)',
                    background: 'rgba(102, 126, 234, 0.04)',
                  }}>
                    <h4 style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      marginBottom: 'var(--spacing-2)',
                    }}>{collaborationHeading}</h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--leading-relaxed)',
                      margin: 0,
                    }}>
                      {collaborationText}
                    </p>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-5)',
                    borderLeft: '3px solid #764ba2',
                    background: 'rgba(118, 75, 162, 0.04)',
                  }}>
                    <h4 style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      marginBottom: 'var(--spacing-2)',
                    }}>{papersHeading}</h4>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--leading-relaxed)',
                      margin: 0,
                    }}>
                      {papersText}
                    </p>
                  </div>
                </div>
              </div>

              <p style={{
                marginTop: 'var(--spacing-10)',
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-xs)',
                lineHeight: 'var(--leading-relaxed)',
                textAlign: 'center',
              }}>
                {privacyNotice}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{
        marginTop: 'var(--spacing-16)',
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
