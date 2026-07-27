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

import { DEFAULT_LOCALE, localePath, type Locale } from '@/lib/site';

const WP_API_URL =
  process.env.WORDPRESS_API_URL || 'http://wp.consciousnessnetworks.com/wp-json/wp/v2';

/** How long rendered pages may serve cached WordPress data, in seconds. */
export const REVALIDATE_SECONDS = 60;

/** Class applied to the element that receives WordPress HTML. */
export const WP_CONTENT_CLASS = 'article-content';

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
  modified?: string;
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

export function excerptFrom(html: string, length = 160): string {
  return truncate(stripHtml(html), length);
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
/* URL helpers                                                                 */
/* -------------------------------------------------------------------------- */

/** WordPress hosts whose URLs are proxied by this frontend (see next.config.js). */
const WP_HOSTS = [
  'wp.consciousnessnetworks.com',
  'consciousnessnetworks.com',
  'www.consciousnessnetworks.com',
  '52.0.124.233',
];

function isWordPressUrl(url: string): boolean {
  try {
    return WP_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Rewrites an absolute WordPress URL to a site-relative path so it is served
 * over HTTPS through the rewrite in next.config.js instead of over plain HTTP.
 */
export function toRelativeUrl(url: string): string {
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) return url;
  if (!isWordPressUrl(url)) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
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
  const alt = entry._embedded?.['wp:featuredmedia']?.[0]?.alt_text;
  return alt?.trim() || decodeHtmlEntities(stripHtml(entry.title.rendered));
}

/* -------------------------------------------------------------------------- */
/* Content sanitising                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Prefixes every selector in a stylesheet with `scope`, so CSS pasted into a
 * WordPress editor cannot restyle the rest of the site.
 * Selectors that target the document itself (`html`, `body`, `:root`, `*`) are
 * remapped onto the scope element.
 */
function scopeCss(css: string, scope: string): string {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: string[] = [];
  let i = 0;

  while (i < source.length) {
    const open = source.indexOf('{', i);
    if (open === -1) break;

    const prelude = source.slice(i, open).trim();

    let depth = 1;
    let j = open + 1;
    while (j < source.length && depth > 0) {
      if (source[j] === '{') depth++;
      else if (source[j] === '}') depth--;
      j++;
    }
    const body = source.slice(open + 1, j - 1);

    if (prelude.startsWith('@')) {
      const atRule = prelude.split(/[\s({]/)[0].toLowerCase();
      // Conditional groups contain nested rules that also need scoping;
      // @keyframes and @font-face define names, not selectors.
      if (['@media', '@supports', '@layer', '@container'].includes(atRule)) {
        rules.push(`${prelude}{${scopeCss(body, scope)}}`);
      } else if (atRule !== '@import') {
        rules.push(`${prelude}{${body}}`);
      }
    } else if (prelude) {
      const targetsDocument = prelude
        .split(',')
        .some((selector) => /^\s*(?::root|html|body|\*)\s*$/i.test(selector));

      rules.push(
        `${scopeSelectors(prelude, scope)}{${targetsDocument ? dropPageChrome(body) : body}}`
      );
    }

    i = j;
  }

  return rules.join('\n');
}

/**
 * Removes page-level colour declarations from a rule that originally targeted
 * `html`, `body`, `:root`, or `*`. Those set the theme, which belongs to the
 * site — a pasted stylesheet asking for `background: white` would otherwise
 * punch a white block into the page for readers using the dark theme.
 */
function dropPageChrome(declarations: string): string {
  return declarations
    .split(';')
    .filter((declaration) => !/^\s*(background(-color|-image)?|color)\s*:/i.test(declaration))
    .join(';');
}

function scopeSelectors(selectorList: string, scope: string): string {
  return selectorList
    .split(',')
    .map((raw) => {
      const selector = raw.trim();
      if (!selector) return '';
      if (selector === '*') return `${scope}, ${scope} *`;

      const documentSelector = selector.match(/^(?::root|html|body)\b(.*)$/i);
      if (documentSelector) {
        const rest = documentSelector[1].trim();
        return rest ? `${scope} ${rest}` : scope;
      }

      return `${scope} ${selector}`;
    })
    .filter(Boolean)
    .join(', ');
}

/**
 * Turns WordPress `content.rendered` into a fragment that is safe to inject.
 *
 * Elementor's text widget lets an editor paste a complete HTML document. That
 * document's `<style>` block is global: on the papers page it redefined `*`,
 * `body`, and `.container` — the frontend's own layout class — and broke the
 * page around it. This strips the document wrapper, scopes any stylesheet to
 * the content element, points media at the HTTPS proxy, and rewrites internal
 * links so they land on the right locale without a redirect.
 */
export function sanitizeContent(html: string, locale: Locale = DEFAULT_LOCALE): string {
  if (!html) return '';

  const styles: string[] = [];
  let out = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    styles.push(css);
    return '';
  });

  out = out
    // Scripts pasted into content are never wanted here.
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Document scaffolding from a pasted full page.
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?(?:html|head|body)[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    // External stylesheet and font requests injected mid-document.
    .replace(/<link[^>]*>/gi, '');

  out = demoteTopHeadings(out);
  out = rewriteMediaUrls(out);
  out = rewriteInternalLinks(out, locale);
  out = annotateImages(out);

  const scoped = styles
    .map((css) => scopeCss(css, `.${WP_CONTENT_CLASS}`))
    .filter(Boolean)
    .join('\n');

  return scoped ? `<style>${scoped}</style>${out}` : out;
}

/**
 * Demotes `<h1>` in body content to `<h2>`. Each page already renders its own
 * `<h1>`; a second one from an editor's pasted markup would leave the document
 * with two top-level headings.
 */
function demoteTopHeadings(html: string): string {
  return html.replace(/<(\/?)h1(\s[^>]*)?>/gi, (_, slash, attrs) => `<${slash}h2${attrs || ''}>`);
}

/** Points `src` and `srcset` at the HTTPS proxy path. */
function rewriteMediaUrls(html: string): string {
  return html
    .replace(/(<(?:img|source|video)[^>]+src=")([^"]+)(")/gi, (_, pre, url, post) => pre + toRelativeUrl(url) + post)
    .replace(/(<(?:img|source)[^>]+srcset=")([^"]+)(")/gi, (_, pre, srcset, post) => {
      const rewritten = srcset
        .split(',')
        .map((candidate: string) => {
          const [url, ...descriptor] = candidate.trim().split(/\s+/);
          return [toRelativeUrl(url), ...descriptor].join(' ');
        })
        .join(', ');
      return pre + rewritten + post;
    });
}

/**
 * Normalises links authored inside WordPress.
 * Absolute links back to the site and hardcoded `/en/...` paths both become the
 * correct path for the locale being rendered, so no internal link 307s.
 */
function rewriteInternalLinks(html: string, locale: Locale): string {
  return html.replace(/(<a[^>]+href=")([^"]+)(")/gi, (match, pre, href, post) => {
    if (/^(?:mailto:|tel:|#)/i.test(href)) return match;

    let path: string;

    if (/^https?:\/\//i.test(href)) {
      if (!isWordPressUrl(href)) return match;
      try {
        path = new URL(href).pathname;
      } catch {
        return match;
      }
    } else if (href.startsWith('/')) {
      path = href;
    } else {
      return match;
    }

    // Drop an existing locale prefix before applying the current one.
    path = path.replace(/^\/(?:en|es)(?=\/|$)/, '') || '/';
    // WordPress emits trailing slashes; this frontend's routes do not use them.
    if (path.length > 1) path = path.replace(/\/$/, '');

    return pre + localePath(locale, path) + post;
  });
}

/** Adds lazy loading and async decoding to body images that lack them. */
function annotateImages(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs: string) => {
    let out = attrs;
    if (!/\bloading=/i.test(out)) out += ' loading="lazy"';
    if (!/\bdecoding=/i.test(out)) out += ' decoding="async"';
    if (!/\balt=/i.test(out)) out += ' alt=""';
    return `<img${out}>`;
  });
}
