/**
 * SCULPT'AURA — dynamic logistics.
 *
 * Computes the shipping fee at checkout from the destination country and the
 * cart subtotal, mirroring the `shipping_zones` rows seeded in the database.
 * Cameroon (CM) is the national market; every other country falls back to the
 * international rate. All amounts are integers in the native currency, XAF.
 */

'use strict';

/**
 * Static representation of the seeded shipping zones. In production these values
 * are read from Supabase (public.shipping_zones); kept inline here so the API is
 * runnable before the database is provisioned.
 */
const ZONES = {
  national: {
    scope: 'national',
    baseFeeXAF: 2000,
    freeOverXAF: 75000, // free delivery in Cameroon from 75,000 XAF
    estimatedDays: [1, 3],
  },
  international: {
    scope: 'international',
    baseFeeXAF: 25000,
    freeOverXAF: null, // no free-shipping threshold internationally
    estimatedDays: [5, 14],
  },
};

const NATIONAL_COUNTRY = 'CM';

/**
 * Resolve the shipping quote for a destination and subtotal.
 *
 * @param {Object} params
 * @param {string} params.countryCode  ISO 3166-1 alpha-2 destination (e.g. "CM").
 * @param {number} params.subtotalXAF  Cart subtotal in XAF (integer).
 * @returns {{ scope: string, feeXAF: number, freeApplied: boolean, estimatedDays: number[] }}
 */
function quoteShipping({ countryCode, subtotalXAF }) {
  const normalized = String(countryCode || '').trim().toUpperCase();
  const subtotal = Number.isFinite(subtotalXAF) ? Math.max(0, Math.trunc(subtotalXAF)) : 0;

  const zone = normalized === NATIONAL_COUNTRY ? ZONES.national : ZONES.international;

  // Apply the free-shipping threshold when configured and reached.
  const freeApplied =
    zone.freeOverXAF !== null && subtotal >= zone.freeOverXAF;

  const feeXAF = freeApplied ? 0 : zone.baseFeeXAF;

  return {
    scope: zone.scope,
    feeXAF,
    freeApplied,
    estimatedDays: zone.estimatedDays,
  };
}

module.exports = { quoteShipping, ZONES, NATIONAL_COUNTRY };
