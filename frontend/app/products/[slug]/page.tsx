import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import {
  getAllProductSlugs,
  getProductBySlug,
} from '@/lib/products';

type Params = { params: { slug: string } };

/** Pre-render every product page at build time (SSG/ISR). */
export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

/** Per-product SEO metadata (French default market). */
export function generateMetadata({ params }: Params): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: 'Introuvable' };

  return {
    title: product.name.fr,
    description: product.description.fr,
    openGraph: {
      title: `${product.name.fr} — SCULPT'AURA`,
      description: product.description.fr,
      images: [{ url: product.image }],
    },
  };
}

/**
 * SCULPT'AURA — product detail route.
 *
 * Resolves the product server-side (404 when unknown) and hands off to the
 * client ProductDetail, which owns the interactive pieces (gallery, add-to-cart,
 * verified-reviews block). Top padding clears the fixed header.
 */
export default function ProductPage({ params }: Params) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <main className="pt-[136px]">
      <ProductDetail product={product} />
    </main>
  );
}
