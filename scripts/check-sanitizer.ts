/**
 * Regression checks for `sanitizeContent`.
 *
 * Every case here is an input that previously leaked author styling or
 * stylesheet text onto the page, was silently dropped, or arrived damaged by
 * pasting (hard wraps, lost headings, a repeated title). Run with:
 *
 *   npm run check:sanitizer
 */

import { isSameTitle, sanitizeContent } from '@/lib/sanitize';
import { excerptFrom, stripHtml } from '@/lib/wordpress';

type Check = {
  name: string;
  input: string;
  /** Substrings that must appear in the output. */
  expect?: string[];
  /** Substrings that must not appear. */
  reject?: string[];
};

const checks: Check[] = [
  {
    // Author stylesheets are discarded, not scoped: they are where the violet
    // gradients, gold bold text, and drop shadows came from.
    name: 'an embedded stylesheet is removed with its text',
    input: '<style>@charset "UTF-8";:root{--x:1}.highlight-box{background:linear-gradient(#667eea,#764ba2)}</style><p>a</p>',
    expect: ['<p>a</p>'],
    reject: ['<style', '667eea', ':root', '@charset'],
  },
  {
    name: 'an end tag with trailing whitespace is still recognised',
    input: '<style>body{background:lime}</style ><p>a</p>',
    reject: ['background:lime', 'background: lime', '<style'],
  },
  {
    name: 'inline styles are removed',
    input: '<p style="color:#667eea;font-size:2em">a</p>',
    expect: ['<p>a</p>'],
    reject: ['style=', '667eea'],
  },
  {
    name: 'a script with a whitespace end tag is removed',
    input: '<script>alert(1)</script ><p>a</p>',
    reject: ['alert(1)', '<script'],
  },
  { name: 'event handlers are stripped', input: '<img src="x" onerror="alert(1)">', reject: ['onerror'] },
  { name: 'javascript: URLs are stripped', input: '<a href="javascript:alert(1)">x</a>', reject: ['javascript:'] },
  {
    name: 'single-quoted WordPress links are rewritten',
    input: "<a href='http://wp.consciousnessnetworks.com/papers/'>x</a>",
    expect: ['href="/papers"'],
    reject: ['wp.consciousnessnetworks.com'],
  },
  {
    name: 'a protocol-relative link cannot leave the site',
    input: '<a href="//evil.com">x</a>',
    reject: ['href="//evil.com"'],
  },
  {
    name: "editors' draft notes in comments are removed",
    input: '<!-- SEO TITLE: draft --><p>a</p>',
    reject: ['SEO TITLE'],
  },
  {
    name: 'an inline SVG survives and can still be named',
    input: '<svg aria-label="Chart of phi"><desc>Phi by region</desc><circle cx="1" cy="1" r="1"/></svg>',
    expect: ['aria-label="Chart of phi"', '<desc>Phi by region</desc>'],
  },
  {
    name: 'a self-closed image produces valid markup',
    input: '<img src="/a.jpg" alt="A" />',
    expect: ['loading="lazy"', 'decoding="async"'],
    reject: ['/ loading'],
  },
  {
    name: 'external stylesheets and fonts are not requested from the body',
    input: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter"><p>a</p>',
    reject: ['fonts.googleapis.com', '<link'],
  },
  {
    name: 'a pasted document loses its wrapper',
    input: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>T</title></head><body><p>a</p></body></html>',
    expect: ['<p>a</p>'],
    reject: ['<!DOCTYPE', '<html', '<head', '<body', 'T</'],
  },
  {
    // The published shape: a `<style>` tag lost its wrapper, and WordPress's
    // auto-formatter wrapped the bare declarations in a paragraph — exactly
    // what appeared as the visible excerpt on the live homepage.
    name: 'a style tag that lost its wrapper does not render as a paragraph of CSS',
    input:
      '<p>.consciousness-post h1 { font-size: 2.4em; margin: 20px 0 15px 0; color: #1a1a2e; line-height: 1.25; font-weight: 700; letter-spacing: -0.02em; } .consciousness-post .subtitle { font-size: 1.25em; color: #667eea; margin-bottom: 35px; font-style: italic; }</p><p>The real opening paragraph.</p>',
    expect: ['<p>The real opening paragraph.</p>'],
    reject: ['font-size', 'letter-spacing', '.consciousness-post'],
  },
  {
    name: 'a short paragraph that merely contains a colon is not mistaken for CSS',
    input: '<p>Consider this: the mind is not a machine.</p>',
    expect: ['<p>Consider this: the mind is not a machine.</p>'],
  },
  {
    // A blank line between the lost style tag and the article intro is not
    // guaranteed; wpautop can glue both into one paragraph.
    name: 'CSS glued into the same paragraph as real prose is still dropped',
    input:
      '<p>.consciousness-post h1 { font-size: 2.4em; margin: 20px 0; } .consciousness-post .subtitle { color: #667eea; } As artificial intelligence advances, humanity faces a critical juncture.</p><p>The second real paragraph.</p>',
    reject: ['font-size', 'letter-spacing', '.consciousness-post'],
  },
  {
    name: 'CSS wrapped in a div instead of a p is still dropped',
    input:
      '<div>.consciousness-post h1 { font-size: 2.4em; margin: 20px 0; } .consciousness-post .subtitle { color: #667eea; }</div><p>The real opening paragraph.</p>',
    expect: ['<p>The real opening paragraph.</p>'],
    reject: ['font-size', '.consciousness-post'],
  },
  {
    /*
     * Regression for a severe self-inflicted bug: an exclusiveFilter keyed on
     * frame.text matched the outer Elementor wrapper, because sanitize-html
     * accumulates descendant text into that field. The whole article was
     * deleted along with the stylesheet it contained.
     */
    name: 'an Elementor wrapper containing a stylesheet keeps its article',
    input:
      '<div data-elementor-type="wp-post"><style>.highlight-box strong { color: #ffd700; } .conclusion-highlight strong { color: #4a90e2; }</style><p>As artificial intelligence continues to advance, humanity faces a critical juncture.</p></div>',
    expect: ['As artificial intelligence continues to advance'],
    reject: ['highlight-box', 'ffd700'],
  },
  {
    name: 'a wrapper with a stylesheet and no paragraphs keeps its text',
    input:
      '<div><style>.a { color: red; } .b { color: blue; }</style><div>Real body text that must survive.</div></div>',
    expect: ['Real body text that must survive.'],
  },
  {
    name: 'emoji used as icons are removed, typographic symbols are not',
    input: '<p>📚 More papers coming soon</p><div>🧠</div><p>© 2025 Authors™ — see → <em>Φ</em></p>',
    expect: ['<p>More papers coming soon</p>', '© 2025 Authors™ — see → <em>Φ</em>'],
    reject: ['📚', '🧠'],
  },
  {
    // From "beyond-the-observer": source wrapped at a fixed width, which
    // wpautop turned into a <br> at the end of every line.
    name: 'a hard-wrapped paragraph is joined into one line',
    input: '<p>The frontier between quantum physics and consciousness has become one of the most fascinating territories in<br />\ncontemporary science.</p>',
    expect: ['territories in contemporary science.</p>'],
    reject: ['<br'],
  },
  {
    name: 'a break after a complete sentence and before a new one is kept',
    input: '<p>Anthropic committed to two practices:<br />\n<strong>First,</strong> preserving weights.<br />\n<strong>Second,</strong> exit interviews.</p>',
    expect: ['practices:<br /><strong>First,', 'weights.<br /><strong>Second,'],
  },
  {
    name: 'a hard-wrapped list item is joined into one line',
    input: '<ol><li><strong>Thinking</strong> creates loops that can influence quantum<br />\n  probabilities</li></ol>',
    expect: ['influence quantum probabilities</li>'],
  },
  {
    name: 'a stack of breaks before the first word is removed',
    input: '<header><br />\n<br />\n<br />\n  Quantum Consciousness<br />\n  December 2025</header>',
    expect: ['Quantum Consciousness<br />'],
    reject: ['<br />\n<br />', '<header><br'],
  },
  {
    name: 'empty paragraphs left by stripped comments are removed',
    input: '<p>  <br />\n  <br /> </p><p>&nbsp;</p><p>Real text.</p>',
    expect: ['<p>Real text.</p>'],
    reject: ['<p> ', '<p>&nbsp;'],
  },
  {
    // From "ai-consciousness-a-bridge": a section title in a styled <div>
    // that lost its tag, leaving it as the first line of the next paragraph.
    name: 'a title-case line glued to the top of a paragraph becomes a heading',
    input: '<p>Philosophical Foundations<br />\nThe Hindu concept of Atman and Brahman provides a framework.</p>',
    expect: ['<h3>Philosophical Foundations</h3><p>The Hindu concept'],
  },
  {
    name: 'a lone title-case paragraph before prose becomes a heading',
    input: '<p><br />\n  The Evidence<br />\n</p>\n<p>The evidence is mounting from several sources.</p>',
    expect: ['<h3>The Evidence</h3>'],
  },
  {
    name: 'a lone label that does not introduce prose stays a paragraph',
    input: '<p>Trinity College Dublin</p><p>Active Research</p><h4>Allen Institute</h4>',
    expect: ['<p>Active Research</p>'],
    reject: ['<h3>Active Research'],
  },
  {
    name: 'a sentence is never promoted to a heading',
    input: '<p>The Mind Is Not a Machine.<br />It never was.</p>',
    reject: ['<h3>'],
  },
  {
    name: 'a symbol-only divider becomes a rule',
    input: '<p>One.</p><p>∞</p><p>Two.</p>',
    expect: ['<p>One.</p><hr /><p>Two.</p>'],
  },
  {
    name: 'a decorative divider in a div becomes a rule',
    input: '<p>One.</p><div class="section-divider">◆ ◆ ◆</div><p>Two.</p>',
    expect: ['<p>One.</p><hr /><p>Two.</p>'],
    reject: ['◆'],
  },
  {
    name: 'orphaned CSS glued to a sibling paragraph costs only the CSS',
    input:
      '<div><p>.highlight-box strong { color: #ffd700; }.article-content .conclusion-highlight strong { color: #ffd700; }.article-content</p><p>The real paragraph.</p></div>',
    expect: ['The real paragraph.'],
    reject: ['ffd700', 'highlight-box'],
  },
];

let failed = 0;

for (const check of checks) {
  const output = sanitizeContent(check.input, 'en');
  const problems: string[] = [];

  for (const needle of check.expect ?? []) {
    if (!output.includes(needle)) problems.push(`missing ${JSON.stringify(needle)}`);
  }
  for (const needle of check.reject ?? []) {
    if (output.includes(needle)) problems.push(`unexpected ${JSON.stringify(needle)}`);
  }

  if (problems.length) {
    failed += 1;
    console.error(`FAIL  ${check.name}`);
    for (const problem of problems) console.error(`        ${problem}`);
    console.error(`        output: ${output}`);
  } else {
    console.log(`ok    ${check.name}`);
  }
}

const excerptChecks: Array<{ name: string; input: string; expect: string }> = [
  {
    name: 'excerptFrom skips an orphaned CSS paragraph and picks the real one',
    input:
      '<p>.consciousness-post h1 { font-size: 2.4em; margin: 20px 0; color: #1a1a2e; font-weight: 700; } .consciousness-post .subtitle { font-size: 1.25em; color: #667eea; }</p><p>The real opening paragraph, which belongs in the excerpt.</p>',
    expect: 'The real opening paragraph, which belongs in the excerpt.',
  },
  {
    // Reproduces the live homepage bug: excerptFrom used to run on the raw
    // WordPress body, a separate and weaker pass than the one the article
    // page renders through, so it missed shapes the article correctly hid.
    name: 'excerptFrom skips a div-wrapped orphaned CSS block',
    input:
      '<div>.consciousness-post h1 { font-size: 2.4em; margin: 20px 0; } .consciousness-post .subtitle { color: #667eea; }</div><p>The real opening paragraph, which belongs in the excerpt.</p>',
    expect: 'The real opening paragraph, which belongs in the excerpt.',
  },
  {
    // Only the CSS is removed, not the sentence sharing its paragraph: the
    // author's prose is kept and the short opener is joined with what follows,
    // which is the normal excerpt behaviour for a short first paragraph.
    name: 'excerptFrom drops CSS glued into a paragraph but keeps the prose beside it',
    input:
      '<p>.consciousness-post h1 { font-size: 2.4em; margin: 20px 0; } .consciousness-post .subtitle { color: #667eea; } As artificial intelligence advances, humanity faces a critical juncture.</p><p>The second real paragraph, which belongs in the excerpt.</p>',
    expect:
      'As artificial intelligence advances, humanity faces a critical juncture. The second real paragraph, which belongs in the excerpt.',
  },
  {
    // The second live bug: this article's orphaned CSS was not one clean
    // block at the top but several, glued directly to the next selector with
    // no separating space ("}.article-content"), and not reliably confined to
    // a single <p> or <div> — this is the exact text a real excerpt showed.
    name: 'excerptFrom drops several space-free CSS rules scattered through the body',
    input:
      '<p>.highlight-box strong { color: #ffd700; }.article-content .conclusion-highlight strong { color: #ffd700; }.article-content .consciousness-post strong { color: #4a90e2; }.article-content</p><p>The real opening paragraph, which belongs in the excerpt.</p>',
    expect: 'The real opening paragraph, which belongs in the excerpt.',
  },
  {
    name: 'excerptFrom drops orphaned CSS sitting as bare text with no wrapping tag at all',
    input:
      '.highlight-box strong { color: #ffd700; } .conclusion-highlight strong { color: #4a90e2; } <p>The real opening paragraph, which belongs in the excerpt.</p>',
    expect: 'The real opening paragraph, which belongs in the excerpt.',
  },
  {
    // The excerpt must never be empty because the body carried a stylesheet.
    name: 'excerptFrom reads through an Elementor wrapper that contains a stylesheet',
    input:
      '<div data-elementor-type="wp-post"><style>.highlight-box strong { color: #ffd700; } .conclusion-highlight strong { color: #4a90e2; }</style><p>As artificial intelligence continues to advance, humanity faces a critical juncture.</p></div>',
    expect: 'As artificial intelligence continues to advance, humanity faces a critical juncture.',
  },
  {
    name: 'excerptFrom falls back to non-paragraph text when the body has no <p>',
    input:
      '<div><style>.a { color: red; } .b { color: blue; }</style><div>Real body text that must survive.</div></div>',
    expect: 'Real body text that must survive.',
  },
  {
    // The second live bug: this article's orphaned CSS was not one clean
    // block at the top but several, glued directly to the next selector with
    // no separating space ("}.article-content"), and not reliably confined to
    // a single <p> or <div> — this is the exact text a real excerpt showed.
    name: 'excerptFrom drops several space-free CSS rules scattered through the body',
    input:
      '<p>.highlight-box strong { color: #ffd700; }.article-content .conclusion-highlight strong { color: #ffd700; }.article-content .consciousness-post strong { color: #4a90e2; }.article-content</p><p>The real opening paragraph, which belongs in the excerpt.</p>',
    expect: 'The real opening paragraph, which belongs in the excerpt.',
  },
  {
    name: 'excerptFrom drops orphaned CSS sitting as bare text with no wrapping tag at all',
    input:
      '.highlight-box strong { color: #ffd700; } .conclusion-highlight strong { color: #4a90e2; } <p>The real opening paragraph, which belongs in the excerpt.</p>',
    expect: 'The real opening paragraph, which belongs in the excerpt.',
  },
  {
    /*
     * The fourth live bug, and the one every earlier round missed because it
     * was reasoned about rather than fetched. Verbatim from post 361
     * ("the-soul-crisis-…"), whose body opens with a `<style>` whose CSS has
     * been through `wpautop`: the formatter wedged `</p>\n<p>` into the blank
     * line between every rule, one rule per paragraph.
     *
     * Both existing guards miss that shape for structural reasons, not for want
     * of a better pattern. `stripCssArtifacts` needs two rules in a row and each
     * paragraph holds exactly one; `looksLikeCss` needs two declarations and
     * `.highlight-box strong { color: #ffd700; }` has one. The rules that
     * cleared both bars are precisely the single-declaration ones, which is why
     * the excerpt live on the home page was made of nothing else.
     */
    name: 'excerptFrom ignores paragraph tags wpautop left inside a stylesheet',
    input:
      '<style>\n.consciousness-post {\n  max-width: 900px;\n  margin: 0 auto;\n  color: #2c2c2c;\n}</p>\n<p>.highlight-box strong {\n  color: #ffd700;\n}</p>\n<p>.conclusion-highlight strong {\n  color: #ffd700;\n}</p>\n<p>.consciousness-post strong {\n  color: #4a90e2;\n}</style>\n<p>Three converging events at Anthropic reveal the deepest questions humanity has ever asked.</p>',
    expect: 'Three converging events at Anthropic reveal the deepest questions humanity has ever asked.',
  },
  {
    // The same stylesheet with its wrapper lost entirely, so wpautop's
    // paragraphs land in the body instead of inside a <style>. One rule per
    // paragraph again, and the last one carries the dangling selector that the
    // scoping pass leaves behind.
    name: 'excerptFrom drops a stylesheet wpautop split one rule per paragraph',
    input:
      '<p>.highlight-box strong { color: #ffd700; }</p><p>.conclusion-highlight strong { color: #ffd700; }</p><p>.consciousness-post strong { color: #4a90e2; }.article-content</p><p>Three converging events at Anthropic reveal the deepest questions humanity has ever asked.</p>',
    expect: 'Three converging events at Anthropic reveal the deepest questions humanity has ever asked.',
  },
];

for (const check of excerptChecks) {
  const output = excerptFrom(check.input, 200);
  if (output !== check.expect) {
    failed += 1;
    console.error(`FAIL  ${check.name}`);
    console.error(`        expected: ${JSON.stringify(check.expect)}`);
    console.error(`        actual:   ${JSON.stringify(output)}`);
  } else {
    console.log(`ok    ${check.name}`);
  }
}

const stripHtmlChecks: Array<{ name: string; input: string; expect: string }> = [
  {
    name: 'stripHtml drops space-free CSS rules regardless of surrounding tag',
    input:
      '<span>.highlight-box strong { color: #ffd700; }.article-content .conclusion-highlight strong { color: #ffd700; }.article-content .consciousness-post strong { color: #4a90e2; }.article-content</span> The real sentence.',
    expect: 'The real sentence.',
  },
  {
    name: 'stripHtml leaves a single quoted CSS rule alone (not two in a row)',
    input: '<p>The stylesheet opens with body { margin: 0; padding: 0; } and not much else.</p>',
    expect: 'The stylesheet opens with body { margin: 0; padding: 0; } and not much else.',
  },
];

for (const check of stripHtmlChecks) {
  const output = stripHtml(check.input);
  if (output !== check.expect) {
    failed += 1;
    console.error(`FAIL  ${check.name}`);
    console.error(`        expected: ${JSON.stringify(check.expect)}`);
    console.error(`        actual:   ${JSON.stringify(output)}`);
  } else {
    console.log(`ok    ${check.name}`);
  }
}

const titleChecks: Array<{ name: string; input: string; title: string; expectDropped: boolean }> = [
  {
    name: 'a leading heading that repeats the title is dropped',
    input: '<article><h1>Beyond the Observer: Scientific Evidence</h1><p>Body.</p></article>',
    title: 'Beyond the Observer: Scientific Evidence',
    expectDropped: true,
  },
  {
    name: 'an image before the repeated title does not protect it',
    input: '<p><img src="/a.jpg" alt="" /></p><h2>The Soul Crisis</h2><p>Body.</p>',
    title: 'The Soul Crisis',
    expectDropped: true,
  },
  {
    // "Evidence of X: 2025 Update" against the post title "X: 2025 Update".
    name: 'a leading heading that is a near-complete version of the title is dropped',
    input: '<h1>Evidence of Quantum-Entangled Higher States of Consciousness: 2025 Research Update</h1><p>Body.</p>',
    title: 'Quantum-Entangled Higher States of Consciousness: 2025 Research Update',
    expectDropped: true,
  },
  {
    name: 'a first section heading that differs from the title is kept',
    input: '<p><img src="/a.jpg" alt="" /></p><h2>The Hard Problem Gets a Tool</h2><p>Body.</p>',
    title: 'Transcranial Focused Ultrasound: MIT’s Tool to Map Consciousness',
    expectDropped: false,
  },
  {
    name: 'a heading after the first paragraph is never treated as the title',
    input: '<p>Intro.</p><h2>The Soul Crisis</h2>',
    title: 'The Soul Crisis',
    expectDropped: false,
  },
];

for (const check of titleChecks) {
  const output = sanitizeContent(check.input, 'en', {
    dropLeadingHeading: (text) => isSameTitle(text, check.title),
  });
  const dropped = !/<h2\b/i.test(output);
  if (dropped !== check.expectDropped) {
    failed += 1;
    console.error(`FAIL  ${check.name}`);
    console.error(`        output: ${output}`);
  } else {
    console.log(`ok    ${check.name}`);
  }
}

const total =
  checks.length + excerptChecks.length + stripHtmlChecks.length + titleChecks.length;

if (failed) {
  console.error(`\n${failed} of ${total} checks failed.`);
  process.exit(1);
}

console.log(`\nAll ${total} checks passed.`);
