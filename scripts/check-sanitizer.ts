/**
 * Regression checks for `sanitizeContent`.
 *
 * Every case here is an input that previously escaped the content scope, was
 * silently dropped, or landed in the page unchanged. Run with:
 *
 *   npm run check:sanitizer
 */

import { sanitizeContent } from '@/lib/sanitize';
import { excerptFrom } from '@/lib/wordpress';

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
    name: 'a statement at-rule does not let the next rule escape the scope',
    input: '<style>@charset "UTF-8";:root{--x:1}.container{width:100%}</style><p>a</p>',
    expect: ['.article-content{--x:1}', '.article-content .container'],
    reject: ['@charset', '\n:root{', '}:root{'],
  },
  {
    name: 'a brace inside a string does not swallow the following rule',
    input: '<style>.a{content:"}"}.b{color:blue}</style><p>a</p>',
    expect: ['.article-content .a', '.article-content .b'],
  },
  {
    name: 'a comma inside :is() is not treated as a selector separator',
    input: '<style>.card:is(.a, .b){color:red}</style><p>a</p>',
    expect: ['.article-content .card:is(.a, .b)'],
  },
  {
    name: 'an end tag with trailing whitespace is still recognised',
    input: '<style>body{background:lime}</style ><p>a</p>',
    reject: ['background:lime', 'background: lime'],
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
    name: 'a demoted h1 keeps its styling',
    input: '<h1 class="t">T</h1><style>.header h1{color:red}</style>',
    expect: ['<h2 class="t">', '.article-content .header h2'],
  },
  {
    name: 'a data URI is not split on its semicolons',
    input: '<style>.a{background:url("data:image/svg+xml;base64,AAA");font-size:18px}</style>',
    expect: ['font-size:18px', 'base64,AAA'],
  },
  {
    name: 'a qualified body selector still loses its page colours',
    input: '<style>body:not(.x){background:white;color:black}</style><p>a</p>',
    reject: ['background:white', 'color:black'],
  },
  {
    name: 'keyframes are left unscoped so the animation still resolves',
    input: '<style>@keyframes spin{from{transform:rotate(0)}}.a{color:red}</style>',
    expect: ['@keyframes spin', '.article-content .a'],
    reject: ['.article-content @keyframes'],
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
    name: 'a stylesheet inside a pasted document is kept and scoped',
    input:
      '<!DOCTYPE html><html><head><style>body{margin:0}.container{max-width:900px}</style></head><body><p>a</p></body></html>',
    expect: ['.article-content{margin:0}', '.article-content .container', 'class="wp-document"'],
    reject: ['<head', '\\nbody{'],
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

const total = checks.length + excerptChecks.length;

if (failed) {
  console.error(`\n${failed} of ${total} checks failed.`);
  process.exit(1);
}

console.log(`\nAll ${total} checks passed.`);
