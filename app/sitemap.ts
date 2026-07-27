import type { MetadataRoute } from 'next';
import { LOCALES, localeUrl } from '@/lib/site';
import { getPosts } from '@/lib/wordpress';

export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/papers', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.3 },
];

/** Every entry declares its translations, so both locales are indexed as one page. */
function languagesFor(path: string) {
  return {
    languages: Object.fromEntries(LOCALES.map((locale) => [locale, localeUrl(locale, path)])),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: localeUrl(locale, route.path),
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: languagesFor(route.path),
      });
    }
  }

  // A WordPress outage should not empty the sitemap of its static routes.
  const posts = await getPosts();

  for (const post of posts) {
    const path = `/${post.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: new Date(post.modified || post.date),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: languagesFor(path),
      });
    }
  }

  return entries;
}
