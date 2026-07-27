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
