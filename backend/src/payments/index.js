/**
 * SCULPT'AURA — payment provider resolver.
 *
 * Selects the active payment provider from PAYMENT_PROVIDER:
 *   - "demo"     → a self-contained simulator (no account, no keys). Default.
 *   - "cinetpay" → CinetPay (Mobile Money / cards, ideal for Cameroon).
 *
 * Every provider exposes the same shape so the routes stay provider-agnostic:
 *   {
 *     name: string,
 *     initPayment(order, { notifyUrl, returnUrl }) => Promise<{ redirectUrl }>,
 *     verifyWebhook(req) => Promise<{ ok, orderId, paymentRef }>,
 *   }
 *
 * Adding Stripe/Flutterwave later is just another module implementing this shape.
 */

'use strict';

const demo = require('./demo');
const cinetpay = require('./cinetpay');

function getPaymentProvider() {
  const choice = (process.env.PAYMENT_PROVIDER || 'demo').toLowerCase();
  switch (choice) {
    case 'cinetpay':
      return cinetpay;
    case 'demo':
    default:
      return demo;
  }
}

module.exports = { getPaymentProvider };
