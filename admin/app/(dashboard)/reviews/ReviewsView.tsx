'use client';

import { useState } from 'react';
import { reviews as initialReviews, type AdminReview } from '@/lib/data';

/**
 * SCULPT'AURA Admin — review moderation.
 *
 * Every review shown is from a verified (paid) buyer — the storefront enforces
 * that at insert time. Moderation here is limited to approving or hiding a
 * review for publication (toggling `is_approved`). State is local; the wired
 * version persists the change to Supabase.
 */
export default function ReviewsView() {
  const [items, setItems] = useState<AdminReview[]>(initialReviews);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r)),
    );
  };

  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      <header className="mb-10">
        <p className="label-editorial-muted">Modération</p>
        <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
          Avis vérifiés
        </h1>
        <p className="mt-4 max-w-xl font-sans text-sm font-light text-neutral-500">
          Tous les avis proviennent de clients ayant réglé une commande du
          produit. La modération se limite à la publication.
        </p>
      </header>

      <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
        {items.map((review) => (
          <li key={review.id} className="flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <span className="font-serif text-lg italic text-neutral-900">
                  {review.author}
                </span>
                <span className="font-sans text-sm tracking-widest text-neutral-900">
                  {'★'.repeat(review.rating)}
                  <span className="text-neutral-200">
                    {'★'.repeat(5 - review.rating)}
                  </span>
                </span>
                {review.verified && (
                  <span className="pill border-neutral-200 text-neutral-500">
                    Achat vérifié
                  </span>
                )}
              </div>
              <p className="mt-3 font-sans text-sm font-light leading-relaxed text-neutral-600">
                {review.body}
              </p>
              <p className="mt-2 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-300">
                {review.product} &middot; {review.createdAt}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`pill ${
                  review.approved
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-400'
                }`}
              >
                {review.approved ? 'Publié' : 'En attente'}
              </span>
              <button
                type="button"
                onClick={() => toggle(review.id)}
                className="font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
              >
                {review.approved ? 'Masquer' : 'Publier'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
