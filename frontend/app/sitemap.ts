import type { MetadataRoute } from 'next';
import { products } from '@/lib/products';

/**
 * SCULPT'AURA — sitemap.
 *
 * Emits the homepage plus one entry per product. When the catalogue moves to
 * Supabase, this generator reads the live rows instead of the mock array.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const now = new Date();

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
