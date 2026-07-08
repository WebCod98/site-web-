import { getSupabaseBrowser } from './supabase';

/**
 * SCULPT'AURA Admin — promo codes CRUD (authenticated admin).
 *
 * Manages the `promo_codes` table: create/edit/deactivate codes, and read their
 * usage (usage_count) and generated sales (total_sales_xaf) — useful to measure
 * an influencer/partner's performance. Writes are admin-gated by RLS.
 */

export type PromoKind = 'percent' | 'fixed';

export type PromoCode = {
  id: string;
  code: string;
  kind: PromoKind;
  value: number;
  label: string | null;
  commission_percent: number | null;
  max_uses: number | null;
  usage_count: number;
  total_sales_xaf: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type PromoInput = {
  code: string;
  kind: PromoKind;
  value: number;
  label: string | null;
  commission_percent: number | null;
  max_uses: number | null;
  is_active: boolean;
};

const COLUMNS =
  'id, code, kind, value, label, commission_percent, max_uses, usage_count, total_sales_xaf, is_active, starts_at, ends_at';

export async function listPromos(): Promise<PromoCode[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('promo_codes')
    .select(COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PromoCode[];
}

export async function createPromo(input: PromoInput): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');
  const { error } = await supabase
    .from('promo_codes')
    .insert({ ...input, code: input.code.trim().toUpperCase() });
  if (error) throw new Error(error.message);
}

export async function updatePromo(
  id: string,
  input: Partial<PromoInput>,
): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');
  const payload = input.code
    ? { ...input, code: input.code.trim().toUpperCase() }
    : input;
  const { error } = await supabase.from('promo_codes').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deletePromo(id: string): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function togglePromo(id: string, active: boolean): Promise<void> {
  await updatePromo(id, { is_active: active });
}

/** Demo codes shown when Supabase is not configured (read-only preview). */
export const DEMO_PROMOS: PromoCode[] = [
  { id: 'd1', code: 'BIENVENUE10', kind: 'percent', value: 10, label: 'Nouveaux clients', commission_percent: null, max_uses: null, usage_count: 12, total_sales_xaf: 210000, is_active: true, starts_at: null, ends_at: null },
  { id: 'd2', code: 'AWA15', kind: 'percent', value: 15, label: 'Influenceuse — Awa', commission_percent: 10, max_uses: 200, usage_count: 42, total_sales_xaf: 620000, is_active: true, starts_at: null, ends_at: null },
  { id: 'd3', code: 'PROMO5000', kind: 'fixed', value: 5000, label: 'Offre lancement', commission_percent: null, max_uses: 100, usage_count: 8, total_sales_xaf: 145000, is_active: false, starts_at: null, ends_at: null },
];
