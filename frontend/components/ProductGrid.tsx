'use client';

import ProductCard from './ProductCard';
import { useLocale } from './LocaleProvider';
import { getFeaturedProducts, type Product } from '@/lib/products';

/**
 * SCULPT'AURA — featured collection grid.
 *
 * A generous three-column grid on desktop with wide gutters, headed by an
 * eyebrow / serif title pair. Products are supplied by the server page
 * (Supabase → mock fallback); the prop defaults to the bundled mock so the
 * component stays safe in isolation.
 */
export default function ProductGrid({
  featured = getFeaturedProducts(6),
}: {
  featured?: Product[];
}) {
  const { t } = useLocale();

  return (
    <section id="collection" className="bg-white py-24 sm:py-32">
      <div className="container-editorial">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <p className="label-editorial-muted mb-4">{t.collection.eyebrow}</p>
          <h2 className="font-serif text-4xl italic text-neutral-900 sm:text-5xl">
            {t.collection.title}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all */}
        <div className="mt-20 flex justify-center">
          <a href="#collection" className="btn-editorial">
            {t.collection.viewAll}
          </a>
        </div>
      </div>
    </section>
  );
}
