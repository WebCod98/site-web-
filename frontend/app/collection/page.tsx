import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { fetchProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Collection',
  description:
    "L'intégralité des soins et parfums SCULPT'AURA — édition Haute Couture, façonnés à la main.",
};

// Revalidate the catalogue periodically (ISR) when backed by Supabase.
export const revalidate = 300;

/**
 * SCULPT'AURA — collection listing.
 *
 * Fetches the catalogue server-side (Supabase → mock fallback) and hands it to
 * the client CollectionView. Top padding clears the fixed announcement + header.
 */
export default async function CollectionPage() {
  const products = await fetchProducts();

  return (
    <main className="pt-[136px]">
      <CollectionView products={products} />
    </main>
  );
}
