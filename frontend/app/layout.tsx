import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';
import { CartProvider } from '@/components/CartProvider';
import CartDrawer from '@/components/CartDrawer';
import Announcement from '@/components/Announcement';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * SCULPT'AURA — root layout.
 *
 * Loads the two charter typefaces as CSS variables (consumed by Tailwind's
 * fontFamily tokens), wraps the tree in the client LocaleProvider for reload-free
 * FR/EN switching, and declares the SEO metadata the storefront depends on.
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SCULPT'AURA — Cosmétique de prestige",
    template: "%s — SCULPT'AURA",
  },
  description:
    "SCULPT'AURA — maison de cosmétique de prestige. Soins d'exception façonnés à la main, livrés au Cameroun et à l'international.",
  keywords: [
    'cosmétique de luxe',
    'soin visage',
    'prestige',
    'Cameroun',
    'SCULPT AURA',
    'skincare',
  ],
  openGraph: {
    type: 'website',
    siteName: "SCULPT'AURA",
    title: "SCULPT'AURA — Cosmétique de prestige",
    description:
      "Soins d'exception façonnés à la main. Édition Haute Couture, noir & blanc.",
    locale: 'fr_FR',
    alternateLocale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#171717',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-white text-neutral-900 antialiased">
        <LocaleProvider>
          <CartProvider>
            <Announcement />
            <Header />
            {children}
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
