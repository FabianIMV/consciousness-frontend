import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/wordpress';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://consciousnessnetworks.com';
  const locales = ['en', 'es'];
  const staticPaths = ['', '/papers', '/about', '/contact'];

  const entries: MetadataRoute.Sitemap = [];

  locales.forEach((lang) => {
    staticPaths.forEach((path) => {
      entries.push({
        url: `${baseUrl}/${lang}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' || path === '/papers' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.8,
      });
    });
  });

  try {
    const posts = await getPosts();
    posts.forEach((post) => {
      locales.forEach((lang) => {
        entries.push({
          url: `${baseUrl}/${lang}/${post.slug}`,
          lastModified: new Date(post.modified || post.date),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      });
    });
  } catch {
    // Sitemap still returns static pages if WP is unreachable
  }

  return entries;
}
