/**
 * Text heuristics shared by the content sanitiser and the excerpt builder.
 */

/**
 * True when a block of text is very likely raw CSS rather than prose — the
 * shape left behind when a `<style>` tag loses its wrapper (a copy-paste
 * mishap, or a plugin stripping it) and WordPress's auto-formatter wraps the
 * bare declarations in an ordinary `<p>`. From that point on it is
 * indistinguishable by markup from a real paragraph, so it has to be caught
 * by what the text itself looks like.
 *
 * Deliberately conservative: prose essentially never contains two or more
 * colon-terminated declarations inside braces, so both are required. A
 * paragraph that quotes a single CSS rule as a worked example is the
 * plausible false positive; that trade favours not leaking styling debris
 * onto the page over preserving a rare quoted snippet.
 */
export function looksLikeCss(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const braces = trimmed.match(/[{}]/g)?.length ?? 0;
  if (braces < 2) return false;

  const declarations = trimmed.match(/[a-z-]{2,32}\s*:\s*[^;{}]+[;}]/gi)?.length ?? 0;
  return declarations >= 2;
}

/**
 * One `selector { declarations }` block. WordPress content never nests rules,
 * so a lone pair of unmatched braces is enough to bound one; the length caps
 * keep this from running away across an entire article if a brace is ever
 * left unclosed.
 *
 * The lookahead requires the selector portion to contain an actual class or
 * ID reference (`.foo`, `#foo`) before the brace — a bare run of words never
 * does, in properly spaced prose, which keeps this from treating an ordinary
 * sentence that happens to precede an unrelated `{ }` as a selector. Every
 * orphaned stylesheet seen in practice uses class selectors; a rule written
 * purely against a bare tag (`body { margin: 0; }`) would slip past this,
 * which is the accepted trade for not swallowing prose.
 */
const CSS_RULE = '(?=[^{}]*[.#][\\w-])[.#a-zA-Z][\\w.,:()%#/\\-\\s]{0,120}\\{[^{}]{0,600}\\}\\s*';

/**
 * A bare class or ID token with no declarations after it — the selector of a
 * rule that a preceding truncated run cut off before its brace, e.g. the
 * dangling `.article-content` left over when three rules were glued together
 * as `}.article-content .next-rule { ... }.article-content` and only the last
 * fragment had nothing to attach to.
 */
const DANGLING_SELECTOR = '[.#][\\w-]+\\s*';

/**
 * Removes runs of two or more consecutive CSS-rule-shaped blocks from plain
 * text, wherever they sit.
 *
 * `looksLikeCss` rejects a paragraph as a whole; this instead excises just the
 * offending run, which matters because a `<style>` tag that lost its wrapper
 * does not reliably land inside one tidy `<p>` — WordPress's auto-formatter
 * can glue it to a real sentence with no separator, split it across several
 * `<div>`s or `<span>`s, or leave it as bare text between other elements. By
 * the time this runs, every tag is already gone, so none of that matters:
 * whatever shape produced the text, a run of CSS rules reads the same. Two or
 * more in a row is the same conservative bar `looksLikeCss` sets, for the same
 * reason — a single quoted rule as a worked example is the plausible false
 * positive this accepts in exchange for not leaking a stylesheet onto a page.
 */
export function stripCssArtifacts(text: string): string {
  if (!text) return text;
  return text.replace(new RegExp(`(?:${CSS_RULE}){2,}(?:${DANGLING_SELECTOR})?`, 'gi'), ' ');
}
