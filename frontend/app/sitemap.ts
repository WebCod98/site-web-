import type { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/catalog';

/**
 * SCULPT'AURA — sitemap.
 *
 * Emits the homepage plus one entry per product, read from the catalogue
 * (Supabase → mock fallback).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const now = new Date();
  const products = await fetchProducts();

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productEntries,
  ];
}
