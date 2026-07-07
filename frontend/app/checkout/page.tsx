import type { Metadata } from 'next';
import CheckoutView from '@/components/CheckoutView';

export const metadata: Metadata = {
  title: 'Paiement',
  description: 'Finalisez votre commande SCULPT’AURA.',
  robots: { index: false, follow: false },
};

/**
 * SCULPT'AURA — checkout route.
 *
 * Thin server wrapper around the client CheckoutView (cart + Leaflet map). Top
 * padding clears the fixed announcement + header.
 */
export default function CheckoutPage() {
  return (
    <main className="pt-[136px]">
      <CheckoutView />
    </main>
  );
}
