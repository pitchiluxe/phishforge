import type { Metadata } from 'next';
import { MarketingNav } from './nav';
import { MarketingFooter } from './footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://phishforge.ai'),
  title: {
    default: 'PhishForge — AI Phishing Simulation Platform',
    template: '%s | PhishForge',
  },
  description: 'PhishForge AI generates hyper-realistic phishing simulations for authorized security awareness training. Protect your team before real attackers strike.',
  keywords: [
    'phishing simulation', 'security awareness training', 'email security',
    'cybersecurity platform', 'phishing attack simulator', 'enterprise security training',
    'AI phishing', 'phishing test', 'social engineering training',
  ],
  authors: [{ name: 'Erick Omari', url: 'https://phishforge.ai' }],
  creator: 'Erick Omari',
  publisher: 'PhishForge AI',
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PhishForge AI',
    title: 'PhishForge — AI Phishing Simulation Platform',
    description: 'Generate hyper-realistic phishing simulations in seconds. Train your team to recognize attacks before real adversaries strike.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PhishForge AI — Security Awareness Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhishForge — AI Phishing Simulation Platform',
    description: 'Generate hyper-realistic phishing simulations in seconds.',
    images: ['/og-image.png'],
    creator: '@phishforge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: '/' },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#c8ffd4' }}>
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
