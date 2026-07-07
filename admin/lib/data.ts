/**
 * SCULPT'AURA Admin — dashboard data (mock).
 *
 * In production these come from Supabase (read with an admin session, which the
 * RLS `is_admin()` predicate authorises). The shapes mirror the SQL tables in
 * /supabase/schema.sql. All amounts are integer XAF.
 */

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type AdminOrder = {
  id: string;
  reference: string;
  customer: string;
  email: string;
  status: OrderStatus;
  totalXAF: number;
  scope: 'national' | 'international';
  country: string;
  city: string;
  /** Leaflet-captured delivery pin (null when the customer skipped the map). */
  deliveryLat: number | null;
  deliveryLng: number | null;
  createdAt: string;
  items: number;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceXAF: number;
  stock: number;
  published: boolean;
};

export type AdminReview = {
  id: string;
  product: string;
  author: string;
  rating: number;
  body: string;
  approved: boolean;
  /** Always a verified (paid) buyer — enforced server-side. */
  verified: boolean;
  createdAt: string;
};

export const orders: AdminOrder[] = [
  {
    id: 'o1',
    reference: 'SA-2026-0148',
    customer: 'Aïcha Nkoulou',
    email: 'aicha.n@example.cm',
    status: 'pending',
    totalXAF: 156000,
    scope: 'national',
    country: 'CM',
    city: 'Douala',
    deliveryLat: 4.0483,
    deliveryLng: 9.7043,
    createdAt: '2026-07-06',
    items: 2,
  },
  {
    id: 'o2',
    reference: 'SA-2026-0147',
    customer: 'Louis Mbarga',
    email: 'l.mbarga@example.cm',
    status: 'pending',
    totalXAF: 82000,
    scope: 'national',
    country: 'CM',
    city: 'Yaoundé',
    deliveryLat: 3.8578,
    deliveryLng: 11.5215,
    createdAt: '2026-07-06',
    items: 1,
  },
  {
    id: 'o3',
    reference: 'SA-2026-0146',
    customer: 'Sandrine Kouam',
    email: 's.kouam@example.fr',
    status: 'paid',
    totalXAF: 205000,
    scope: 'international',
    country: 'FR',
    city: 'Paris',
    deliveryLat: 48.8566,
    deliveryLng: 2.3522,
    createdAt: '2026-07-05',
    items: 3,
  },
  {
    id: 'o4',
    reference: 'SA-2026-0145',
    customer: 'Fatou Bello',
    email: 'fatou.b@example.cm',
    status: 'shipped',
    totalXAF: 96000,
    scope: 'national',
    country: 'CM',
    city: 'Bafoussam',
    deliveryLat: 5.4781,
    deliveryLng: 10.4176,
    createdAt: '2026-07-04',
    items: 1,
  },
  {
    id: 'o5',
    reference: 'SA-2026-0144',
    customer: 'Éric Fotso',
    email: 'e.fotso@example.cm',
    status: 'delivered',
    totalXAF: 132000,
    scope: 'national',
    country: 'CM',
    city: 'Kribi',
    deliveryLat: 2.9391,
    deliveryLng: 9.9095,
    createdAt: '2026-07-02',
    items: 2,
  },
  {
    id: 'o6',
    reference: 'SA-2026-0143',
    customer: 'Marie Laurent',
    email: 'm.laurent@example.be',
    status: 'pending',
    totalXAF: 174000,
    scope: 'international',
    country: 'BE',
    city: 'Bruxelles',
    deliveryLat: 50.8503,
    deliveryLng: 4.3517,
    createdAt: '2026-07-06',
    items: 2,
  },
];

export const products: AdminProduct[] = [
  { id: 'srm-001', slug: 'serum-lumiere-sculptante', name: 'Sérum Lumière Sculptante', category: 'Soin visage', priceXAF: 82000, stock: 34, published: true },
  { id: 'crm-002', slug: 'creme-architecture-nuit', name: 'Crème Architecture Nuit', category: 'Soin de nuit', priceXAF: 96000, stock: 21, published: true },
  { id: 'oil-003', slug: 'huile-precieuse-aura', name: 'Huile Précieuse Aura', category: 'Huile visage', priceXAF: 74000, stock: 8, published: true },
  { id: 'msk-004', slug: 'masque-porcelaine-noire', name: 'Masque Porcelaine Noire', category: 'Rituel hebdomadaire', priceXAF: 58000, stock: 42, published: true },
  { id: 'prf-005', slug: 'eau-de-parfum-monolithe', name: 'Eau de Parfum Monolithe', category: 'Parfum', priceXAF: 120000, stock: 15, published: true },
  { id: 'clr-006', slug: 'baume-nettoyant-marbre', name: 'Baume Nettoyant Marbre', category: 'Nettoyage', priceXAF: 49000, stock: 0, published: false },
];

export const reviews: AdminReview[] = [
  { id: 'r1', product: 'Sérum Lumière Sculptante', author: 'Aïcha N.', rating: 5, body: 'Une texture d’une finesse rare.', approved: true, verified: true, createdAt: '2026-05-12' },
  { id: 'r2', product: 'Huile Précieuse Aura', author: 'Louis M.', rating: 4, body: 'Élégant et efficace.', approved: false, verified: true, createdAt: '2026-07-01' },
  { id: 'r3', product: 'Crème Architecture Nuit', author: 'Fatou B.', rating: 5, body: 'Un rituel de nuit devenu essentiel.', approved: false, verified: true, createdAt: '2026-07-03' },
];

/** Aggregate KPIs for the dashboard header. */
export function getKpis() {
  const revenue = orders
    .filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.totalXAF, 0);

  return {
    revenueXAF: revenue,
    orders: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    lowStock: products.filter((p) => p.stock <= 10).length,
  };
}

/** Orders awaiting fulfilment — plotted on the logistics map. */
export function getPendingOrders(): AdminOrder[] {
  return orders.filter(
    (o) => o.status === 'pending' && o.deliveryLat !== null,
  );
}

/** French label + monochrome border treatment for each status. */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

/** Format an integer XAF amount in the French convention. */
export function formatXAF(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount)} XAF`;
}
