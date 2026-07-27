import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { getDictionary } from '@/lib/dictionaries';
import {
  breadcrumbNode,
  graph,
  organizationNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';
import { DEFAULT_LOCALE, alternatesFor, isLocale, type Locale } from '@/lib/site';

export const revalidate = 3600;

const PATH = '/contact';

const DESCRIPTION: Record<Locale, string> = {
  en: 'Contact Consciousness Networks about research collaboration, paper submissions, or questions on consciousness science and quantum cognition.',
  es: 'Contacta con Consciousness Networks para colaborar en investigación, proponer artículos o resolver dudas sobre ciencia de la consciencia y cognición cuántica.',
};

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return {
    title: t.contact.title,
    description: DESCRIPTION[locale],
    alternates: alternatesFor(locale, PATH),
    openGraph: {
      type: 'website',
      url: alternatesFor(locale, PATH).canonical,
      title: t.contact.title,
      description: DESCRIPTION[locale],
    },
  };
}

export default function ContactPage({ params }: { params: { lang: string } }) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const structuredData = graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode({
      locale,
      path: PATH,
      name: t.contact.title,
      description: DESCRIPTION[locale],
      type: 'ContactPage',
    }),
    breadcrumbNode(locale, [
      { name: t.nav.research, path: '/' },
      { name: t.nav.contact, path: PATH },
    ]),
  ]);

  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <SiteHeader locale={locale} active="contact" path={PATH} />

      <div className="page__body">
        <section className="page-hero">
          <div className="container container--reading">
            <p className="eyebrow page-hero__eyebrow">{t.contact.eyebrow}</p>
            <h1 className="page-hero__title">{t.contact.title}</h1>
            <p className="standfirst">{t.contact.subtitle}</p>
          </div>
        </section>

        <main id="main">
          <div
            className="container container--reading"
            style={{ paddingBlock: 'var(--spacing-12)' }}
          >
            <ContactForm locale={locale} />

            <section
              aria-labelledby="collaboration-heading"
              style={{
                marginTop: 'var(--spacing-12)',
                paddingTop: 'var(--spacing-10)',
                borderTop: '1px solid var(--rule)',
              }}
            >
              <h2
                id="collaboration-heading"
                className="section-heading"
                style={{ marginBottom: 'var(--spacing-6)' }}
              >
                {t.contact.sectionTitle}
              </h2>

              <div className="panel-grid">
                <div className="panel">
                  <h3 className="panel__heading">{t.contact.collaborationHeading}</h3>
                  <p className="panel__text">{t.contact.collaborationText}</p>
                </div>

                <div className="panel">
                  <h3 className="panel__heading">{t.contact.papersHeading}</h3>
                  <p className="panel__text">{t.contact.papersText}</p>
                </div>
              </div>
            </section>

            <p
              className="panel__text"
              style={{ marginTop: 'var(--spacing-10)', color: 'var(--text-tertiary)' }}
            >
              {t.contact.privacy}
            </p>
          </div>
        </main>
      </div>

      <SiteFooter locale={locale} />
    </div>
  );
}
