import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';

export const metadata: Metadata = {
  title: 'Collection',
  description:
    "L'intégralité des soins et parfums SCULPT'AURA — édition Haute Couture, façonnés à la main.",
};

/**
 * SCULPT'AURA — collection listing.
 *
 * A server route wrapping the client CollectionView (which needs the locale and
 * cart contexts). The top padding clears the fixed announcement + header.
 */
export default function CollectionPage() {
  return (
    <main className="pt-[136px]">
      <CollectionView />
    </main>
  );
}
