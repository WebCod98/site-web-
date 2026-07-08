/**
 * SCULPT'AURA — order emails.
 *
 * Builds and sends the order confirmation: a restrained, on-charter HTML email
 * with the generated B&W PDF invoice attached. Uses the lazy Resend mailer, so
 * when RESEND_API_KEY is absent it logs and no-ops (demo mode) without failing
 * the surrounding request.
 */

'use strict';

const { generateInvoice, formatXAF } = require('./invoice');
const { sendEmail } = require('./lib/mailer');

/** Map an order (memory or Supabase shape) to the invoice generator input. */
function toInvoiceData(order) {
  // Support both the in-memory shape (camelCase) and Supabase rows (snake_case).
  const subtotalXAF = order.subtotalXAF ?? order.subtotal_xaf ?? 0;
  const shippingXAF = order.shippingXAF ?? order.shipping_xaf ?? 0;
  const discountXAF = order.discountXAF ?? order.discount_xaf ?? 0;
  const promoCode = order.promoCode ?? order.promo_code ?? null;
  const totalXAF = order.totalXAF ?? order.total_xaf ?? 0;
  const reference = order.reference ?? String(order.id).slice(0, 8).toUpperCase();

  return {
    reference,
    date: new Date().toISOString().slice(0, 10),
    customer: {
      name: order.customer?.name || 'Client',
      email: order.customer?.email || '',
      address: order.customer?.address || order.address_line || '',
      city: order.customer?.city || order.city || '',
      country: order.customer?.country || order.countryCode || order.country_code || '',
    },
    items: (order.items || []).map((it) => ({
      name: it.name,
      quantity: Number(it.quantity),
      unitPriceXAF: Number(it.unitPriceXAF ?? it.unit_price_xaf),
    })),
    subtotalXAF,
    shippingXAF,
    discountXAF,
    promoCode,
    totalXAF,
  };
}

/** Minimal, on-charter confirmation HTML. */
function confirmationHtml(data) {
  const rows = data.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;font-family:Georgia,serif;color:#171717;">${it.name}</td>
        <td style="padding:8px 0;text-align:right;color:#171717;">×${it.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#171717;">${formatXAF(
          it.unitPriceXAF * it.quantity,
        )}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
  <html lang="fr"><body style="margin:0;background:#ffffff;padding:40px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr><td style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#171717;padding-bottom:4px;">SCULPT'AURA</td></tr>
          <tr><td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;padding-bottom:28px;">Confirmation de commande</td></tr>
          <tr><td style="font-family:Georgia,serif;font-size:22px;color:#171717;padding-bottom:8px;">Merci, ${data.customer.name}.</td></tr>
          <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;line-height:1.6;padding-bottom:24px;">
            Votre commande <strong style="color:#171717;">${data.reference}</strong> est confirmée. Votre facture est jointe à cet e-mail au format PDF.
          </td></tr>
          <tr><td style="border-top:1px solid #e5e5e5;padding-top:16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;">
              ${rows}
              <tr><td colspan="3" style="border-top:1px solid #e5e5e5;padding-top:12px;"></td></tr>
              <tr>
                <td style="padding:4px 0;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;font-size:10px;">Total</td>
                <td></td>
                <td style="padding:4px 0;text-align:right;font-family:Georgia,serif;font-style:italic;font-size:18px;color:#171717;">${formatXAF(
                  data.totalXAF,
                )}</td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;letter-spacing:1px;text-align:center;padding-top:36px;border-top:1px solid #e5e5e5;">
            SCULPT'AURA — Douala, Cameroun · XAF
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

/**
 * Generate the invoice and send the confirmation email.
 * @param {object} order
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
async function sendOrderConfirmation(order) {
  const data = toInvoiceData(order);
  if (!data.customer.email) {
    return { sent: false, reason: 'no_email' };
  }

  const pdf = await generateInvoice(data);

  return sendEmail({
    to: data.customer.email,
    subject: `Votre commande ${data.reference} — SCULPT'AURA`,
    html: confirmationHtml(data),
    attachments: [{ filename: `facture-${data.reference}.pdf`, content: pdf }],
  });
}

module.exports = { sendOrderConfirmation, toInvoiceData };
