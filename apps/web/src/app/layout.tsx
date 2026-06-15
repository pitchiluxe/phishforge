import type { Metadata, Viewport } from 'next';
import { Fira_Code, Fira_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-code',
  display: 'swap',
});

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://phishforge.ai'),
  title: { default: 'PhishForge AI — Security Awareness Training', template: '%s | PhishForge' },
  description: 'AI-powered phishing simulation platform for authorized enterprise security awareness training.',
  keywords: ['phishing simulation', 'security awareness training', 'cybersecurity', 'email security', 'social engineering'],
  authors: [{ name: 'Erick Omari' }],
  creator: 'Erick Omari',
  openGraph: {
    siteName: 'PhishForge AI',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@phishforge' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${firaCode.variable} ${firaSans.variable}`}>
      <body style={{ fontFamily: 'var(--font-fira-sans), system-ui, sans-serif' }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0d0d0d',
                color: '#00ff41',
                border: '1px solid rgba(0,255,65,0.25)',
                fontFamily: 'var(--font-fira-code), monospace',
                fontSize: '13px',
                borderRadius: '2px',
                boxShadow: '0 0 20px rgba(0,255,65,0.1)',
              },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
