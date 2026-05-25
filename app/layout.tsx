import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/SiteShell';
import { siteConfig } from '@/lib/data';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-montserrat',
});

/** Évite HTML statique mis en cache CDN avec d’anciens hashes /_next/static (home cassée au 1er chargement). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: '/favicon.ico' },
  keywords: [
    'calligraphie arabe',
    'calligraphe Paris',
    'ateliers calligraphie',
    'art islamique',
    'cours calligraphie',
    'LookaGraphy',
    'exposition calligraphie',
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
