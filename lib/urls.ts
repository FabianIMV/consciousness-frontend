/**
 * URL helpers shared by the WordPress client and the content sanitiser.
 * Kept separate so the two modules do not import each other.
 */

/** WordPress hosts whose URLs this frontend proxies (see next.config.js). */
const WP_HOSTS = [
  'wp.consciousnessnetworks.com',
  'consciousnessnetworks.com',
  'www.consciousnessnetworks.com',
  '52.0.124.233',
];

export function isWordPressUrl(url: string): boolean {
  try {
    return WP_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Rewrites an absolute WordPress URL to a site-relative path so it is served
 * over HTTPS through the rewrite in next.config.js instead of over plain HTTP.
 * URLs on other hosts are returned unchanged.
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

/** Absolute URL for an image that may already be absolute on another host. */
export function absoluteUrl(url: string, siteUrl: string): string {
  return /^https?:\/\//i.test(url) ? url : `${siteUrl}${url}`;
}
