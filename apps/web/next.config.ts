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
    // This Next app implements all of its /api/* routes natively (App Router).
    // Only proxy to the external NestJS backend when BACKEND_API_URL is explicitly
    // set. Without this guard, a catch-all rewrite to localhost:4000 shadows the
    // local API routes and, in production (Vercel, where no such backend exists),
    // causes every proxied call — e.g. campaign content generation — to fail with
    // ECONNREFUSED.
    // Map versioned /api/v1/* calls (used by the AI Settings/Models UI) onto this
    // app's native /api/* App Router handlers, so they work without the external
    // NestJS backend.
    const beforeFiles = [
      { source: '/api/v1/:path*', destination: '/api/:path*' },
    ];

    const backend = process.env.BACKEND_API_URL?.trim();
    if (!backend) {
      return { beforeFiles, afterFiles: [], fallback: [] };
    }
    return {
      beforeFiles,
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${backend.replace(/\/$/, '')}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
