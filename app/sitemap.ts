import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://consciousnessnetworks.com';
  const locales = ['en', 'es'];
  const paths = ['', '/papers', '/about', '/contact'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((lang) => {
    paths.forEach((path) => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' || path === '/papers' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
