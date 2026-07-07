import type { Locale } from './i18n';

/**
 * SCULPT'AURA — verified reviews (mock).
 *
 * In production these come from Supabase's `reviews` table, where an INSERT is
 * only permitted for customers with a `paid` order of the product (enforced by
 * both an RLS policy and a trigger — see /supabase/schema.sql). Every review
 * shown here is therefore "verified purchase" by construction; the mock mirrors
 * that guarantee with a `verified` flag that is always true.
 */

export type Review = {
  id: string;
  productId: string;
  author: string;
  /** 1–5. */
  rating: number;
  body: Record<Locale, string>;
  /** Always true — only paid buyers can publish (see module doc). */
  verified: boolean;
  createdAt: string; // ISO date
};

export const reviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'srm-001',
    author: 'Aïcha N.',
    rating: 5,
    body: {
      fr: 'Une texture d’une finesse rare. Ma peau paraît sculptée dès la première semaine.',
      en: 'A rare, refined texture. My skin looks sculpted from the very first week.',
    },
    verified: true,
    createdAt: '2026-05-12',
  },
  {
    id: 'rev-2',
    productId: 'srm-001',
    author: 'Louis M.',
    rating: 4,
    body: {
      fr: 'Élégant et efficace. Le flacon est un objet en soi.',
      en: 'Elegant and effective. The bottle is an object in itself.',
    },
    verified: true,
    createdAt: '2026-04-28',
  },
  {
    id: 'rev-3',
    productId: 'crm-002',
    author: 'Fatou B.',
    rating: 5,
    body: {
      fr: 'Le réveil est net, reposé. Un rituel de nuit devenu essentiel.',
      en: 'I wake up looking rested and clear. A night ritual I can no longer skip.',
    },
    verified: true,
    createdAt: '2026-06-02',
  },
  {
    id: 'rev-4',
    productId: 'prf-005',
    author: 'Sandrine K.',
    rating: 5,
    body: {
      fr: 'Un sillage sobre et sculptural, exactement comme promis.',
      en: 'A restrained, sculptural trail — exactly as promised.',
    },
    verified: true,
    createdAt: '2026-06-20',
  },
];

/** Reviews for a given product. */
export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

/** Average rating (0 when there are no reviews). */
export function getAverageRating(productId: string): number {
  const list = getReviewsForProduct(productId);
  if (list.length === 0) return 0;
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / list.length) * 10) / 10;
}
