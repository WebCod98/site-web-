import type { Locale } from './i18n';

/**
 * SCULPT'AURA — currency formatting.
 *
 * The application's native currency is the CFA Franc (XAF). Prices are stored
 * as integer amounts of XAF (no decimals — the franc has no minor unit in
 * practice for retail). This helper renders them with the correct grouping for
 * each locale while keeping the "XAF" suffix explicit for international buyers.
 */
export function formatXAF(amount: number, locale: Locale = 'fr'): string {
  const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const formatted = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted} XAF`;
}

/**
 * Discount percentage between a compare-at ("was") price and the current price.
 * Returns 0 when there is no valid sale. E.g. 22000 → 18000 gives 18 (%).
 */
export function discountPercent(
  priceXAF: number,
  compareAtXAF?: number | null,
): number {
  if (!compareAtXAF || compareAtXAF <= priceXAF) return 0;
  return Math.round((1 - priceXAF / compareAtXAF) * 100);
}
