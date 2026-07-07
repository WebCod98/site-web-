/**
 * SCULPT'AURA — order store.
 *
 * Persists orders either in Supabase (when the service-role client is
 * configured) or in an in-memory Map (demo / local development without a
 * database). The public surface is identical in both modes, so the routes and
 * payment flow work the same whether or not Supabase is wired up.
 *
 * All amounts are integer XAF. The `paid` status is the one the verified-review
 * gate and the invoice email depend on.
 */

'use strict';

const { getSupabaseAdmin } = require('./lib/supabase');
const { quoteShipping } = require('./shipping');

// Fallback store used when Supabase is not configured (demo mode).
/** @type {Map<string, object>} */
const memoryOrders = new Map();

let counter = 1000;

/** Generate a human-readable order reference, e.g. "SA-2026-1042". */
function nextReference() {
  counter += 1;
  const year = new Date().getFullYear();
  return `SA-${year}-${String(counter).padStart(4, '0')}`;
}

/** Basic id generator (crypto-free, sufficient for demo references). */
function randomId() {
  return `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a pending order from a validated cart payload.
 *
 * @param {Object} input
 * @param {Array<{ productId?: string, name: string, quantity: number, unitPriceXAF: number }>} input.items
 * @param {Object} input.customer  { name, email, phone, address, city }
 * @param {string} input.countryCode
 * @param {{ lat: number, lng: number } | null} [input.coords]
 * @returns {Promise<object>} the created order (id, reference, totals, status…).
 */
async function createOrder(input) {
  const items = Array.isArray(input.items) ? input.items : [];
  const subtotalXAF = items.reduce(
    (sum, it) => sum + Number(it.unitPriceXAF) * Number(it.quantity),
    0,
  );

  // Server-side authoritative shipping quote (never trust the client's total).
  const quote = quoteShipping({
    countryCode: input.countryCode,
    subtotalXAF,
  });
  const shippingXAF = quote.feeXAF;
  const totalXAF = subtotalXAF + shippingXAF;

  const order = {
    id: randomId(),
    reference: nextReference(),
    status: 'pending',
    customer: input.customer || {},
    items,
    countryCode: (input.countryCode || '').toUpperCase(),
    shippingScope: quote.scope,
    deliveryLat: input.coords?.lat ?? null,
    deliveryLng: input.coords?.lng ?? null,
    subtotalXAF,
    shippingXAF,
    totalXAF,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Demo mode — keep it in memory.
    memoryOrders.set(order.id, order);
    return order;
  }

  // Persist to Supabase: the order row, then its line items.
  const { data: row, error } = await supabase
    .from('orders')
    .insert({
      status: 'pending',
      subtotal_xaf: subtotalXAF,
      shipping_xaf: shippingXAF,
      total_xaf: totalXAF,
      shipping_scope: quote.scope,
      country_code: order.countryCode,
      city: order.customer.city ?? null,
      address_line: order.customer.address ?? null,
      delivery_lat: order.deliveryLat,
      delivery_lng: order.deliveryLng,
      // `user_id` is attached when an authenticated session places the order;
      // guest checkout leaves it null (allowed by the insert policy for the
      // service role).
      user_id: input.userId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createOrder: ${error.message}`);

  order.id = row.id;
  order.reference = row.id.slice(0, 8).toUpperCase();

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((it) => ({
        order_id: row.id,
        product_id: it.productId,
        quantity: Number(it.quantity),
        unit_price_xaf: Number(it.unitPriceXAF),
      })),
    );
    if (itemsError) throw new Error(`createOrder items: ${itemsError.message}`);
  }

  return order;
}

/** Fetch an order by id (Supabase or memory). */
async function getOrder(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return memoryOrders.get(id) ?? null;
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getOrder: ${error.message}`);
  return data;
}

/**
 * Mark an order as paid and stamp the payment reference. Idempotent: a second
 * call for an already-paid order is a no-op (webhooks can retry).
 *
 * @returns {Promise<{ order: object, alreadyPaid: boolean } | null>}
 */
async function markOrderPaid(id, paymentRef) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const order = memoryOrders.get(id);
    if (!order) return null;
    if (order.status === 'paid') return { order, alreadyPaid: true };
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    order.paymentRef = paymentRef ?? null;
    memoryOrders.set(id, order);
    return { order, alreadyPaid: false };
  }

  const existing = await getOrder(id);
  if (!existing) return null;
  if (existing.status === 'paid') return { order: existing, alreadyPaid: true };

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_ref: paymentRef ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`markOrderPaid: ${error.message}`);
  return { order: data, alreadyPaid: false };
}

module.exports = { createOrder, getOrder, markOrderPaid };
