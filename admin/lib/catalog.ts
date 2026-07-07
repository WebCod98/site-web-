import { getSupabaseBrowser } from './supabase';

/**
 * SCULPT'AURA Admin — catalogue CRUD (client-side, authenticated).
 *
 * All calls use the authenticated admin session; Row Level Security enforces
 * that only an `is_admin` profile may write. Bilingual fields are stored as
 * jsonb ({ fr, en }) to match the storefront.
 */

export type Bilingual = { fr: string; en: string };

export type CatalogProduct = {
  id: string;
  slug: string;
  name: Bilingual;
  category: Bilingual;
  description: Bilingual;
  price_xaf: number;
  image_url: string | null;
  tag: Bilingual | null;
  stock: number;
  is_published: boolean;
};

/** Payload for creating / updating a product (no id on create). */
export type ProductInput = Omit<CatalogProduct, 'id'>;

const COLUMNS =
  'id, slug, name, category, description, price_xaf, image_url, tag, stock, is_published';

/** List every product (published or not) — admin view. */
export async function listProducts(): Promise<CatalogProduct[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('products')
    .select(COLUMNS)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CatalogProduct[];
}

/** Create a new product. */
export async function createProduct(input: ProductInput): Promise<CatalogProduct> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');

  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as CatalogProduct;
}

/** Update an existing product by id. */
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<CatalogProduct> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');

  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as CatalogProduct;
}

/** Delete a product by id. */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Toggle publication state. */
export async function setPublished(
  id: string,
  isPublished: boolean,
): Promise<void> {
  await updateProduct(id, { is_published: isPublished });
}

/** Build a URL-friendly slug from a French product name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (combining marks)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
