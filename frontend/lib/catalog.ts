import { getSupabaseServer } from './supabase';
import {
  products as mockProducts,
  type Product,
} from './products';

/**
 * SCULPT'AURA — catalogue access.
 *
 * A thin data layer that returns products from Supabase when configured and
 * falls back to the bundled mock otherwise (demo mode). The rest of the app
 * consumes these async helpers without caring which source served the data.
 *
 * Supabase stores bilingual fields as jsonb ({ fr, en }); we map rows to the
 * same `Product` shape the UI already uses.
 */

type ProductRow = {
  id: string;
  slug: string;
  name: Record<'fr' | 'en', string>;
  category: Record<'fr' | 'en', string>;
  description: Record<'fr' | 'en', string>;
  price_xaf: number;
  image_url: string | null;
  tag: Record<'fr' | 'en', string> | null;
};

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    priceXAF: row.price_xaf,
    image: row.image_url ?? '',
    tag: row.tag ?? undefined,
  };
}

/** All published products (Supabase → mock fallback). */
export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return mockProducts;

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, category, description, price_xaf, image_url, tag')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    // Any failure degrades to the mock so the storefront never goes blank.
    return mockProducts;
  }
  return (data as ProductRow[]).map(mapRow);
}

/** The featured subset for the homepage grid. */
export async function fetchFeaturedProducts(limit = 6): Promise<Product[]> {
  const all = await fetchProducts();
  return all.slice(0, limit);
}

/** A single product by slug (Supabase → mock fallback). */
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const supabase = getSupabaseServer();
  if (!supabase) return mockProducts.find((p) => p.slug === slug);

  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, category, description, price_xaf, image_url, tag')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    return mockProducts.find((p) => p.slug === slug);
  }
  return mapRow(data as ProductRow);
}

/** All slugs — for generateStaticParams / sitemap. */
export async function fetchAllProductSlugs(): Promise<string[]> {
  const all = await fetchProducts();
  return all.map((p) => p.slug);
}
