/**
 * SCULPT'AURA — transactional email (Resend).
 *
 * Thin wrapper around the Resend SDK for the house's transactional messages
 * (order confirmations, newsletter double opt-in, contact relays). Sensitive
 * routes that call these are rate-limited upstream so the Resend quota is never
 * exhausted (see the limiters in src/index.js).
 *
 * The client is created lazily; when RESEND_API_KEY is absent the helpers log
 * and no-op so local development works without email credentials.
 */

'use strict';

const { Resend } = require('resend');

const FROM = "SCULPT'AURA <no-reply@sculptaura.com>";

let cachedClient = null;

/** Return a memoised Resend client, or null when not configured. */
function getResend() {
  if (cachedClient) return cachedClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cachedClient = new Resend(key);
  return cachedClient;
}

/**
 * Send a transactional email.
 * @param {{ to: string, subject: string, html: string, attachments?: Array<{filename:string, content:Buffer}> }} message
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
async function sendEmail(message) {
  const client = getResend();
  if (!client) {
    // Degrade gracefully in dev — surface intent without failing the request.
    // eslint-disable-next-line no-console
    console.warn(`[mailer] RESEND_API_KEY missing — skipped email to ${message.to}`);
    return { sent: false, reason: 'not_configured' };
  }

  await client.emails.send({
    from: FROM,
    to: message.to,
    subject: message.subject,
    html: message.html,
    attachments: message.attachments,
  });

  return { sent: true };
}

module.exports = { sendEmail, FROM };
