import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Commande confirmée',
  robots: { index: false, follow: false },
};

/**
 * SCULPT'AURA — order confirmation.
 *
 * Reached after a successful payment (the backend redirects here with the order
 * reference). Purely presentational; the order and invoice email are handled
 * server-side by the payment webhook / demo confirm route.
 */
export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const reference = searchParams.ref;

  return (
    <main className="pt-[136px]">
      <div className="container-editorial flex min-h-[50vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="label-editorial-muted">Paiement confirmé</p>
        <h1 className="font-serif text-5xl italic text-neutral-900">
          Merci pour votre commande
        </h1>
        {reference && (
          <p className="font-sans text-sm tracking-editorial text-neutral-500">
            Référence&nbsp;: <span className="text-neutral-900">{reference}</span>
          </p>
        )}
        <p className="max-w-md font-sans text-sm font-light leading-relaxed text-neutral-500">
          Un e-mail de confirmation accompagné de votre facture PDF vous a été
          envoyé. Votre commande est en cours de préparation.
        </p>
        <Link href="/collection" className="btn-editorial mt-4">
          Poursuivre la découverte
        </Link>
      </div>
    </main>
  );
}
