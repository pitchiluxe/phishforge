import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@phishforge/shared'],
  serverExternalPackages: ['@pinecone-database/pinecone', 'pdf-parse', 'mammoth'],
  experimental: {
    // Cache dynamic pages in the client-side router for 30s.
    // After first navigation to a page, going back/forward is instant.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
