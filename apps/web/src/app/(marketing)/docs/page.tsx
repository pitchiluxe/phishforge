import type { Metadata } from 'next';
import DocsContent from './content';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'PhishForge API reference, quickstart guide, SDK docs, webhook setup, RAG knowledge base, and GDPR compliance documentation.',
  alternates: { canonical: '/docs' },
  openGraph: { url: '/docs', title: 'Documentation | PhishForge' },
};

export default function DocsPage() {
  return <DocsContent />;
}
