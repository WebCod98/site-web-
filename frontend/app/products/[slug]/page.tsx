import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import {
  fetchAllProductSlugs,
  fetchProductBySlug,
} from '@/lib/catalog';

type Params = { params: { slug: string } };

// Revalidate product pages periodically (ISR) when backed by Supabase.
export const revalidate = 300;

/** Pre-render every product page at build time (SSG/ISR). */
export async function generateStaticParams() {
  const slugs = await fetchAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Per-product SEO metadata (French default market). */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
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
export default async function ProductPage({ params }: Params) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <main className="pt-[136px]">
      <ProductDetail product={product} />
    </main>
  );
}
