'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from './LocaleProvider';
import { useCart } from './CartProvider';
import { discountPercent, formatXAF } from '@/lib/currency';
import type { Product } from '@/lib/products';

/**
 * SCULPT'AURA — product card.
 *
 * Editorial, boxless composition: an image on a bare white ground, a discreet
 * tag, the serif name, sans metadata, and an XAF price. The "Add" affordance
 * reveals itself on hover as an underlined label, never a filled button — in
 * keeping with the charter's restraint.
 */
export default function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const { addItem } = useCart();
  const off = discountPercent(product.priceXAF, product.compareAtXAF);

  return (
    <article className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-neutral-50"
      >
        {product.tag && (
          <span className="absolute left-4 top-4 z-10 bg-white/90 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-900">
            {product.tag[locale]}
          </span>
        )}
        {off > 0 && (
          <span className="absolute right-4 top-4 z-10 bg-neutral-900 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-editorial text-white">
            &minus;{off}%
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name[locale]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
        />
      </Link>

      <div className="flex flex-1 flex-col items-center px-2 pt-6 text-center">
        <p className="label-editorial-muted mb-2">{product.category[locale]}</p>
        <h3 className="font-serif text-xl italic text-neutral-900">
          {product.name[locale]}
        </h3>
        <p className="mt-2 max-w-xs font-sans text-xs font-light leading-relaxed text-neutral-500">
          {product.description[locale]}
        </p>

        <div className="mt-5 flex flex-col items-center gap-3">
          <span className="flex items-center gap-2 font-sans text-sm tracking-wide text-neutral-900">
            {off > 0 && (
              <span className="text-neutral-400 line-through">
                {formatXAF(product.compareAtXAF as number, locale)}
              </span>
            )}
            {formatXAF(product.priceXAF, locale)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="border-b border-transparent pb-1 font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-900 transition-colors duration-300 hover:border-neutral-900"
          >
            {t.collection.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}
