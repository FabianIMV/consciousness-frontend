/** @type {import('next').NextConfig} */
const nextConfig = {
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
        protocol: 'http',
        hostname: '52.0.124.233',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: 'http://wp.consciousnessnetworks.com/wp-content/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
