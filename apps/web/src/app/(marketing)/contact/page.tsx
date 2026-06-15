import type { Metadata } from 'next';
import ContactContent from './content';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Erick Omari, founder of PhishForge AI. Questions about pricing, enterprise deployments, or partnerships — we respond within 24 hours.',
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', title: 'Contact | PhishForge' },
};

export default function ContactPage() {
  return <ContactContent />;
}
