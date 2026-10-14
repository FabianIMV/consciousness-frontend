/**
 * Turns WordPress `content.rendered` into a fragment that is safe to inject and
 * that takes its appearance from this site, not from whoever wrote the post.
 *
 * Editors work in Elementor, whose text widget accepts a complete pasted HTML
 * document, and most published posts are exactly that: generated pages that
 * carry their own `<style>` block, inline styles, Google Fonts links, and emoji
 * used as icons. An earlier version scoped those stylesheets under the content
 * element and rendered them as a "light island". That contained the layout
 * damage but kept the look — violet gradient banners, gold bold text, drop
 * shadows, pill badges — which is the opposite of the design this site is
 * built on, and the parsing it needed was the source of four separate bugs.
 *
 * So author CSS is now discarded outright. The markup keeps its structure and
 * its class names, and `styles/wordpress.css` gives the recurring components
 * (quotes, callouts, card grids, reference lists, the reading-list entries)
 * the site's own treatment.
 *
 * Beyond that, this module repairs what pasting does to prose:
 *
 * - hard line wraps that `wpautop` turned into `<br>` mid-sentence are joined;
 * - lines that were headings before their styled `<div>` was stripped are
 *   promoted back to headings;
 * - empty paragraphs and symbol-only dividers become nothing and `<hr>`;
 * - a leading heading that repeats the page title is removed.
 *
 * It also removes scripts and event handlers, but it is not the trust boundary
 * — WordPress is, since only users with `unfiltered_html` can author raw markup.
 */

import sanitizeHtml from 'sanitize-html';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/lib/site';
import { stripCssArtifacts } from '@/lib/text';
import { toRelativeUrl, isWordPressUrl } from '@/lib/urls';

/** Class applied to the element that receives WordPress HTML. */
export const WP_CONTENT_CLASS = 'article-content';

const SVG_TAGS = [
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect',
  'text', 'tspan', 'defs', 'use', 'symbol', 'desc', 'linearGradient',
  'radialGradient', 'stop', 'clipPath', 'mask', 'pattern',
];

/* -------------------------------------------------------------------------- */
/* HTML                                                                        */
/* -------------------------------------------------------------------------- */

function rewriteSrcset(srcset: string): string {
  return srcset
    .split(',')
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      return [toRelativeUrl(url), ...descriptor].join(' ');
    })
    .join(', ');
}

/**
 * Normalises a link authored in WordPress. Absolute links back to the site and
 * hardcoded `/en/...` paths both become the correct path for the locale being
 * rendered, so no internal link goes through a redirect.
 */
function rewriteHref(href: string, locale: Locale): string {
  if (/^(?:mailto:|tel:|#)/i.test(href)) return href;

  let path: string;

  if (/^https?:\/\//i.test(href)) {
    if (!isWordPressUrl(href)) return href;
    try {
      path = new URL(href).pathname;
    } catch {
      return href;
    }
  } else if (href.startsWith('/')) {
    path = href;
  } else {
    return href;
  }

  path = path.replace(/^\/(?:en|es)(?=\/|$)/, '') || '/';
  if (path.length > 1) path = path.replace(/\/$/, '');

  return localePath(locale, path);
}

function buildOptions(locale: Locale): sanitizeHtml.IOptions {
  return {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'iframe'),
      'img',
      'figure',
      'figcaption',
      ...SVG_TAGS,
    ],
    // `style` is deliberately absent here, as an attribute: inline styles are
    // where most of the pasted colour and spacing lives.
    allowedAttributes: {
      '*': ['class', 'id', 'lang', 'dir', 'role', 'aria-*', 'data-*'],
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding', 'title'],
      source: ['src', 'srcset', 'sizes', 'type', 'media'],
      time: ['datetime'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      svg: ['viewbox', 'width', 'height', 'fill', 'xmlns', 'preserveaspectratio'],
      path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
      circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
      ellipse: ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke'],
      line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'],
      polyline: ['points', 'fill', 'stroke'],
      polygon: ['points', 'fill', 'stroke'],
      rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke'],
      g: ['fill', 'stroke', 'transform'],
      text: ['x', 'y', 'fill', 'text-anchor', 'font-size'],
      stop: ['offset', 'stop-color', 'stop-opacity'],
      linearGradient: ['x1', 'y1', 'x2', 'y2', 'gradientunits'],
      radialGradient: ['cx', 'cy', 'r', 'gradientunits'],
      use: ['href'],
    },
    /*
     * Listing `style` here discards the stylesheet's text along with the tag.
     * The HTML parser reads a `<style>` body as raw text, so the `</p><p>`
     * pairs `wpautop` wedges between rules go with it instead of surfacing as
     * paragraphs.
     *
     * `head` is not listed: the element is unwrapped, and with its `<style>`
     * and `<title>` children dropped, nothing of it remains. `title` is listed
     * so a pasted document's title does not render as stray text; the cost is
     * that a `<title>` inside an inline SVG goes too, and `aria-label` and
     * `<desc>` remain for naming those.
     */
    nonTextTags: ['script', 'style', 'textarea', 'noscript', 'title'],
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href', 'src', 'srcset'],
    allowProtocolRelative: false,
    // Comments are dropped by default, which also removes editors' private
    // notes: one post opens with a block of draft SEO metadata.
    transformTags: {
      // The page renders its own h1; a second one from pasted markup would
      // leave the document with two top-level headings.
      h1: 'h2',
      img: (tagName, attribs) => {
        const next: Record<string, string> = { ...attribs };
        if (next.src) next.src = toRelativeUrl(next.src);
        if (next.srcset) next.srcset = rewriteSrcset(next.srcset);
        if (!next.loading) next.loading = 'lazy';
        if (!next.decoding) next.decoding = 'async';
        if (next.alt === undefined) next.alt = '';
        return { tagName, attribs: next };
      },
      source: (tagName, attribs) => {
        const next: Record<string, string> = { ...attribs };
        if (next.src) next.src = toRelativeUrl(next.src);
        if (next.srcset) next.srcset = rewriteSrcset(next.srcset);
        return { tagName, attribs: next };
      },
      a: (tagName, attribs) => {
        const next: Record<string, string> = { ...attribs };
        if (next.href) next.href = rewriteHref(next.href, locale);
        // Links leaving the site open in a new tab without leaking the referrer
        // window handle.
        if (next.target === '_blank') next.rel = next.rel || 'noopener noreferrer';
        return { tagName, attribs: next };
      },
    },
    /*
     * Orphaned CSS is handled by `cleanTextNodes` below, not by an
     * `exclusiveFilter` here. A filter keyed on `frame.text` cannot work:
     * sanitize-html accumulates the text of every descendant into that field,
     * so an Elementor post wrapped in one outer `<div>` that also contains a
     * `<style>` block matched as a whole, and the entire article was deleted
     * with it. Removing the offending text is the bounded operation; removing
     * the element that happens to contain it is not.
     */
  };
}

/* -------------------------------------------------------------------------- */
/* Text nodes                                                                  */
/* -------------------------------------------------------------------------- */

/*
 * Pictographic emoji, with their modifiers and ZWJ sequences, plus one trailing
 * space so `📚 More papers` becomes `More papers` rather than ` More papers`.
 *
 * Limited to U+2300 and above: below that, Extended_Pictographic includes ©, ®,
 * ™, and several arrows, which are ordinary typography.
 */
const PICTOGRAPH = '(?:(?=\\p{Extended_Pictographic})[\\u{2300}-\\u{2BFF}\\u{1F000}-\\u{1FAFF}])';
const EMOJI_MODIFIERS = '[\\uFE0E\\uFE0F\\u20E3\\u{1F3FB}-\\u{1F3FF}\\u{E0020}-\\u{E007F}]*';
const FLAG = '[\\u{1F1E6}-\\u{1F1FF}]{2}';
const EMOJI = new RegExp(
  `(?:${FLAG}|${PICTOGRAPH}${EMOJI_MODIFIERS}(?:\\u200D${PICTOGRAPH}${EMOJI_MODIFIERS})*)[ \\u00A0]?`,
  'gu'
);

export function stripEmoji(text: string): string {
  return text.replace(EMOJI, '');
}

/**
 * Applies text-level cleanup to every text node, leaving markup untouched.
 *
 * `<style>` elements are already gone by this point, so any CSS left in the
 * text is orphaned — a style tag that lost its wrapper before WordPress stored
 * the post. Operating on text nodes rather than whole elements means a stray
 * rule glued to a real sentence costs that rule and nothing else.
 */
function cleanTextNodes(html: string): string {
  const clean = (text: string) => stripEmoji(stripCssArtifacts(text));

  let out = '';
  let index = 0;

  while (index < html.length) {
    const tagStart = html.indexOf('<', index);

    if (tagStart === -1) {
      out += clean(html.slice(index));
      break;
    }

    out += clean(html.slice(index, tagStart));

    const tagEnd = html.indexOf('>', tagStart);
    if (tagEnd === -1) {
      // Malformed trailing fragment; emit verbatim rather than guess.
      out += html.slice(tagStart);
      break;
    }

    out += html.slice(tagStart, tagEnd + 1);
    index = tagEnd + 1;
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Paragraphs                                                                  */
/* -------------------------------------------------------------------------- */

const BREAK = /<br\s*\/?>/gi;

function visibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * True for a line that was a heading before its markup was lost.
 *
 * Several posts were generated with section titles as styled `<div>`s; once
 * the styling is gone they read as a short line glued to the top of the next
 * paragraph ("Philosophical Foundations<br>The Hindu concept…"). Only plain
 * text qualifies: short, capitalised like a title, and not ending the way a
 * sentence or a lead-in ("Key insight:") does.
 */
function isHeadingLike(line: string): boolean {
  if (line.includes('<')) return false;

  const text = visibleText(line);
  if (text.length < 3 || text.length > 90) return false;
  if (/[.,;:!?…]$/.test(text)) return false;
  if (!/^[\p{Lu}\p{N}]/u.test(text)) return false;

  const words = text.split(/\s+/);
  if (words.length > 10) return false;

  // Title case: every word long enough to be a content word is capitalised,
  // and there is at least one such word — "C-H" is a diagram label.
  const contentWords = words.filter((word) => word.length > 3);
  return contentWords.length > 0 && contentWords.every((word) => /^[\p{Lu}\p{N}("“‘]/u.test(word));
}

/** A short run of symbols with no words — `◆ ◆ ◆`, `∞`, `* * *` — used as a section break. */
function isDivider(html: string): boolean {
  const text = visibleText(html);
  return text.length > 0 && text.length <= 12 && !/[\p{L}\p{N}]/u.test(text);
}

/** A line that is only an image, which the stylesheet already sets as a block. */
function isImageOnly(line: string): boolean {
  return /<img\b/i.test(line) && !visibleText(line);
}

/**
 * Whether a `<br>` between two lines was meant.
 *
 * `wpautop` turns every newline in the stored body into a `<br>`, so markup
 * that was pasted with its source wrapped at 120 columns reads as ragged,
 * half-empty lines. A break is kept only where the line before it ends a
 * sentence or a lead-in and the line after starts a new one — "…practices:"
 * followed by "First, …" — and joined with a space everywhere else.
 */
function keepsBreak(before: string, after: string): boolean {
  if (isImageOnly(before) || isImageOnly(after)) return false;
  const end = visibleText(before);
  const start = visibleText(after);
  return /[.!?:;…]["”’)\]]*$/.test(end) && !/^[\p{Ll}]/u.test(start);
}

function splitLines(inner: string): string[] {
  return inner
    .split(BREAK)
    .map((line) => line.trim())
    .filter((line) => visibleText(line) || /<img\b/i.test(line));
}

function joinLines(lines: string[]): string {
  let joined = lines[0] ?? '';
  for (let i = 1; i < lines.length; i += 1) {
    joined += keepsBreak(lines[i - 1], lines[i]) ? '<br />' : ' ';
    joined += lines[i];
  }
  return joined;
}

/**
 * Removes `<br>`s that only add blank space: at the start or end of an
 * element, and all but one of a consecutive run. Pasted headers arrive as a
 * stack of nine of them before the first word.
 */
function trimBreaks(html: string): string {
  return html
    .replace(/(<(?!br\b)[a-z][a-z0-9]*\b[^>]*>)(?:\s*<br\s*\/?>)+/gi, '$1')
    .replace(/(?:<br\s*\/?>\s*)+(<\/[a-z][a-z0-9]*>)/gi, '$1')
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br />');
}

/**
 * Repairs blocks damaged by pasting: drops empty paragraphs, joins
 * hard-wrapped lines, promotes lost headings, and turns symbol-only "dividers"
 * into `<hr>`.
 *
 * Matching with regular expressions is safe here because the input has been
 * through the HTML parser: every element is closed, and none of the matched
 * elements can contain another of its own kind.
 */
function normaliseBlocks(html: string): string {
  const repaired = trimBreaks(html)
    .replace(/<div\b[^>]*>([^<]*)<\/div>/gi, (match: string, text: string) =>
      isDivider(text) ? '<hr />' : match
    )
    .replace(/<(h[2-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag: string, attrs: string, inner: string) =>
      `<${tag}${attrs}>${splitLines(inner).join(' ')}</${tag}>`
    )
    .replace(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi, (_, attrs: string, inner: string) =>
      // A list item can hold nested lists; leave those to their own items.
      /<(?:ul|ol)\b/i.test(inner) ? `<li${attrs}>${inner}</li>` : `<li${attrs}>${joinLines(splitLines(inner))}</li>`
    );

  return repaired.replace(
    /<p\b([^>]*)>([\s\S]*?)<\/p>/gi,
    (match: string, attrs: string, inner: string, offset: number, whole: string) => {
      const lines = splitLines(inner);
      if (!lines.length) return '';

      // A heading glued to the top of its section, or a lone title-like line
      // introducing the prose that follows. A lone line followed by anything
      // else is more likely a label ("Active research") than a section title.
      let heading = '';
      const followedByProse = /^\s*<p\b/i.test(whole.slice(offset + match.length));
      if (isHeadingLike(lines[0]) && (lines.length > 1 || followedByProse)) {
        heading = `<h3>${lines.shift()}</h3>`;
      }
      if (!lines.length) return heading;

      if (lines.length === 1 && !/<img\b/i.test(lines[0]) && isDivider(lines[0])) {
        return `${heading}<hr />`;
      }

      return `${heading}<p${attrs}>${joinLines(lines)}</p>`;
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Leading heading                                                             */
/* -------------------------------------------------------------------------- */

function normaliseTitle(text: string): string {
  return visibleText(text)
    .toLowerCase()
    .replace(/[‘’“”"']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * True when two titles name the same thing — equal, or one a near-complete
 * version of the other ("Evidence of X: 2025 Update" against "X: 2025 Update").
 */
export function isSameTitle(a: string, b: string): boolean {
  const x = normaliseTitle(a);
  const y = normaliseTitle(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [shorter, longer] = x.length < y.length ? [x, y] : [y, x];
  return longer.includes(shorter) && shorter.length >= longer.length * 0.6;
}

/**
 * Removes the first heading when nothing but images precedes it and `matches`
 * accepts its text. Pasted documents open with their own title, which the page
 * has already rendered as its `<h1>`.
 */
function dropLeadingHeading(html: string, matches: (text: string) => boolean): string {
  const heading = html.match(/<h([2-6])\b[^>]*>([\s\S]*?)<\/h\1>/i);
  if (!heading || heading.index === undefined) return html;
  if (visibleText(html.slice(0, heading.index))) return html;
  if (!matches(visibleText(heading[2]))) return html;
  return html.slice(0, heading.index) + html.slice(heading.index + heading[0].length);
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                 */
/* -------------------------------------------------------------------------- */

export interface SanitizeOptions {
  /**
   * Called with the text of the body's first heading, if nothing but images
   * comes before it. Return true to drop it as a repeat of the page title.
   */
  dropLeadingHeading?: (text: string) => boolean;
}

/** Sanitises WordPress body HTML into a fragment styled entirely by this site. */
export function sanitizeContent(
  html: string,
  locale: Locale = DEFAULT_LOCALE,
  options: SanitizeOptions = {}
): string {
  if (!html) return '';

  const body = normaliseBlocks(cleanTextNodes(sanitizeHtml(html, buildOptions(locale))));

  return options.dropLeadingHeading ? dropLeadingHeading(body, options.dropLeadingHeading) : body;
}
