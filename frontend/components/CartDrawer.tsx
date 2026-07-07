'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { useLocale } from './LocaleProvider';
import { formatXAF } from '@/lib/currency';

/**
 * SCULPT'AURA — cart slide-over.
 *
 * A right-anchored drawer on pure white with a hairline divider from the page.
 * Quantity controls are bare +/- glyphs, the remove action is an underlined
 * label — no filled buttons, in keeping with the charter. The subtotal is shown
 * in XAF; final shipping is computed at checkout (dynamic logistics).
 */
export default function CartDrawer() {
  const { locale } = useLocale();
  const {
    lines,
    subtotalXAF,
    isOpen,
    closeCart,
    removeItem,
    setQuantity,
    count,
  } = useCart();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  const t = {
    fr: {
      title: 'Votre panier',
      empty: 'Votre panier est vide',
      subtotal: 'Sous-total',
      note: 'Frais de livraison calculés au paiement.',
      checkout: 'Passer au paiement',
      continue: 'Continuer les achats',
      remove: 'Retirer',
    },
    en: {
      title: 'Your cart',
      empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      note: 'Shipping calculated at checkout.',
      checkout: 'Proceed to checkout',
      continue: 'Continue shopping',
      remove: 'Remove',
    },
  }[locale];

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Scrim */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label={t.title}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-6">
          <h2 className="font-serif text-2xl italic text-neutral-900">
            {t.title}
            <span className="ml-2 align-middle font-sans text-xs not-italic tracking-editorial text-neutral-400">
              ({count})
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close"
            className="label-editorial text-neutral-500 transition-colors hover:text-neutral-900"
          >
            &#10005;
          </button>
        </div>

        {/* Lines */}
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="font-serif text-xl italic text-neutral-400">
              {t.empty}
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="btn-editorial"
            >
              {t.continue}
            </button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto px-8">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-5 py-6">
                <Link
                  href={`/products/${line.slug}`}
                  onClick={closeCart}
                  className="relative h-28 w-20 shrink-0 overflow-hidden bg-neutral-50"
                >
                  <Image
                    src={line.image}
                    alt={line.name[locale]}
                    fill
                    sizes="80px"
                    className="object-cover grayscale"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeCart}
                    className="font-serif text-lg italic text-neutral-900"
                  >
                    {line.name[locale]}
                  </Link>
                  <span className="mt-1 font-sans text-sm text-neutral-500">
                    {formatXAF(line.unitPriceXAF, locale)}
                  </span>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    {/* Quantity stepper — bare glyphs, hairline frame */}
                    <div className="flex items-center gap-4 border border-neutral-200 px-3 py-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setQuantity(line.productId, line.quantity - 1)
                        }
                        className="font-sans text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        &minus;
                      </button>
                      <span className="w-4 text-center font-sans text-sm text-neutral-900">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setQuantity(line.productId, line.quantity + 1)
                        }
                        className="font-sans text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        &#43;
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(line.productId)}
                      className="font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer / checkout */}
        {lines.length > 0 && (
          <div className="border-t border-neutral-100 px-8 py-6">
            <div className="flex items-center justify-between">
              <span className="label-editorial">{t.subtotal}</span>
              <span className="font-serif text-2xl italic text-neutral-900">
                {formatXAF(subtotalXAF, locale)}
              </span>
            </div>
            <p className="mt-2 font-sans text-[0.65rem] leading-relaxed text-neutral-400">
              {t.note}
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-editorial mt-6 w-full"
            >
              {t.checkout}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
