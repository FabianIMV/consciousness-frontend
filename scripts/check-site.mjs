/**
 * Crawls every internal link from a running instance and asserts the things
 * that are easy to break and expensive to notice: dead links, redirect chains,
 * duplicate or missing canonicals, heading structure, hreflang coverage, and
 * valid JSON-LD.
 *
 *   BASE=http://127.0.0.1:3000 node scripts/check-site.mjs
 *
 * Exits non-zero if any check fails.
 */

const BASE = (process.env.BASE || 'http://127.0.0.1:3000').replace(/\/$/, '');

const SEEDS = ['/', '/es', '/sitemap.xml', '/robots.txt', '/llms.txt'];

const visited = new Map();
const failures = [];
const externalLinks = new Set();

const fail = (message) => failures.push(message);

function toInternalPath(href, from) {
  try {
    const url = new URL(href, `${BASE}${from}`);
    if (url.origin !== BASE) {
      if (url.protocol === 'http:' || url.protocol === 'https:') externalLinks.add(url.href);
      return null;
    }
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

async function follow(path) {
  const hops = [];
  let url = `${BASE}${path}`;

  for (let i = 0; i < 6; i += 1) {
    const response = await fetch(url, { redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      hops.push(`${response.status} → ${location}`);
      url = new URL(location, url).toString();
      continue;
    }
    return { response, hops };
  }

  throw new Error(`Too many redirects from ${path}`);
}

async function visit(path, referrer) {
  if (visited.has(path)) return [];
  visited.set(path, true);

  const { response, hops } = await follow(path);
  const body = await response.text();

  if (response.status >= 400) {
    fail(`${response.status} ${path}${referrer ? ` (linked from ${referrer})` : ''}`);
    return [];
  }

  if (hops.length && referrer) {
    fail(`Internal link goes through a redirect: ${path} (from ${referrer}) — ${hops.join(', ')}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return [];

  // Next serialises these attributes in camelCase, so every pattern is case-insensitive.
  const canonicals = [...body.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/gi)].map((m) => m[1]);
  const hreflangs = [...body.matchAll(/hreflang="([^"]+)"/gi)].map((m) => m[1]);
  const h1s = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const title = body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const description = body.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const imagesWithoutAlt = [...body.matchAll(/<img(?![^>]*\balt=)[^>]*>/gi)].length;

  if (canonicals.length === 0) fail(`No canonical on ${path}`);
  if (canonicals.length > 1) fail(`${canonicals.length} canonicals on ${path}: ${canonicals.join(' | ')}`);
  if (!title) fail(`No <title> on ${path}`);
  if (!description) fail(`No meta description on ${path}`);
  if (h1s.length !== 1) fail(`Expected exactly one <h1> on ${path}, found ${h1s.length}`);
  if (imagesWithoutAlt) fail(`${imagesWithoutAlt} <img> without alt on ${path}`);
  if (!hreflangs.includes('en') || !hreflangs.includes('es')) fail(`Incomplete hreflang set on ${path}`);
  if (/<!DOCTYPE/i.test(body.slice(120))) fail(`Nested <!DOCTYPE> inside the document on ${path}`);
  if (/<html[^>]*lang="(?!en|es)/i.test(body)) fail(`Unexpected <html lang> on ${path}`);

  for (const [, raw] of body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(raw.replace(/\\u003c/g, '<'));
    } catch {
      fail(`Invalid JSON-LD on ${path}`);
    }
  }

  const found = [];
  for (const [, href] of body.matchAll(/<a[^>]+href="([^"]+)"/gi)) {
    const next = toInternalPath(href, path);
    if (next && !next.startsWith('/_next')) found.push(next);
  }
  return found;
}

async function main() {
  const queue = SEEDS.map((path) => ({ path, referrer: null }));

  while (queue.length) {
    const { path, referrer } = queue.shift();
    const links = await visit(path, referrer);
    for (const link of links) {
      if (!visited.has(link)) queue.push({ path: link, referrer: path });
    }
  }

  // The sitemap must only list URLs that resolve without a redirect.
  const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!sitemapUrls.length) fail('Sitemap contains no URLs');

  for (const entry of sitemapUrls) {
    const path = new URL(entry).pathname;
    const { response, hops } = await follow(path);
    if (response.status >= 400) fail(`Sitemap lists ${entry} which returns ${response.status}`);
    if (hops.length) fail(`Sitemap lists ${entry} which redirects (${hops.join(', ')})`);
  }

  // A removed page must return 404 rather than rendering something.
  const missing = await fetch(`${BASE}/this-page-does-not-exist`);
  if (missing.status !== 404) fail(`Unknown path returned ${missing.status}, expected 404`);

  const locale = await fetch(`${BASE}/not-a-locale.txt`);
  if (locale.status !== 404) fail(`Unknown dotted path returned ${locale.status}, expected 404`);

  console.log(`Checked ${visited.size} internal URLs and ${sitemapUrls.length} sitemap entries.`);
  console.log(`Found ${externalLinks.size} distinct external links (not requested).`);

  if (failures.length) {
    console.error(`\n${failures.length} problem(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log('All checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
