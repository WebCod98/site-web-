import type { Locale } from './i18n';

/**
 * SCULPT'AURA — dynamic logistics (client mirror).
 *
 * Mirrors the backend's shipping rules (backend/src/shipping.js and the seeded
 * `shipping_zones` rows) so the checkout summary can update instantly as the
 * customer changes country/quantity. The BACKEND remains authoritative at order
 * creation; this is purely for a responsive preview. Amounts are integer XAF.
 */

export type ShippingScope = 'national' | 'international';

export type ShippingQuote = {
  scope: ShippingScope;
  feeXAF: number;
  freeApplied: boolean;
  estimatedDays: [number, number];
};

const NATIONAL_COUNTRY = 'CM';

const ZONES: Record<ShippingScope, Omit<ShippingQuote, 'freeApplied'> & {
  freeOverXAF: number | null;
}> = {
  national: {
    scope: 'national',
    feeXAF: 2000,
    freeOverXAF: 75000,
    estimatedDays: [1, 3],
  },
  international: {
    scope: 'international',
    feeXAF: 25000,
    freeOverXAF: null,
    estimatedDays: [5, 14],
  },
};

/** Countries offered at checkout. CM is the national market; others ship intl. */
export const COUNTRIES: { code: string; label: Record<Locale, string> }[] = [
  { code: 'CM', label: { fr: 'Cameroun', en: 'Cameroon' } },
  { code: 'FR', label: { fr: 'France', en: 'France' } },
  { code: 'BE', label: { fr: 'Belgique', en: 'Belgium' } },
  { code: 'CH', label: { fr: 'Suisse', en: 'Switzerland' } },
  { code: 'CA', label: { fr: 'Canada', en: 'Canada' } },
  { code: 'US', label: { fr: 'États-Unis', en: 'United States' } },
  { code: 'CI', label: { fr: "Côte d'Ivoire", en: 'Ivory Coast' } },
  { code: 'SN', label: { fr: 'Sénégal', en: 'Senegal' } },
  { code: 'GA', label: { fr: 'Gabon', en: 'Gabon' } },
];

/** Resolve the shipping quote for a destination and subtotal. */
export function quoteShipping(
  countryCode: string,
  subtotalXAF: number,
): ShippingQuote {
  const normalized = (countryCode || '').trim().toUpperCase();
  const subtotal = Number.isFinite(subtotalXAF)
    ? Math.max(0, Math.trunc(subtotalXAF))
    : 0;

  const zone =
    normalized === NATIONAL_COUNTRY ? ZONES.national : ZONES.international;

  const freeApplied =
    zone.freeOverXAF !== null && subtotal >= zone.freeOverXAF;

  return {
    scope: zone.scope,
    feeXAF: freeApplied ? 0 : zone.feeXAF,
    freeApplied,
    estimatedDays: zone.estimatedDays,
  };
}
