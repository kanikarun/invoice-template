import { fileURLToPath } from 'node:url';

import createJiti from 'jiti';
const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti('./env');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [25, 50, 75, 100],
    deviceSizes: [640, 1080, 1200, 1920],
    minimumCacheTTL: +(process.env.NEXT_IMAGE_CACHE_TTL ?? 31536000), // 365 Days
    remotePatterns: [
      //
      { hostname: 'localhost' },
    ]
  },
  experimental: {
    imgOptTimeoutInSeconds: 30 // Increases the timeout to 30 seconds
  },
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['md', 'mdx', 'ts', 'tsx'],
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: import.meta.dirname,
  reactStrictMode: false,
  serverExternalPackages: ['pdfmake'],

  async rewrites() {
    return [
      {
        source: '/assets/:path',
        destination: `${[process.env.NEXT_PUBLIC_DIRECTUS_URL]}/assets/:path`
      }
    ];
  },
  /**
   * @link https://react-svgr.com/docs/next/
   */
  webpack(config, { nextRuntime }) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find(rule => rule.test?.test?.('.svg'));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/ // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack']
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    // https://github.com/vercel/next.js/discussions/43465
    if (nextRuntime === 'nodejs') {
      config.resolve.alias.canvas = false;
    }

    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js' // Treat SVG files as JavaScript modules
      }
    }
  },

  // https://github.com/tabler/tabler-icons/pull/468
  modularizeImports: {
    '@tabler/icons-react': {
      transform: '@tabler/icons-react/dist/esm/icons/{{member}}'
    }
  },
  transpilePackages: ['@tabler/icons-react', '@t3-oss/env-nextjs', '@t3-oss/env-core']
};

// Merge MDX config with Next.js config
export default nextConfig;
