import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import PwaRegister from '@/components/PwaRegister';

/**
 * SCULPT'AURA Admin — root layout.
 *
 * Loads the charter typefaces, declares the PWA manifest / theme, registers the
 * service worker, and frames every page with the fixed sidebar. The admin is
 * private, so metadata explicitly forbids indexing.
 */

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SCULPT'AURA — Administration",
  description: "Console d'administration SCULPT'AURA.",
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "SCULPT'AURA Admin",
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#171717',
  width: 'device-width',
  initialScale: 1,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-white text-neutral-900 antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
