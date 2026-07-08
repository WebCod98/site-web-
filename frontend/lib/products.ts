import type { Locale } from './i18n';

/**
 * SCULPT'AURA — product catalogue (mock).
 *
 * In production these records come from Supabase (see /supabase/schema.sql).
 * For the storefront scaffold we expose a typed, bilingual mock so the UI can
 * be built and reviewed independently of the database. Prices are integer XAF.
 *
 * The house sells shapewear (gaines) and slimming care. The image URLs below are
 * placeholders — replace them with your own product photography (via the admin
 * once Supabase is connected, or by editing these URLs).
 */

export type Product = {
  id: string;
  slug: string;
  /** Bilingual display name. */
  name: Record<Locale, string>;
  /** Short editorial descriptor shown under the name. */
  category: Record<Locale, string>;
  /** Longer one-line description used on cards / detail. */
  description: Record<Locale, string>;
  /** Current price in the native currency, XAF, as an integer. */
  priceXAF: number;
  /**
   * Optional "was" price. When set and higher than priceXAF, the product is on
   * sale: the UI strikes it through and shows the discount badge.
   */
  compareAtXAF?: number;
  /** Remote image URL (monochrome-friendly editorial photography). */
  image: string;
  /** Flag surfaced as a discreet editorial tag. */
  tag?: Record<Locale, string>;
};

export const products: Product[] = [
  {
    id: 'gne-001',
    slug: 'gaine-sculptante-taille',
    name: { fr: 'Gaine Sculptante Taille', en: 'Waist Sculpting Shaper' },
    category: { fr: 'Gainage taille', en: 'Waist shaping' },
    description: {
      fr: 'Gaine taille haute à double sangle, effet sablier immédiat.',
      en: 'High-waist double-strap shaper, instant hourglass effect.',
    },
    priceXAF: 18000,
    compareAtXAF: 22000,
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    tag: { fr: 'Signature', en: 'Signature' },
  },
  {
    id: 'gne-002',
    slug: 'gaine-body-integrale',
    name: { fr: 'Gaine Body Intégrale', en: 'Full Body Shaper' },
    category: { fr: 'Gainage complet', en: 'Full-body shaping' },
    description: {
      fr: 'Body sculptant intégral, maintien ferme du buste aux cuisses.',
      en: 'Full sculpting bodysuit, firm hold from bust to thighs.',
    },
    priceXAF: 25000,
    image:
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'gne-003',
    slug: 'gaine-post-partum',
    name: { fr: 'Gaine Post-Partum', en: 'Postpartum Shaper' },
    category: { fr: 'Après grossesse', en: 'Postpartum' },
    description: {
      fr: 'Ceinture de récupération douce, soutien du ventre après grossesse.',
      en: 'Gentle recovery belt, tummy support after pregnancy.',
    },
    priceXAF: 22000,
    image:
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80',
    tag: { fr: 'Confort', en: 'Comfort' },
  },
  {
    id: 'gne-004',
    slug: 'short-sculptant-cuisses',
    name: { fr: 'Short Sculptant Cuisses', en: 'Thigh Sculpting Shorts' },
    category: { fr: 'Gainage cuisses', en: 'Thigh shaping' },
    description: {
      fr: 'Short gainant taille haute, affine cuisses et hanches.',
      en: 'High-waist shaping shorts, refine thighs and hips.',
    },
    priceXAF: 15000,
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'min-005',
    slug: 'huile-minceur-raffermissante',
    name: { fr: 'Huile Minceur Raffermissante', en: 'Firming Slimming Oil' },
    category: { fr: 'Soin minceur', en: 'Slimming care' },
    description: {
      fr: 'Huile aux actifs botaniques, raffermit et tonifie la peau.',
      en: 'Botanical-active oil, firms and tones the skin.',
    },
    priceXAF: 12000,
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=80',
    tag: { fr: 'Nouveauté', en: 'New' },
  },
  {
    id: 'min-006',
    slug: 'the-minceur-detox',
    name: { fr: 'Thé Minceur Détox', en: 'Detox Slimming Tea' },
    category: { fr: 'Rituel minceur', en: 'Slimming ritual' },
    description: {
      fr: 'Infusion détox aux plantes, accompagne le rituel silhouette.',
      en: 'Herbal detox infusion, companion to the silhouette ritual.',
    },
    priceXAF: 9000,
    compareAtXAF: 12000,
    image:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80',
  },
];

/** Return the featured subset used on the homepage grid. */
export function getFeaturedProducts(limit = 6): Product[] {
  return products.slice(0, limit);
}

/** Resolve a single product by its slug (used by the detail page). */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** All slugs — consumed by generateStaticParams for ISR/SSG. */
export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}
