import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE, LOCALES, localeUrl } from '@/lib/site';
import { getPageBySlug, getPosts, timestamps } from '@/lib/wordpress';

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
    languages: {
      ...Object.fromEntries(LOCALES.map((locale) => [locale, localeUrl(locale, path)])),
      'x-default': localeUrl(DEFAULT_LOCALE, path),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // A WordPress outage should not empty the sitemap of its static routes.
  const posts = await getPosts();

  // Report when the content actually changed. Stamping every regeneration with
  // the current time makes lastmod a signal crawlers learn to ignore.
  const [papersPage, aboutPage] = await Promise.all([
    getPageBySlug('papers'),
    getPageBySlug('about'),
  ]);

  const newestPost = posts[0] ? new Date(timestamps(posts[0]).modified) : new Date();

  const lastModifiedFor: Record<string, Date> = {
    '/': newestPost,
    '/papers': papersPage ? new Date(timestamps(papersPage).modified) : newestPost,
    '/about': aboutPage ? new Date(timestamps(aboutPage).modified) : newestPost,
    '/contact': aboutPage ? new Date(timestamps(aboutPage).modified) : newestPost,
  };

  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: localeUrl(locale, route.path),
        lastModified: lastModifiedFor[route.path] ?? newestPost,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: languagesFor(route.path),
      });
    }
  }

  for (const post of posts) {
    const path = `/${post.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: new Date(timestamps(post).modified),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: languagesFor(path),
      });
    }
  }

  return entries;
}
