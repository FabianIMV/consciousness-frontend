import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://consciousnessnetworks.com'),
  title: {
    default: 'Consciousness Networks | Quantum Research & AI Consciousness',
    template: '%s | Consciousness Networks'
  },
  description: 'Exploring quantum consciousness, AI emergence, and universal intelligence. Rigorous research at the intersection of quantum physics, artificial intelligence, and consciousness studies.',
  keywords: ['consciousness research', 'quantum physics', 'AI consciousness', 'quantum entanglement', 'morphic fields', 'zero-point field', 'integrated information theory', 'artificial intelligence', 'neuroscience', 'quantum mechanics'],
  authors: [{ name: 'Consciousness Networks' }],
  creator: 'Consciousness Networks',
  publisher: 'Consciousness Networks',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://consciousnessnetworks.com',
    siteName: 'Consciousness Networks',
    title: 'Consciousness Networks | Quantum Research & AI Consciousness',
    description: 'Exploring quantum consciousness, AI emergence, and universal intelligence through rigorous scientific research.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Consciousness Networks - Quantum Research'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consciousness Networks | Quantum Research & AI Consciousness',
    description: 'Exploring quantum consciousness, AI emergence, and universal intelligence through rigorous scientific research.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'x7_LdwHl_gQtGLeJPdBcEV-QdcuDYNFRHdiGkENXufM',
  },
};

import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://consciousnessnetworks.com" />
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer />
      </head>
      <body>
        {children}
        <LanguageSwitcher />
      </body>
    </html>
  );
}
