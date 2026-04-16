/** @type {import('next').NextConfig} */
const replitDomain = process.env.REPLIT_DEV_DOMAIN;

const pageHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  ...(replitDomain && {
    allowedDevOrigins: [replitDomain],
  }),
  async headers() {
    return [
      // Pages HTML — no-cache pour éviter le cache navigateur, PAS de nosniff (c'est HTML)
      {
        source: '/((?!_next|api|images|videos).*)',
        headers: [
          ...pageHeaders,
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Fichiers JS/CSS statiques Next.js — Content-Type correct, immutable car hash dans le nom
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
      // API
      {
        source: '/api/(.*)',
        headers: [
          ...pageHeaders,
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // Images statiques
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      // Vidéos
      {
        source: '/videos/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/.local/**',
          '**/.cache/**',
          '**/.upm/**',
          '**/.agents/**',
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
