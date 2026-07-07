/**
 * SCULPT'AURA — CinetPay payment provider.
 *
 * CinetPay is a pan-African gateway covering Mobile Money (MTN, Orange) and
 * cards — well suited to the Cameroonian market. The native currency here is
 * XAF, which CinetPay supports directly.
 *
 * Flow:
 *   1. initPayment → POST /v2/payment to create a transaction; returns a hosted
 *      payment_url we redirect the customer to.
 *   2. The customer pays; CinetPay POSTs a notification to our notify_url.
 *   3. verifyWebhook → POST /v2/payment/check to authoritatively confirm the
 *      transaction status before we mark the order paid (never trust the raw
 *      notification body).
 *
 * Docs: https://docs.cinetpay.com
 *
 * Required env: CINETPAY_API_KEY, CINETPAY_SITE_ID.
 * Uses the global fetch available in Node 18+.
 */

'use strict';

const CHECKOUT_URL = 'https://api-checkout.cinetpay.com/v2/payment';
const CHECK_URL = 'https://api-checkout.cinetpay.com/v2/payment/check';

function credentials() {
  const apikey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apikey || !siteId) {
    throw new Error(
      'CinetPay is selected but CINETPAY_API_KEY / CINETPAY_SITE_ID are missing.',
    );
  }
  return { apikey, siteId };
}

module.exports = {
  name: 'cinetpay',

  /**
   * Create a CinetPay transaction for an order.
   * @param {object} order
   * @param {{ notifyUrl: string, returnUrl: string }} urls
   * @returns {Promise<{ redirectUrl: string, token: string }>}
   */
  async initPayment(order, urls) {
    const { apikey, siteId } = credentials();

    // We use the order id as the transaction_id so the webhook can resolve it.
    const body = {
      apikey,
      site_id: siteId,
      transaction_id: order.id,
      amount: order.totalXAF,
      currency: 'XAF',
      description: `Commande ${order.reference} — SCULPT'AURA`,
      notify_url: urls.notifyUrl,
      return_url: urls.returnUrl,
      channels: 'ALL',
      customer_name: order.customer?.name || 'Client',
      customer_email: order.customer?.email || '',
      customer_phone_number: order.customer?.phone || '',
    };

    const res = await fetch(CHECKOUT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    // CinetPay returns code "201" on success with data.payment_url.
    if (json.code !== '201' || !json.data?.payment_url) {
      throw new Error(
        `CinetPay init failed: ${json.code} ${json.message || ''}`.trim(),
      );
    }

    return {
      redirectUrl: json.data.payment_url,
      token: json.data.payment_token,
    };
  },

  /**
   * Verify a CinetPay notification by re-checking the transaction server-side.
   * @param {import('express').Request} req
   * @returns {Promise<{ ok: boolean, orderId: string | null, paymentRef: string | null }>}
   */
  async verifyWebhook(req) {
    const { apikey, siteId } = credentials();

    // CinetPay posts form-encoded fields including cpm_trans_id (our order id).
    const transactionId =
      req.body?.cpm_trans_id || req.body?.transaction_id || null;
    if (!transactionId) {
      return { ok: false, orderId: null, paymentRef: null };
    }

    const res = await fetch(CHECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey,
        site_id: siteId,
        transaction_id: transactionId,
      }),
    });
    const json = await res.json();

    const accepted =
      json.code === '00' && json.data?.status === 'ACCEPTED';

    return {
      ok: Boolean(accepted),
      orderId: transactionId,
      paymentRef: json.data?.payment_method
        ? `cinetpay:${json.data.operator_id || transactionId}`
        : `cinetpay:${transactionId}`,
    };
  },
};
