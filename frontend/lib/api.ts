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

export type OrderItemInput = {
  productId?: string;
  name: string;
  quantity: number;
  unitPriceXAF: number;
};

export type CustomerInput = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  country?: string;
};

/** Validate a promo code against a subtotal (checkout preview). */
export function validatePromo(code: string, subtotalXAF: number) {
  return postJSON<{
    valid: boolean;
    discountXAF: number;
    code?: string;
    label?: string | null;
    reason?: string;
  }>('/api/promo/validate', { code, subtotalXAF });
}

/** Create a pending order on the backend (server recomputes totals). */
export function createOrder(input: {
  items: OrderItemInput[];
  customer: CustomerInput;
  countryCode: string;
  coords?: { lat: number; lng: number } | null;
  promoCode?: string | null;
}) {
  return postJSON<{
    orderId: string;
    reference: string;
    subtotalXAF: number;
    shippingXAF: number;
    discountXAF: number;
    promoCode: string | null;
    totalXAF: number;
  }>('/api/orders', input);
}

/** Initialise payment for an order; returns the URL to redirect the buyer to. */
export function initPayment(orderId: string) {
  return postJSON<{ redirectUrl: string; provider: string }>(
    '/api/payments/init',
    { orderId },
  );
}
