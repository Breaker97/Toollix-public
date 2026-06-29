import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@xenova/transformers"],
  experimental: {
    serverActions: {
      bodySizeLimit: '250mb',
    },
    proxyClientMaxBodySize: '250mb',
  },
  async redirects() {
    return [
      {
        source: '/tools/passport-photo',
        destination: '/tools/passport-photo-maker',
        permanent: true,
      },
      {
        source: '/tools/remove-background',
        destination: '/tools/bg-remover',
        permanent: true,
      },
      {
        source: '/tools/thread-carousel',
        destination: '/tools/thread-to-post',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'X-Original-Size, X-Compressed-Size, X-Saved-Percent, X-Images-Processed, Content-Disposition',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
