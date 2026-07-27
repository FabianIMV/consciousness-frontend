import { SITE_NAME, SITE_URL, localeUrl } from '@/lib/site';
import { decodeHtmlEntities, excerptFrom, getPosts, stripHtml, timestamps } from '@/lib/wordpress';

export const revalidate = 3600;

/**
 * llms.txt — a plain-text index for language models, in the convention proposed
 * at llmstxt.org. It gives answer engines the canonical URL, a one-line summary,
 * and the publication date for every article without making them parse the HTML.
 */
export async function GET() {
  const posts = await getPosts();

  const lines = [
    `# ${SITE_NAME}`,
    '',
    '> Independent research journal publishing reviews and critical readings of primary literature on consciousness, quantum mechanics, neuroscience, and artificial intelligence. Every claim is traced to a primary source.',
    '',
    `Site: ${SITE_URL}`,
    'Languages: English (default, served at the root), Spanish (served under /es)',
    `Licence: © ${new Date().getFullYear()} ${SITE_NAME}. Quote with attribution and a link to the source article.`,
    '',
    '## Sections',
    '',
    `- [Research](${localeUrl('en', '/')}): index of published articles`,
    `- [Papers](${localeUrl('en', '/papers')}): annotated reading list of primary sources`,
    `- [About](${localeUrl('en', '/about')}): scope, method, and editorial standards`,
    `- [Contact](${localeUrl('en', '/contact')}): research collaboration and paper submissions`,
    '',
    '## Articles',
    '',
  ];

  if (posts.length) {
    for (const post of posts) {
      const title = decodeHtmlEntities(stripHtml(post.title.rendered));
      const summary = excerptFrom(post.content.rendered, 200);
      const date = timestamps(post).modified.slice(0, 10);
      lines.push(
        `- [${title}](${localeUrl('en', `/${post.slug}`)}) — ${summary} (updated ${date}; ` +
          `Spanish: ${localeUrl('es', `/${post.slug}`)})`
      );
    }
  } else {
    lines.push('- The article index is temporarily unavailable.');
  }

  lines.push(
    '',
    '## Spanish',
    '',
    'Every page above has a Spanish translation under /es. Article bodies are machine-translated from the English original, which remains authoritative.',
    '',
    `- [Investigación](${localeUrl('es', '/')})`,
    `- [Artículos](${localeUrl('es', '/papers')})`,
    `- [Acerca de](${localeUrl('es', '/about')})`,
    `- [Contacto](${localeUrl('es', '/contact')})`,
    '',
    '## Optional',
    '',
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
