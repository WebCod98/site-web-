'use client';

import { useMemo, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from './LocaleProvider';
import { useCart } from './CartProvider';
import { formatXAF } from '@/lib/currency';
import { COUNTRIES, quoteShipping } from '@/lib/shipping';
import type { LatLng } from './DeliveryMap';

/**
 * The Leaflet map touches `window` at import time, so it is loaded client-only.
 * A hairline-framed placeholder holds the layout while it hydrates.
 */
const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center border border-neutral-200 bg-neutral-50">
      <span className="label-editorial-muted">Carte…</span>
    </div>
  ),
});

/**
 * SCULPT'AURA — checkout.
 *
 * Two columns: on the left, the charter-compliant delivery form (bottom-line
 * fields only) plus the Leaflet map to drop a precise delivery pin; on the
 * right, a live order summary whose shipping line recomputes as the destination
 * country and cart change (dynamic logistics). Placing the order is stubbed —
 * the wired version posts to the backend, which persists the order and returns
 * a payment URL.
 */
export default function CheckoutView() {
  const { locale } = useLocale();
  const { lines, subtotalXAF, clear } = useCart();

  const [country, setCountry] = useState('CM');
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [placed, setPlaced] = useState(false);

  const quote = useMemo(
    () => quoteShipping(country, subtotalXAF),
    [country, subtotalXAF],
  );
  const totalXAF = subtotalXAF + quote.feeXAF;

  const copy = {
    fr: {
      title: 'Paiement',
      empty: 'Votre panier est vide.',
      browse: 'Découvrir la collection',
      contact: 'Coordonnées',
      fullName: 'Nom complet',
      email: 'Adresse e-mail',
      phone: 'Téléphone',
      delivery: 'Livraison',
      country: 'Pays',
      city: 'Ville',
      address: 'Adresse',
      mapHint: 'Cliquez sur la carte pour positionner votre lieu de livraison.',
      pinSet: 'Coordonnées enregistrées',
      summary: 'Récapitulatif',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      free: 'Offerte',
      total: 'Total',
      eta: (a: number, b: number) => `Livraison estimée : ${a}–${b} jours`,
      place: 'Confirmer la commande',
      thanks: 'Merci — votre commande est enregistrée.',
      thanksNote:
        'Vous recevrez un e-mail de confirmation et une facture PDF.',
    },
    en: {
      title: 'Checkout',
      empty: 'Your cart is empty.',
      browse: 'Discover the collection',
      contact: 'Contact details',
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone',
      delivery: 'Delivery',
      country: 'Country',
      city: 'City',
      address: 'Address',
      mapHint: 'Click on the map to set your delivery location.',
      pinSet: 'Coordinates saved',
      summary: 'Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      total: 'Total',
      eta: (a: number, b: number) => `Estimated delivery: ${a}–${b} days`,
      place: 'Place order',
      thanks: 'Thank you — your order is registered.',
      thanksNote: 'You will receive a confirmation email and a PDF invoice.',
    },
  }[locale];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Wired version: POST the order (lines, coords, country, totals) to the
    // backend, which persists it and returns a payment redirect. Here we simply
    // acknowledge and clear the cart.
    setPlaced(true);
    clear();
  };

  if (placed) {
    return (
      <div className="container-editorial flex min-h-[40vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <h1 className="font-serif text-4xl italic text-neutral-900">
          {copy.thanks}
        </h1>
        <p className="max-w-md font-sans text-sm font-light text-neutral-500">
          {copy.thanksNote}
        </p>
        <Link href="/collection" className="btn-editorial mt-4">
          {copy.browse}
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-editorial flex min-h-[40vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="font-serif text-3xl italic text-neutral-300">
          {copy.empty}
        </p>
        <Link href="/collection" className="btn-editorial">
          {copy.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-28">
      <div className="container-editorial">
        <h1 className="mb-14 text-center font-serif text-5xl italic text-neutral-900">
          {copy.title}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-16 lg:grid-cols-[1.3fr_1fr]"
        >
          {/* LEFT — form + map */}
          <div className="space-y-14">
            {/* Contact */}
            <fieldset className="space-y-8">
              <legend className="label-editorial mb-2">{copy.contact}</legend>
              <div className="field-editorial">
                <label className="label-editorial-muted mb-2">
                  {copy.fullName}
                </label>
                <input type="text" name="fullName" required autoComplete="name" />
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="field-editorial">
                  <label className="label-editorial-muted mb-2">
                    {copy.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="field-editorial">
                  <label className="label-editorial-muted mb-2">
                    {copy.phone}
                  </label>
                  <input type="tel" name="phone" autoComplete="tel" />
                </div>
              </div>
            </fieldset>

            {/* Delivery */}
            <fieldset className="space-y-8">
              <legend className="label-editorial mb-2">{copy.delivery}</legend>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {/* Country — styled as a bottom-line field per the charter */}
                <div className="field-editorial">
                  <label className="label-editorial-muted mb-2">
                    {copy.country}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full appearance-none bg-transparent font-sans text-sm text-neutral-900 focus:outline-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label[locale]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-editorial">
                  <label className="label-editorial-muted mb-2">
                    {copy.city}
                  </label>
                  <input type="text" name="city" required />
                </div>
              </div>
              <div className="field-editorial">
                <label className="label-editorial-muted mb-2">
                  {copy.address}
                </label>
                <input type="text" name="address" required />
              </div>

              {/* Leaflet map */}
              <div className="space-y-3 pt-2">
                <p className="label-editorial-muted">{copy.mapHint}</p>
                <DeliveryMap value={coords} onChange={setCoords} />
                {coords && (
                  <p className="font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-500">
                    {copy.pinSet} — {coords.lat.toFixed(5)},{' '}
                    {coords.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </fieldset>
          </div>

          {/* RIGHT — summary */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-neutral-200 p-8">
              <h2 className="label-editorial mb-8">{copy.summary}</h2>

              <ul className="space-y-5">
                {lines.map((line) => (
                  <li key={line.productId} className="flex items-center gap-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-neutral-50">
                      <Image
                        src={line.image}
                        alt={line.name[locale]}
                        fill
                        sizes="48px"
                        className="object-cover grayscale"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-serif text-base italic text-neutral-900">
                        {line.name[locale]}
                      </p>
                      <p className="font-sans text-[0.7rem] tracking-editorial text-neutral-400">
                        &times;{line.quantity}
                      </p>
                    </div>
                    <span className="font-sans text-sm text-neutral-900">
                      {formatXAF(line.unitPriceXAF * line.quantity, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-4 border-t border-neutral-100 pt-6">
                <Row label={copy.subtotal} value={formatXAF(subtotalXAF, locale)} />
                <Row
                  label={copy.shipping}
                  value={
                    quote.freeApplied
                      ? copy.free
                      : formatXAF(quote.feeXAF, locale)
                  }
                />
                <p className="font-sans text-[0.65rem] tracking-editorial text-neutral-400">
                  {copy.eta(quote.estimatedDays[0], quote.estimatedDays[1])}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-neutral-900 pt-6">
                <span className="label-editorial">{copy.total}</span>
                <span className="font-serif text-2xl italic text-neutral-900">
                  {formatXAF(totalXAF, locale)}
                </span>
              </div>

              <button type="submit" className="btn-editorial mt-8 w-full">
                {copy.place}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

/** A single label/value line in the summary. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-sm font-light text-neutral-500">
        {label}
      </span>
      <span className="font-sans text-sm text-neutral-900">{value}</span>
    </div>
  );
}
