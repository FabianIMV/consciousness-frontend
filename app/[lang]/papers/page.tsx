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

const PATH = '/papers';

const DESCRIPTION: Record<Locale, string> = {
  en: 'An annotated reading list of foundational and recent research on quantum mechanics, neuroscience, and consciousness science, with a link to every primary source.',
  es: 'Una lista de lectura comentada de investigación fundacional y reciente sobre mecánica cuántica, neurociencia y ciencia de la consciencia, con enlace a cada fuente primaria.',
};

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return {
    title: t.papers.title,
    description: DESCRIPTION[locale],
    alternates: alternatesFor(locale, PATH),
    openGraph: {
      type: 'website',
      url: alternatesFor(locale, PATH).canonical,
      title: t.papers.title,
      description: DESCRIPTION[locale],
      images: ogImageFor(locale),
    },
  };
}

export default async function PapersPage({ params }: { params: { lang: string } }) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const page = await getPageBySlug('papers');
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
      name: t.papers.title,
      description: DESCRIPTION[locale],
      type: 'CollectionPage',
    }),
    breadcrumbNode(locale, [
      { name: t.nav.research, path: '/' },
      { name: t.nav.papers, path: PATH },
    ]),
  ]);

  return (
    <EditorialPage
      locale={locale}
      active="papers"
      path={PATH}
      eyebrow={t.papers.eyebrow}
      title={t.papers.title}
      subtitle={t.papers.subtitle}
      content={content}
      contentLanguage={contentLanguage}
      fallbackText={t.papers.unavailable}
      structuredData={structuredData}
    />
  );
}
