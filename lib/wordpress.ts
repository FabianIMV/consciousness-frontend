/**
 * WordPress REST client.
 *
 * The backend is a WordPress install on Lightsail reached over its internal
 * hostname. It is a Multisite, so requests go to the host directly rather than
 * through the public domain, which would resolve to this frontend.
 *
 * Editors work in Elementor, so `content.rendered` cannot be trusted to be a
 * clean fragment — see `sanitizeContent`.
 */

import { toRelativeUrl } from '@/lib/urls';

export { toRelativeUrl } from '@/lib/urls';
export { WP_CONTENT_CLASS, sanitizeContent } from '@/lib/sanitize';

const WP_API_URL =
  process.env.WORDPRESS_API_URL || 'http://wp.consciousnessnetworks.com/wp-json/wp/v2';

/** How long rendered pages may serve cached WordPress data, in seconds. */
export const REVALIDATE_SECONDS = 60;

export interface WordPressMedia {
  source_url: string;
  alt_text: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width?: number; height?: number }>;
  };
}

interface WordPressEntity {
  id: number;
  date: string;
  /** UTC counterparts. WordPress omits the offset from `date`/`modified`. */
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  _embedded?: {
    author?: Array<{ name: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: WordPressMedia[];
  };
}

export interface WordPressPost extends WordPressEntity {
  status?: string;
  sticky?: boolean;
  excerpt?: { rendered: string };
  author?: number;
}

export interface WordPressPage extends WordPressEntity {}

async function wpFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${WP_API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.error(`[wordpress] ${path} responded ${res.status}`);
      return fallback;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[wordpress] ${path} failed:`, error);
    return fallback;
  }
}

/** All published posts, newest first. */
export async function getPosts(): Promise<WordPressPost[]> {
  const posts = await wpFetch<WordPressPost[]>('/posts?_embed&per_page=100', []);
  if (!Array.isArray(posts)) return [];

  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  const posts = await wpFetch<WordPressPost[]>(
    `/posts?slug=${encodeURIComponent(slug)}&_embed`,
    []
  );
  return Array.isArray(posts) ? posts[0] ?? null : null;
}

export async function getPages(): Promise<WordPressPage[]> {
  const pages = await wpFetch<WordPressPage[]>('/pages?per_page=100&_embed', []);
  return Array.isArray(pages) ? pages : [];
}

export async function getPageBySlug(slug: string): Promise<WordPressPage | null> {
  const pages = await wpFetch<WordPressPage[]>(
    `/pages?slug=${encodeURIComponent(slug)}&_embed`,
    []
  );
  return Array.isArray(pages) ? pages[0] ?? null : null;
}

/* -------------------------------------------------------------------------- */
/* Text helpers                                                                */
/* -------------------------------------------------------------------------- */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

/** Plain text from WordPress HTML, with markup, styles, and scripts removed. */
export function stripHtml(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(
    html
      .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Truncates on a word boundary so excerpts do not end mid-word. */
export function truncate(text: string, length = 160): string {
  if (!text || text.length <= length) return text;
  const cut = text.slice(0, length);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > length * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, '')}…`;
}

/**
 * Summary text for an entry.
 *
 * Built from the body's paragraphs rather than the whole document: flattening
 * everything runs a heading straight into the sentence after it, producing
 * excerpts like "The Hard Problem Gets a Breakthrough Tool Why does the firing
 * of neurons…". Paragraphs are joined only if the first one is too short to
 * stand alone.
 */
export function excerptFrom(html: string, length = 160): string {
  if (!html) return '';

  const paragraphs = Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  if (!paragraphs.length) return truncate(stripHtml(html), length);

  let text = paragraphs[0];
  for (let i = 1; i < paragraphs.length && text.length < length * 0.6; i += 1) {
    text += ` ${paragraphs[i]}`;
  }

  return truncate(text, length);
}

export function wordCount(html: string): number {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).length : 0;
}

/** Reading time in whole minutes, at 200 words per minute. */
export function readingTime(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 200));
}

/* -------------------------------------------------------------------------- */
/* Media and timestamps                                                        */
/* -------------------------------------------------------------------------- */

/**
 * ISO 8601 timestamp with an explicit UTC designator.
 *
 * WordPress returns `date`/`modified` as site-local time with no offset, which
 * is ambiguous in structured data. The `_gmt` variants carry the same instant in
 * UTC but still omit the `Z`.
 */
export function toIsoUtc(local: string, gmt?: string): string {
  if (gmt) return gmt.endsWith('Z') ? gmt : `${gmt}Z`;
  return local;
}

/** Publication and modification instants for an entry, in UTC. */
export function timestamps(entry: { date: string; date_gmt?: string; modified?: string; modified_gmt?: string }) {
  const published = toIsoUtc(entry.date, entry.date_gmt);
  const modified = entry.modified ? toIsoUtc(entry.modified, entry.modified_gmt) : published;
  return { published, modified };
}

/**
 * Featured image for an entry, falling back to the first image in the body.
 * Prefers the largest rendition WordPress generated.
 */
export function getFeaturedImage(entry: WordPressEntity): string | null {
  const media = entry._embedded?.['wp:featuredmedia']?.[0];
  if (media) {
    const sizes = media.media_details?.sizes;
    const url =
      sizes?.full?.source_url ||
      sizes?.large?.source_url ||
      sizes?.medium_large?.source_url ||
      sizes?.medium?.source_url ||
      media.source_url;
    if (url) return toRelativeUrl(url);
  }

  const inline = entry.content?.rendered?.match(/<img[^>]+src="([^">]+)"/);
  return inline?.[1] ? toRelativeUrl(inline[1]) : null;
}

export function getFeaturedImageAlt(entry: WordPressEntity): string {
  // WordPress returns alt text with entities intact; React escapes on output,
  // so an undecoded `&#8217;` would be announced literally by a screen reader.
  const alt = decodeHtmlEntities(entry._embedded?.['wp:featuredmedia']?.[0]?.alt_text ?? '').trim();
  return alt || decodeHtmlEntities(stripHtml(entry.title.rendered));
}
