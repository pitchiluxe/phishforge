import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://phishforge.ai').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/docs', '/contact', '/register', '/login'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/_next/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
