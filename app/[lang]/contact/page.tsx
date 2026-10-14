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
import {
  CONTACT_EMAIL,
  DEFAULT_LOCALE,
  alternatesFor,
  isLocale,
  ogImageFor,
  type Locale,
} from '@/lib/site';

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
      images: ogImageFor(locale),
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

      <main id="main" tabIndex={-1} className="page__body">
        <header className="container page-header">
          <div className="reading reading--wide">
            <h1 className="page-header__title">{t.contact.title}</h1>
            <p className="standfirst">{t.contact.subtitle}</p>
          </div>
        </header>

        <div className="container">
          <div className="reading reading--wide contact-layout">
            <ContactForm locale={locale} />

            <aside className="contact-notes">
              <section className="contact-note">
                <h2 className="contact-note__heading mono">{t.contact.directHeading}</h2>
                <p>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="contact-note__email">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </section>

              <section className="contact-note">
                <h2 className="contact-note__heading mono">{t.contact.collaborationHeading}</h2>
                <p>{t.contact.collaborationText}</p>
              </section>

              <section className="contact-note">
                <h2 className="contact-note__heading mono">{t.contact.papersHeading}</h2>
                <p>{t.contact.papersText}</p>
              </section>

              <p className="contact-notes__privacy mono">{t.contact.privacy}</p>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
