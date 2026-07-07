/**
 * SCULPT'AURA — storefront API client.
 *
 * Thin fetch helpers targeting the Express backend. The base URL comes from
 * NEXT_PUBLIC_API_URL. Every call is defensive: network/parse failures reject
 * with a typed error so callers can degrade gracefully (the newsletter, for
 * instance, stays optimistic even when the API is unreachable).
 */

import type { Locale } from './i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }

  // Some endpoints return 202 with a small JSON body; tolerate empty bodies.
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/** Subscribe an email to the newsletter (rate-limited server-side). */
export function subscribeNewsletter(email: string, locale: Locale) {
  return postJSON<{ status: string }>('/api/newsletter', { email, locale });
}

/** Fetch a shipping quote for a destination + subtotal (XAF). */
export function quoteShippingRemote(countryCode: string, subtotalXAF: number) {
  return postJSON<{
    scope: string;
    feeXAF: number;
    freeApplied: boolean;
    estimatedDays: [number, number];
  }>('/api/shipping/quote', { countryCode, subtotalXAF });
}
