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
      // Pages HTML — no-cache pour éviter le cache navigateur et LiteSpeed
      {
        source: '/((?!_next|api|images|videos).*)',
        headers: [
          ...pageHeaders,
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
          { key: 'X-LiteSpeed-Cache-Control', value: 'no-cache' },
          { key: 'Vary', value: 'Accept-Encoding' },
          // En dev : force le navigateur à vider son cache (invalide les anciens chunks immutable)
          ...(process.env.NODE_ENV !== 'production'
            ? [{ key: 'Clear-Site-Data', value: '"cache"' }]
            : []),
        ],
      },
      // Fichiers JS/CSS statiques Next.js — no-store en dev (pas de hash), immutable en prod
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production'
              ? 'public, max-age=31536000, immutable'
              : 'no-cache, no-store, must-revalidate',
          },
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
        aggregateTimeout: 500,
        poll: false,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/.local/**',
          '**/.cache/**',
          '**/.upm/**',
          '**/.agents/**',
          '**/.replit/**',
          '**/replit_zip_error_log.txt',
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
