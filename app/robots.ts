import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Crawler policy.
 *
 * Answer engines are named explicitly rather than left to the wildcard: several
 * of them treat an unnamed agent conservatively, and being cited in generated
 * answers is a goal for this site. `/api/` is excluded because those routes
 * accept submissions and return no indexable content.
 */
const ANSWER_ENGINE_AGENTS = [
  // OpenAI
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google and Microsoft AI surfaces
  'Google-Extended',
  'Applebot-Extended',
  // Common Crawl, used to build many training and retrieval corpora
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: ANSWER_ENGINE_AGENTS,
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
