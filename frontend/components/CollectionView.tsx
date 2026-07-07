'use client';

import ProductCard from './ProductCard';
import { useLocale } from './LocaleProvider';
import { products as mockProducts, type Product } from '@/lib/products';

/**
 * SCULPT'AURA — full collection grid.
 *
 * The complete catalogue on a bare white ground, headed by an editorial title
 * block. Products are supplied by the server page (Supabase → mock fallback);
 * the prop defaults to the bundled mock so the component is safe in isolation.
 */
export default function CollectionView({
  products = mockProducts,
}: {
  products?: Product[];
}) {
  const { locale, t } = useLocale();

  const copy = {
    fr: {
      eyebrow: 'La collection complète',
      title: 'Tous les soins',
      count: `${products.length} pièces`,
    },
    en: {
      eyebrow: 'The full collection',
      title: 'All treatments',
      count: `${products.length} pieces`,
    },
  }[locale];

  return (
    <section className="bg-white pb-28 pt-8">
      <div className="container-editorial">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <p className="label-editorial-muted mb-4">{copy.eyebrow}</p>
          <h1 className="font-serif text-5xl italic text-neutral-900 sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 label-editorial-muted">{copy.count}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Charter footnote */}
        <p className="mt-24 text-center font-serif text-2xl italic text-neutral-300">
          {t.collection.eyebrow}
        </p>
      </div>
    </section>
  );
}
