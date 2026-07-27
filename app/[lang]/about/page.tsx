import type { Metadata } from 'next';
import EditorialPage from '@/components/EditorialPage';
import { getDictionary } from '@/lib/dictionaries';
import { translateContent } from '@/lib/i18n';
import {
  breadcrumbNode,
  graph,
  organizationNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';
import { DEFAULT_LOCALE, alternatesFor, isLocale, ogImageFor, type Locale } from '@/lib/site';
import { REVALIDATE_SECONDS, getPageBySlug, sanitizeContent } from '@/lib/wordpress';

export const revalidate = REVALIDATE_SECONDS;

const PATH = '/about';

const DESCRIPTION: Record<Locale, string> = {
  en: 'Consciousness Networks is an independent research initiative documenting work at the intersection of quantum mechanics, neuroscience, and artificial intelligence.',
  es: 'Consciousness Networks es una iniciativa de investigación independiente que documenta el trabajo en la intersección de la mecánica cuántica, la neurociencia y la inteligencia artificial.',
};

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return {
    title: t.about.title,
    description: DESCRIPTION[locale],
    alternates: alternatesFor(locale, PATH),
    openGraph: {
      type: 'website',
      url: alternatesFor(locale, PATH).canonical,
      title: t.about.title,
      description: DESCRIPTION[locale],
      images: ogImageFor(locale),
    },
  };
}

export default async function AboutPage({ params }: { params: { lang: string } }) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const page = await getPageBySlug('about');
  const source = page ? sanitizeContent(page.content.rendered, locale) : '';
  const content = source ? await translateContent(source, locale) : '';
  // Without a translation key the body stays English; say so, or a Spanish
  // screen reader voices English prose.
  const contentLanguage = locale !== 'en' && content === source ? 'en' : undefined;

  const structuredData = graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode({
      locale,
      path: PATH,
      name: t.about.title,
      description: DESCRIPTION[locale],
      type: 'AboutPage',
    }),
    breadcrumbNode(locale, [
      { name: t.nav.research, path: '/' },
      { name: t.nav.about, path: PATH },
    ]),
  ]);

  return (
    <EditorialPage
      locale={locale}
      active="about"
      path={PATH}
      eyebrow={t.about.eyebrow}
      title={t.about.title}
      subtitle={t.about.subtitle}
      content={content}
      contentLanguage={contentLanguage}
      fallbackText={t.about.unavailable}
      structuredData={structuredData}
    />
  );
}
