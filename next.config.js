/** @type {import('next').NextConfig} */
const replitDomain = process.env.REPLIT_DEV_DOMAIN;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  ...(replitDomain && {
    allowedDevOrigins: [replitDomain],
  }),
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
