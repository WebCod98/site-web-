import type { Locale } from './i18n';

/**
 * SCULPT'AURA — product catalogue (mock).
 *
 * In production these records come from Supabase (see /supabase/schema.sql).
 * For the storefront scaffold we expose a typed, bilingual mock so the UI can
 * be built and reviewed independently of the database. Prices are integer XAF.
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
  /** Price in the native currency, XAF, as an integer. */
  priceXAF: number;
  /** Remote image URL (monochrome-friendly editorial photography). */
  image: string;
  /** Flag surfaced as a discreet editorial tag. */
  tag?: Record<Locale, string>;
};

export const products: Product[] = [
  {
    id: 'srm-001',
    slug: 'serum-lumiere-sculptante',
    name: { fr: 'Sérum Lumière Sculptante', en: 'Sculpting Light Serum' },
    category: { fr: 'Soin visage', en: 'Face care' },
    description: {
      fr: 'Concentré liftant à l’acide hyaluronique fractionné.',
      en: 'Lifting concentrate with fractionated hyaluronic acid.',
    },
    priceXAF: 82000,
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    tag: { fr: 'Signature', en: 'Signature' },
  },
  {
    id: 'crm-002',
    slug: 'creme-architecture-nuit',
    name: { fr: 'Crème Architecture Nuit', en: 'Night Architecture Cream' },
    category: { fr: 'Soin de nuit', en: 'Night care' },
    description: {
      fr: 'Régénération nocturne aux peptides et huile de baobab.',
      en: 'Overnight regeneration with peptides and baobab oil.',
    },
    priceXAF: 96000,
    image:
      'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'oil-003',
    slug: 'huile-precieuse-aura',
    name: { fr: 'Huile Précieuse Aura', en: 'Aura Precious Oil' },
    category: { fr: 'Huile visage', en: 'Face oil' },
    description: {
      fr: 'Élixir sec, fini satiné, actifs botaniques rares.',
      en: 'Dry elixir, satin finish, rare botanical actives.',
    },
    priceXAF: 74000,
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=80',
    tag: { fr: 'Édition limitée', en: 'Limited edition' },
  },
  {
    id: 'msk-004',
    slug: 'masque-porcelaine-noire',
    name: { fr: 'Masque Porcelaine Noire', en: 'Black Porcelain Mask' },
    category: { fr: 'Rituel hebdomadaire', en: 'Weekly ritual' },
    description: {
      fr: 'Charbon activé et argile, éclat instantané.',
      en: 'Activated charcoal and clay, instant radiance.',
    },
    priceXAF: 58000,
    image:
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'prf-005',
    slug: 'eau-de-parfum-monolithe',
    name: { fr: 'Eau de Parfum Monolithe', en: 'Monolith Eau de Parfum' },
    category: { fr: 'Parfum', en: 'Fragrance' },
    description: {
      fr: 'Boisé minéral, sillage sculptural et sobre.',
      en: 'Mineral woods, a sculptural, restrained trail.',
    },
    priceXAF: 120000,
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80',
    tag: { fr: 'Nouveauté', en: 'New' },
  },
  {
    id: 'clr-006',
    slug: 'baume-nettoyant-marbre',
    name: { fr: 'Baume Nettoyant Marbre', en: 'Marble Cleansing Balm' },
    category: { fr: 'Nettoyage', en: 'Cleanse' },
    description: {
      fr: 'Fond en huile soyeuse, démaquille et purifie.',
      en: 'Melts into a silky oil, removes make-up and purifies.',
    },
    priceXAF: 49000,
    image:
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80',
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
