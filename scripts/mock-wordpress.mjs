/**
 * Mock WordPress REST API for local development and CI.
 *
 * The real backend sits on a private Lightsail host that is not reachable from
 * every environment, and a build should not depend on it. This serves the same
 * endpoints with the same response shape, using a real captured page
 * (tests/fixtures/wp-page-papers.json) plus representative posts, including the
 * Elementor-authored full HTML document that `sanitizeContent()` has to handle.
 *
 *   node scripts/mock-wordpress.mjs           # listens on 8081
 *   WORDPRESS_API_URL=http://127.0.0.1:8081/wp-json/wp/v2 npm run build
 */

import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const papersPage = JSON.parse(read('tests/fixtures/wp-page-papers.json'));
const mitArticle = read('content/mit-tfus-consciousness-breakthrough-2026.html');

const UPLOADS = 'http://wp.consciousnessnetworks.com/wp-content/uploads/2026/01';

const media = (file, alt) => ({
  source_url: `${UPLOADS}/${file}`,
  alt_text: alt,
  media_details: {
    sizes: {
      medium: { source_url: `${UPLOADS}/${file}` },
      large: { source_url: `${UPLOADS}/${file}` },
      full: { source_url: `${UPLOADS}/${file}` },
    },
  },
});

const post = ({ id, slug, title, content, date, modified, image }) => ({
  id,
  date,
  date_gmt: date,
  modified: modified ?? date,
  modified_gmt: modified ?? date,
  slug,
  status: 'publish',
  type: 'post',
  link: `http://wp.consciousnessnetworks.com/${slug}/`,
  title: { rendered: title },
  content: { rendered: content, protected: false },
  excerpt: { rendered: `<p>${content.replace(/<[^>]+>/g, ' ').trim().slice(0, 140)}…</p>` },
  author: 1,
  featured_media: id,
  _embedded: {
    author: [{ name: 'Consciousness Networks', avatar_urls: {} }],
    'wp:featuredmedia': [media(image, title)],
  },
});

const POSTS = [
  post({
    id: 101,
    slug: 'mit-tfus-consciousness-breakthrough-2026',
    title: 'Transcranial Focused Ultrasound: MIT&#8217;s Tool to Map the Neural Substrate of Consciousness',
    content: mitArticle,
    date: '2026-01-13T09:00:00',
    modified: '2026-02-01T09:00:00',
    image: 'tfus-featured.jpg',
  }),
  post({
    id: 102,
    slug: 'the-soul-crisis',
    title: 'The Soul Crisis: Consciousness in the Age of AI',
    content:
      '<p>As artificial intelligence advances, humanity faces a critical juncture in understanding consciousness itself.</p><h1>A question of substrate</h1><p>The intersection of quantum mechanics, neuroscience, and computational theory reveals patterns suggesting consciousness may be more fundamental than assumed.</p><p>See the <a href="http://wp.consciousnessnetworks.com/papers/">reading list</a> and the <a href="/en/about">about page</a> for background.</p><img src="http://wp.consciousnessnetworks.com/wp-content/uploads/2026/01/soul-inline.jpg" srcset="http://wp.consciousnessnetworks.com/wp-content/uploads/2026/01/soul-inline.jpg 800w, http://wp.consciousnessnetworks.com/wp-content/uploads/2026/01/soul-inline-400.jpg 400w" alt="Illustration" />',
    date: '2026-01-15T10:30:00',
    image: 'soul-crisis-featured.jpg',
  }),
  post({
    id: 103,
    slug: 'quantum-entanglement-and-the-binding-problem',
    title: 'Quantum Entanglement &amp; the Binding Problem',
    content:
      '<p>How does the brain bind distributed neural activity into a single unified experience? Orchestrated objective reduction proposes an answer rooted in quantum coherence.</p><h2>Evidence and objections</h2><p>Decoherence timescales remain the central objection.</p>',
    date: '2025-12-02T08:00:00',
    image: 'entanglement-featured.jpg',
  }),
  post({
    id: 104,
    slug: 'morphic-resonance-revisited',
    title: 'Morphic Resonance Revisited',
    content:
      '<p>Sheldrake&#8217;s hypothesis of formative causation has never been comfortably accommodated by mainstream biology. We review the experimental record.</p>',
    date: '2025-10-21T08:00:00',
    image: 'morphic-featured.jpg',
  }),
  post({
    id: 105,
    slug: 'integrated-information-theory-a-critical-reading',
    title: 'Integrated Information Theory: A Critical Reading',
    content:
      '<p>IIT assigns consciousness a quantity, phi. We examine what the theory predicts and where it makes contact with experiment.</p>',
    date: '2025-08-09T08:00:00',
    image: 'iit-featured.jpg',
  }),
];

const PAGES = [
  { ...papersPage, _embedded: { 'wp:featuredmedia': [media('papers-featured.jpg', 'Papers')] } },
  {
    id: 3,
    date: '2025-06-01T08:00:00',
    modified: '2026-01-02T08:00:00',
    slug: 'about',
    status: 'publish',
    type: 'page',
    link: 'http://wp.consciousnessnetworks.com/about/',
    title: { rendered: 'About' },
    content: {
      rendered:
        '<p>Consciousness Networks is an independent research initiative. We read, summarise, and argue about work at the intersection of quantum mechanics, neuroscience, and artificial intelligence.</p><h2>What we publish</h2><p>Long-form reviews of primary literature and a curated reading list.</p><h2>Editorial standards</h2><p>Every claim is sourced to a primary reference. Where evidence is contested we say so.</p>',
    },
    excerpt: { rendered: '<p>An independent research initiative.</p>' },
    featured_media: 0,
  },
];

const json = (res, body, status = 200) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64'
);

const server = http.createServer((req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');
  const slug = searchParams.get('slug');

  if (pathname === '/wp-json') {
    return json(res, { name: 'Consciousness Networks', description: 'Research' });
  }

  if (pathname === '/wp-json/wp/v2/posts') {
    return json(res, slug ? POSTS.filter((p) => p.slug === slug) : POSTS);
  }

  if (pathname === '/wp-json/wp/v2/pages') {
    return json(res, slug ? PAGES.filter((p) => p.slug === slug) : PAGES);
  }

  if (pathname.startsWith('/wp-content/uploads/')) {
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': TRANSPARENT_GIF.length });
    return res.end(TRANSPARENT_GIF);
  }

  json(res, { code: 'rest_no_route' }, 404);
});

const port = Number(process.env.MOCK_WP_PORT || 8081);
server.listen(port, '127.0.0.1', () => {
  console.log(`Mock WordPress listening on http://127.0.0.1:${port}/wp-json/wp/v2`);
});
