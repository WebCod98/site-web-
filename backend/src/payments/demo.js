/**
 * SCULPT'AURA — DEMO payment provider.
 *
 * A zero-dependency simulator so the full purchase flow can be demonstrated
 * without any payment account or keys. `initPayment` returns a URL to a small
 * backend-hosted "demo checkout" page (rendered by the route in index.js) where
 * clicking "Pay" confirms the order. There is no real money movement.
 *
 * This provider is the default (PAYMENT_PROVIDER unset). Never use it in
 * production — switch PAYMENT_PROVIDER to a real provider (e.g. "cinetpay").
 */

'use strict';

const API_BASE = () => process.env.PUBLIC_API_URL || 'http://localhost:4000';

module.exports = {
  name: 'demo',

  /**
   * Build the demo checkout URL for an order. No network call.
   * @returns {Promise<{ redirectUrl: string }>}
   */
  async initPayment(order) {
    const url = `${API_BASE()}/api/payments/demo/checkout?orderId=${encodeURIComponent(
      order.id,
    )}`;
    return { redirectUrl: url };
  },

  /**
   * The demo confirmation is driven by the /api/payments/demo/confirm route, so
   * there is no external webhook to verify here.
   */
  async verifyWebhook() {
    return { ok: false, orderId: null, paymentRef: null };
  },
};
