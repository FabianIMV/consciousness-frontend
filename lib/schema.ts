/**
 * schema.org graphs.
 *
 * Every page emits one `@graph` whose nodes share stable `@id`s, so the
 * Organization and WebSite are described once and referenced everywhere else.
 * Consistent entity identity is what lets search and answer engines attribute
 * an article to this publication rather than treating each page as unrelated.
 */

import { HTML_LOCALE, SITE_NAME, SITE_URL, localeUrl, type Locale } from '@/lib/site';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const ORGANIZATION_DESCRIPTION =
  'Independent research initiative publishing reviews and critical readings of primary literature on consciousness, quantum mechanics, and artificial intelligence.';

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: ORGANIZATION_DESCRIPTION,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon.svg`,
    },
    knowsAbout: [
      'Consciousness studies',
      'Quantum mechanics',
      'Neuroscience',
      'Artificial intelligence',
      'Integrated information theory',
    ],
  };
}

export function websiteNode(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: ORGANIZATION_DESCRIPTION,
    inLanguage: HTML_LOCALE[locale],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function webPageNode({
  locale,
  path,
  name,
  description,
  type = 'WebPage',
}: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage';
}) {
  const url = localeUrl(locale, path);
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: HTML_LOCALE[locale],
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function breadcrumbNode(
  locale: Locale,
  trail: Array<{ name: string; path: string }>
) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${localeUrl(locale, trail[trail.length - 1]?.path ?? '/')}#breadcrumb`,
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: localeUrl(locale, crumb.path),
    })),
  };
}

export function articleNode({
  locale,
  path,
  headline,
  description,
  datePublished,
  dateModified,
  image,
  wordCount,
  keywords,
}: {
  locale: Locale;
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string | null;
  wordCount?: number;
  keywords?: string[];
}) {
  const url = localeUrl(locale, path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    inLanguage: HTML_LOCALE[locale],
    datePublished,
    dateModified,
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    ...(image && {
      image: { '@type': 'ImageObject', url: image.startsWith('http') ? image : `${SITE_URL}${image}` },
    }),
    ...(wordCount ? { wordCount } : {}),
    ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
  };
}

/** Ordered list of articles — helps answer engines read an index page. */
export function itemListNode(
  locale: Locale,
  items: Array<{ name: string; path: string }>
) {
  return {
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: localeUrl(locale, item.path),
      name: item.name,
    })),
  };
}

export function graph(nodes: unknown[]) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
