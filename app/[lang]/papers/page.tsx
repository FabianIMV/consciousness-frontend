import Link from 'next/link';
import { getPageBySlug, processContent, decodeHtmlEntities, stripHtml, truncate } from '@/lib/wordpress';
import { translateContent } from '@/lib/i18n';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const url = `https://consciousnessnetworks.com/${params.lang}/papers`;
  return {
    title: 'Essential Papers — Consciousness Networks',
    description: 'A curated reading list of foundational research at the intersection of quantum mechanics, neuroscience, and consciousness science.',
    alternates: {
      canonical: url,
      languages: {
        en: 'https://consciousnessnetworks.com/en/papers',
        es: 'https://consciousnessnetworks.com/es/papers',
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: 'Essential Papers — Consciousness Networks',
      description: 'A curated reading list of foundational research at the intersection of quantum mechanics, neuroscience, and consciousness science.',
    },
  };
}

export default async function Papers({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const page = await getPageBySlug('papers');
  const titleRaw = page ? decodeHtmlEntities(stripHtml(page.title.rendered)) : 'Essential Papers';
  const contentRaw = page ? processContent(page.content.rendered) : '';

  const [
    title,
    content,
    readingListLabel,
    heroSubtitle,
    researchLabel,
    papersLabel,
    aboutLabel,
    contactLabel,
    footerText,
  ] = await Promise.all([
    translateContent(titleRaw, lang),
    translateContent(contentRaw, lang),
    translateContent('Reading List', lang),
    translateContent('Foundational texts on quantum mechanics, neuroscience, and consciousness science — curated for researchers and curious minds.', lang),
    translateContent('Research', lang),
    translateContent('Papers', lang),
    translateContent('About', lang),
    translateContent('Contact', lang),
    translateContent(`© ${new Date().getFullYear()} Consciousness Networks. All rights reserved.`, lang),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: titleRaw,
        description: 'A curated reading list of foundational research at the intersection of quantum mechanics, neuroscience, and consciousness science.',
        url: `https://consciousnessnetworks.com/${lang}/papers`,
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
          { '@type': 'ListItem', position: 2, name: 'Papers', item: `https://consciousnessnetworks.com/${lang}/papers` },
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
            <Link href={`/${lang}/papers`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--primary-purple)' }}>
              {papersLabel}
            </Link>
            <Link href={`/${lang}/about`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
              {aboutLabel}
            </Link>
            <Link href={`/${lang}/contact`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
              {contactLabel}
            </Link>
          </nav>

          <nav className="nav-mobile" style={{ display: 'none', gap: 'var(--spacing-4)' }}>
            <Link href={`/${lang}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{researchLabel}</Link>
            <Link href={`/${lang}/papers`} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--primary-purple)' }}>{papersLabel}</Link>
            <Link href={`/${lang}/about`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{aboutLabel}</Link>
            <Link href={`/${lang}/contact`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{contactLabel}</Link>
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
            <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
              <p style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--primary-purple)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 'var(--spacing-3)',
              }}>
                {readingListLabel}
              </p>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, var(--text-4xl))',
                fontWeight: 'var(--font-black)',
                color: 'var(--text-primary)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--spacing-4)',
              }}>
                {title}
              </h1>
              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '600px',
              }}>
                {heroSubtitle}
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: 'var(--spacing-12) 0' }}>
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
