'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from './LocaleProvider';
import { useCart } from './CartProvider';
import StarRating from './StarRating';
import { discountPercent, formatXAF } from '@/lib/currency';
import type { Product } from '@/lib/products';
import { getAverageRating, getReviewsForProduct } from '@/lib/reviews';

/**
 * SCULPT'AURA — product detail.
 *
 * A two-column editorial layout: a tall monochrome image, and a right rail with
 * the name, price, quantity stepper and add-to-cart. Below, the verified-reviews
 * block lists paid-buyer ratings and exposes a review form that is deliberately
 * gated — a visitor must own a paid purchase to publish (enforced server-side by
 * RLS + trigger). The gate is reflected in the UI copy here.
 */
export default function ProductDetail({ product }: { product: Product }) {
  const { locale } = useLocale();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const productReviews = getReviewsForProduct(product.id);
  const average = getAverageRating(product.id);

  const copy = {
    fr: {
      back: 'Retour à la collection',
      quantity: 'Quantité',
      add: 'Ajouter au panier',
      shipping: 'Livraison offerte au Cameroun dès 75 000 XAF.',
      reviewsTitle: 'Avis vérifiés',
      noReviews: 'Aucun avis pour le moment.',
      verified: 'Achat vérifié',
      reviewsNote:
        'Seuls les clients ayant réglé une commande de ce produit peuvent publier un avis.',
      basedOn: (n: number) => `${n} avis vérifié${n > 1 ? 's' : ''}`,
    },
    en: {
      back: 'Back to the collection',
      quantity: 'Quantity',
      add: 'Add to cart',
      shipping: 'Complimentary delivery in Cameroon from 75,000 XAF.',
      reviewsTitle: 'Verified reviews',
      noReviews: 'No reviews yet.',
      verified: 'Verified purchase',
      reviewsNote:
        'Only customers who have paid for an order of this product may publish a review.',
      basedOn: (n: number) => `${n} verified review${n > 1 ? 's' : ''}`,
    },
  }[locale];

  return (
    <div className="bg-white pb-28">
      <div className="container-editorial">
        {/* Breadcrumb */}
        <Link
          href="/collection"
          className="label-editorial-muted transition-colors hover:text-neutral-900"
        >
          &larr;&nbsp;&nbsp;{copy.back}
        </Link>

        {/* Main */}
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
            {product.tag && (
              <span className="absolute left-5 top-5 z-10 bg-white/90 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-900">
                {product.tag[locale]}
              </span>
            )}
            <Image
              src={product.image}
              alt={product.name[locale]}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale"
            />
          </div>

          {/* Rail */}
          <div className="flex flex-col justify-center">
            <p className="label-editorial-muted mb-4">
              {product.category[locale]}
            </p>
            <h1 className="font-serif text-4xl italic text-neutral-900 sm:text-5xl">
              {product.name[locale]}
            </h1>

            {/* Rating summary */}
            {productReviews.length > 0 && (
              <div className="mt-5 flex items-center gap-3">
                <StarRating value={average} />
                <span className="label-editorial-muted">
                  {copy.basedOn(productReviews.length)}
                </span>
              </div>
            )}

            <p className="mt-8 max-w-md font-sans text-sm font-light leading-relaxed text-neutral-600">
              {product.description[locale]}
            </p>

            <div className="mt-10 flex items-baseline gap-4">
              <p className="font-serif text-3xl italic text-neutral-900">
                {formatXAF(product.priceXAF, locale)}
              </p>
              {discountPercent(product.priceXAF, product.compareAtXAF) > 0 && (
                <>
                  <span className="font-sans text-lg text-neutral-400 line-through">
                    {formatXAF(product.compareAtXAF as number, locale)}
                  </span>
                  <span className="bg-neutral-900 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-editorial text-white">
                    &minus;{discountPercent(product.priceXAF, product.compareAtXAF)}%
                  </span>
                </>
              )}
            </div>

            {/* Quantity + add */}
            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-2">
                <span className="label-editorial-muted">{copy.quantity}</span>
                <div className="flex items-center gap-6 border border-neutral-200 px-4 py-3">
                  <button
                    type="button"
                    aria-label="Decrease"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="font-sans text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    &minus;
                  </button>
                  <span className="w-6 text-center font-sans text-sm text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="font-sans text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    &#43;
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addItem(product, quantity)}
                className="btn-editorial flex-1 sm:flex-none"
              >
                {copy.add}
              </button>
            </div>

            <p className="mt-8 border-t border-neutral-100 pt-6 font-sans text-[0.7rem] leading-relaxed text-neutral-400">
              {copy.shipping}
            </p>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-28 border-t border-neutral-100 pt-16">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-serif text-3xl italic text-neutral-900">
              {copy.reviewsTitle}
            </h2>
            <p className="mt-4 max-w-md font-sans text-[0.7rem] leading-relaxed text-neutral-400">
              {copy.reviewsNote}
            </p>
          </div>

          {productReviews.length === 0 ? (
            <p className="mt-16 text-center font-serif text-xl italic text-neutral-300">
              {copy.noReviews}
            </p>
          ) : (
            <ul className="mx-auto mt-16 max-w-3xl divide-y divide-neutral-100">
              {productReviews.map((review) => (
                <li key={review.id} className="py-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-lg italic text-neutral-900">
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className="border border-neutral-200 px-2 py-0.5 font-sans text-[0.55rem] uppercase tracking-editorial text-neutral-500">
                          {copy.verified}
                        </span>
                      )}
                    </div>
                    <StarRating value={review.rating} />
                  </div>
                  <p className="mt-4 font-sans text-sm font-light leading-relaxed text-neutral-600">
                    {review.body[locale]}
                  </p>
                  <time className="mt-3 block font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-300">
                    {review.createdAt}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
