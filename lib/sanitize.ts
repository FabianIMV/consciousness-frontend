/**
 * Turns WordPress `content.rendered` into a fragment that is safe to inject.
 *
 * Editors work in Elementor, whose text widget accepts a complete pasted HTML
 * document. One published page does exactly that, and its stylesheet redefined
 * `*`, `body`, and `.container` — the frontend's own layout class — breaking the
 * page around it.
 *
 * This runs the markup through a real HTML parser and the stylesheets through a
 * real CSS parser. An earlier regex-based version was defeated by inputs that
 * occur in ordinary pasted CSS: `@charset "UTF-8";` followed by `:root`, a `}`
 * inside a string or `url()`, a comma inside `:is()`, and `</style >` written
 * with whitespace before the bracket. Each of those either escaped the scope or
 * silently dropped a rule.
 *
 * This is layout containment first and foremost. It also removes scripts and
 * event handlers, but it is not the trust boundary — WordPress is, since only
 * users with `unfiltered_html` can author raw markup.
 */

import postcss, { type ChildNode, type Root } from 'postcss';
import sanitizeHtml from 'sanitize-html';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/lib/site';
import { toRelativeUrl, isWordPressUrl } from '@/lib/urls';

/** Class applied to the element that receives WordPress HTML. */
export const WP_CONTENT_CLASS = 'article-content';

const SCOPE = `.${WP_CONTENT_CLASS}`;

/** Wrapper for content that carries its own stylesheet. */
export const WP_DOCUMENT_CLASS = 'wp-document';

/** At-rules whose children are ordinary style rules and must be scoped too. */
const CONDITIONAL_AT_RULES = new Set(['media', 'supports', 'layer', 'container']);

/** At-rules that define a name rather than a selector; scoping them breaks them. */
const NAMED_AT_RULES = new Set(['keyframes', 'font-face', 'counter-style', 'property', 'page']);

/** At-rules that only make sense in a standalone document. */
const DROPPED_AT_RULES = new Set(['import', 'charset', 'namespace']);

const SVG_TAGS = [
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect',
  'text', 'tspan', 'defs', 'use', 'symbol', 'desc', 'linearGradient',
  'radialGradient', 'stop', 'clipPath', 'mask', 'pattern',
];

/* -------------------------------------------------------------------------- */
/* CSS scoping                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Rewrites one selector so it can only match inside the content element.
 * Selectors describing the document itself are remapped onto the scope element.
 */
function scopeSelector(selector: string): string {
  // `h1` is demoted to `h2` in the markup, so a rule written for it would
  // otherwise stop matching.
  const trimmed = selector.trim().replace(/(^|[\s>+~(,])h1\b/gi, '$1h2');
  if (!trimmed) return '';
  if (trimmed === '*') return `${SCOPE}, ${SCOPE} *`;

  // `body`, `html`, `:root`, and any qualified form of them (`body.dark`,
  // `html[dir=rtl]`, `body:not(.x)`) all describe the wrapper, not a descendant.
  const documentSelector = trimmed.match(/^(?::root|html|body)((?:[.#:[][^\s>+~]*)*)([\s>+~].*)?$/i);
  if (documentSelector) {
    // Qualifiers on the document element (`body.dark`, `body:not(.x)`) cannot be
    // reproduced on the wrapper, so they are dropped; keeping them would make
    // the rule match nothing.
    const descendant = documentSelector[2]?.trim() ?? '';
    return descendant ? `${SCOPE} ${descendant}` : SCOPE;
  }

  return `${SCOPE} ${trimmed}`;
}

/**
 * True when a selector list targets the document element itself, including
 * qualified forms such as `body.dark` or `body:not(.x)` — those still describe
 * the wrapper, so their colours are page chrome too.
 */
function targetsDocument(selectors: string[]): boolean {
  return selectors.some((selector) =>
    /^(?:\*|(?::root|html|body)(?:[.#:[][^\s>+~]*)*)$/i.test(selector.trim())
  );
}

/**
 * Drops page-level colour declarations. Those set the theme, which belongs to
 * the site: a pasted `background: white` would punch a white block into the
 * page for readers using the dark theme.
 */
function dropPageChrome(rule: ChildNode): void {
  if (rule.type !== 'rule') return;
  rule.each((node) => {
    if (node.type === 'decl' && /^(background(-color|-image)?|color)$/i.test(node.prop)) {
      node.remove();
    }
  });
}

function scopeNodes(container: Root | ChildNode): void {
  if (!('each' in container) || typeof container.each !== 'function') return;

  container.each((node) => {
    if (node.type === 'rule') {
      // postcss splits on top-level commas only, so `:is(a, b)` stays intact.
      const scoped = node.selectors.map(scopeSelector).filter(Boolean);
      if (targetsDocument(node.selectors)) dropPageChrome(node);
      node.selectors = scoped;
      return;
    }

    if (node.type === 'atrule') {
      const name = node.name.toLowerCase();
      if (DROPPED_AT_RULES.has(name)) {
        node.remove();
        return;
      }
      if (CONDITIONAL_AT_RULES.has(name)) {
        scopeNodes(node);
        return;
      }
      if (NAMED_AT_RULES.has(name)) return;
      // Unknown at-rule with a block: scope its children defensively.
      if (node.nodes) scopeNodes(node);
    }
  });
}

/** Prefixes every selector in a stylesheet with the content scope. */
export function scopeCss(css: string): string {
  try {
    const root = postcss.parse(css);
    scopeNodes(root);
    return root.toString();
  } catch {
    // Unparseable CSS is dropped rather than injected unscoped.
    return '';
  }
}

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
      'style',
      ...SVG_TAGS,
    ],
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
    // `<style>` is kept only so its text can be handed to postcss below and
    // re-emitted scoped; the library's warning about it assumes the CSS is
    // passed through untouched, which is exactly what this module prevents.
    allowVulnerableTags: true,
    /*
     * `head` is deliberately absent: a pasted document keeps its stylesheet
     * inside `<head>`, and listing it here discarded the very CSS this module
     * exists to scope. The `head` element itself is not allowed, so it is
     * unwrapped and its `<style>` child survives.
     *
     * `title` stays, which drops a pasted document's title instead of letting
     * it render as stray text at the top of the page. The cost is that a
     * `<title>` inside an inline SVG is dropped too; `aria-label` and `<desc>`
     * remain available for naming those.
     */
    nonTextTags: ['script', 'textarea', 'noscript', 'title'],
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
  };
}

/**
 * Sanitises WordPress body HTML and scopes any stylesheet it carries.
 * The stylesheet is emitted ahead of the content so it applies to it.
 */
export function sanitizeContent(html: string, locale: Locale = DEFAULT_LOCALE): string {
  if (!html) return '';

  const cleaned = sanitizeHtml(html, buildOptions(locale));

  // The parser has normalised every end tag, so the stylesheets can now be
  // separated with a simple match.
  const styles: string[] = [];
  const body = cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
    styles.push(css);
    return '';
  });

  const scoped = styles
    .map((css) => scopeCss(css))
    .filter((css) => css.trim())
    .join('\n');

  if (!scoped) return body;

  // Content that ships its own stylesheet was designed as a standalone light
  // page: its cards and headings hardcode light colours that would otherwise
  // sit on the dark theme's background. Rendering it as a light island keeps it
  // internally consistent and readable under either theme.
  return `<style>${scoped}</style><div class="${WP_DOCUMENT_CLASS}">${body}</div>`;
}
