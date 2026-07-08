/**
 * SCULPT'AURA — promo codes.
 *
 * Validates and applies discount codes at order time. Works with Supabase when
 * configured (the `promo_codes` table), or an in-memory set of demo codes
 * otherwise, so the feature is demonstrable without a database.
 *
 * A code carries: kind ('percent' | 'fixed'), value, an optional partner/
 * influencer label + commission, an optional max_uses cap, a usage counter and
 * a running total of the sales it generated (for affiliate performance).
 *
 * Discounts apply to the SUBTOTAL (never below zero). All amounts are XAF.
 */

'use strict';

const { getSupabaseAdmin } = require('./lib/supabase');

// Demo codes (mirror supabase/seed.sql). Usage is tracked in memory.
const demoCodes = new Map(
  [
    { code: 'BIENVENUE10', kind: 'percent', value: 10, label: 'Nouveaux clients', commission_percent: null, max_uses: null, usage_count: 0, total_sales_xaf: 0, is_active: true },
    { code: 'AWA15', kind: 'percent', value: 15, label: 'Influenceuse — Awa', commission_percent: 10, max_uses: 200, usage_count: 0, total_sales_xaf: 0, is_active: true },
    { code: 'PROMO5000', kind: 'fixed', value: 5000, label: 'Offre lancement', commission_percent: null, max_uses: 100, usage_count: 0, total_sales_xaf: 0, is_active: true },
  ].map((c) => [c.code, c]),
);

function normalize(code) {
  return String(code || '').trim().toUpperCase();
}

/** Discount amount (XAF) a promo yields on a given subtotal. */
function computeDiscount(promo, subtotalXAF) {
  const subtotal = Math.max(0, Math.trunc(subtotalXAF) || 0);
  if (promo.kind === 'percent') {
    return Math.min(subtotal, Math.round((subtotal * promo.value) / 100));
  }
  // fixed
  return Math.min(subtotal, Math.trunc(promo.value));
}

/** Fetch a promo by code (Supabase or demo). Returns the row or null. */
async function getPromo(code) {
  const key = normalize(code);
  if (!key) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return demoCodes.get(key) ?? null;
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', key)
    .maybeSingle();
  if (error) throw new Error(`getPromo: ${error.message}`);
  return data;
}

/**
 * Validate a code against a subtotal and return a pricing result.
 * @returns {Promise<{ valid: boolean, code?: string, label?: string|null,
 *   kind?: string, discountXAF: number, reason?: string }>}
 */
async function validatePromo(code, subtotalXAF) {
  const promo = await getPromo(code);
  if (!promo) return { valid: false, discountXAF: 0, reason: 'not_found' };
  if (!promo.is_active) return { valid: false, discountXAF: 0, reason: 'inactive' };

  const now = Date.now();
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now) {
    return { valid: false, discountXAF: 0, reason: 'not_started' };
  }
  if (promo.ends_at && new Date(promo.ends_at).getTime() < now) {
    return { valid: false, discountXAF: 0, reason: 'expired' };
  }
  if (promo.max_uses != null && promo.usage_count >= promo.max_uses) {
    return { valid: false, discountXAF: 0, reason: 'exhausted' };
  }

  const discountXAF = computeDiscount(promo, subtotalXAF);
  return {
    valid: true,
    code: promo.code,
    label: promo.label ?? null,
    kind: promo.kind,
    discountXAF,
  };
}

/**
 * Record one successful use: increment the counter and add the order total to
 * the code's running sales. Best-effort (never throws to the caller).
 */
async function recordUsage(code, orderTotalXAF) {
  const key = normalize(code);
  if (!key) return;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const c = demoCodes.get(key);
    if (c) {
      c.usage_count += 1;
      c.total_sales_xaf += Math.max(0, Math.trunc(orderTotalXAF) || 0);
    }
    return;
  }

  try {
    const { data } = await supabase
      .from('promo_codes')
      .select('usage_count, total_sales_xaf')
      .eq('code', key)
      .maybeSingle();
    if (data) {
      await supabase
        .from('promo_codes')
        .update({
          usage_count: (data.usage_count || 0) + 1,
          total_sales_xaf:
            (data.total_sales_xaf || 0) + Math.max(0, Math.trunc(orderTotalXAF) || 0),
        })
        .eq('code', key);
    }
  } catch {
    // Non-fatal — the order still stands even if the counter update fails.
  }
}

module.exports = { validatePromo, recordUsage, computeDiscount };
