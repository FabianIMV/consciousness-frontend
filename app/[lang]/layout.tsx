import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { getDictionary } from '@/lib/dictionaries';
import { HTML_LOCALE, LOCALES, SITE_NAME, SITE_URL, isLocale } from '@/lib/site';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/**
 * Defaults only. Canonical and hreflang are set per page through `alternates`
 * — declaring them here would put the same canonical on every route.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Research on consciousness, quantum mechanics, and AI`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Independent research journal publishing reviews and critical readings of primary literature on consciousness, quantum mechanics, neuroscience, and artificial intelligence.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
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

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;

  // Without this, any single-segment path would render as a locale and serve a
  // duplicate of the home page under an arbitrary URL.
  if (!isLocale(lang)) notFound();

  const t = getDictionary(lang);

  return (
    <html lang={HTML_LOCALE[lang]}>
      <body>
        <a href="#main" className="skip-link">
          {t.nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
