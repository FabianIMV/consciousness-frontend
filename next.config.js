/** @type {import('next').NextConfig} */

/**
 * WordPress runs on Lightsail over plain HTTP. Media is proxied through this
 * app so browsers only ever request it over HTTPS — see the rewrite below and
 * `toRelativeUrl()` in lib/wordpress.ts, which rewrites upload URLs to match.
 */
const WORDPRESS_UPLOADS_ORIGIN =
  process.env.WORDPRESS_UPLOADS_ORIGIN || 'http://wp.consciousnessnetworks.com';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'consciousnessnetworks.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'wp.consciousnessnetworks.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wp.consciousnessnetworks.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: `${WORDPRESS_UPLOADS_ORIGIN}/wp-content/uploads/:path*`,
      },
    ];
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Uploads are immutable in practice; WordPress versions the filename.
        source: '/wp-content/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
