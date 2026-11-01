/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
  // Old links from the first version of the app.
  async redirects() {
    return [
      { source: '/auth/login', destination: '/login', permanent: true },
      { source: '/auth/register', destination: '/register', permanent: true },
      { source: '/dashboard', destination: '/play', permanent: true },
      { source: '/game/addbalance', destination: '/wallet?add=1', permanent: true },
      { source: '/game/create', destination: '/admin/games/new', permanent: true },
      { source: '/game', destination: '/admin/games', permanent: true },
      { source: '/gamePrize', destination: '/admin/prizes', permanent: true },
    ];
  },
};

export default nextConfig;
