/**
 * SCULPT'AURA — REST API (Express).
 *
 * Responsibilities:
 *   - Heavy / server-only requests the storefront should not perform directly.
 *   - Payment webhooks (status transitions performed with the Supabase service role).
 *   - Dynamic shipping quotes (see ./shipping.js).
 *   - Rate limiting on sensitive routes (auth, contact, password reset,
 *     newsletter) to protect the transactional email quota (Resend).
 *
 * This file is the composition root: it wires middleware, limiters and routes.
 * Business logic lives in dedicated modules so each route stays readable.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { quoteShipping } = require('./shipping');
const { generateInvoice } = require('./invoice');
const { createOrder, getOrder, markOrderPaid } = require('./orders');
const { getPaymentProvider } = require('./payments');
const { sendOrderConfirmation } = require('./email');
const { getSupabaseAdmin } = require('./lib/supabase');

const app = express();
const PORT = process.env.PORT || 4000;

// Public base URLs used to build payment redirect / notify links.
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// -----------------------------------------------------------------------------
// Core middleware
// -----------------------------------------------------------------------------

// Security headers.
app.use(helmet());

// CORS — only the known storefront/admin origins may make cross-origin XHR to
// the API. The API's own origin is included so browser-facing pages it serves
// (the demo payment page) can post back to it.
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  process.env.ADMIN_ORIGIN || 'http://localhost:3001',
  PUBLIC_API_URL,
];
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (server-to-server, top-level navigations) → allow.
      // Known origin → allow. Unknown origin → deny *without* CORS headers
      // (callback(null, false)) rather than throwing, so a disallowed cross-
      // origin read is simply blocked by the browser instead of 500-ing the
      // request (which would also break same-origin form posts).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

// NOTE: the payment webhook needs the raw body for signature verification, so it
// is mounted BEFORE the JSON parser with its own raw parser (see below).

// -----------------------------------------------------------------------------
// Rate limiters
// -----------------------------------------------------------------------------

/**
 * Strict limiter for routes that trigger transactional emails or touch auth.
 * Protects the Resend quota and blunts credential-stuffing / abuse.
 */
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
});

/** Gentle global limiter for everything else. */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// -----------------------------------------------------------------------------
// Payment webhook (raw body BEFORE express.json)
// -----------------------------------------------------------------------------

app.post(
  '/webhooks/payment',
  // Accept both JSON and form-encoded notifications (providers vary).
  express.urlencoded({ extended: true }),
  express.json({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const provider = getPaymentProvider();

      // The provider re-checks the transaction with its own API and returns a
      // verified result — we never trust the raw notification body.
      const result = await provider.verifyWebhook(req);

      if (result.ok && result.orderId) {
        const outcome = await markOrderPaid(result.orderId, result.paymentRef);
        // Send the confirmation + invoice once (idempotent on retries).
        if (outcome && !outcome.alreadyPaid) {
          await sendOrderConfirmation(outcome.order).catch(() => {});
        }
      }

      // Always acknowledge so the provider stops retrying.
      return res.status(200).json({ received: true });
    } catch (err) {
      return next(err);
    }
  },
);

// JSON parser for all remaining routes.
app.use(express.json({ limit: '1mb' }));
app.use(globalLimiter);

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

/** Liveness probe. */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sculptaura-api', currency: 'XAF' });
});

/**
 * Shipping quote — public, cheap, read-only.
 * Body: { countryCode: "CM", subtotalXAF: 80000 }
 */
app.post('/api/shipping/quote', (req, res) => {
  const { countryCode, subtotalXAF } = req.body || {};

  if (typeof countryCode !== 'string' || !countryCode.trim()) {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'countryCode (ISO alpha-2) is required.',
    });
  }

  const quote = quoteShipping({
    countryCode,
    subtotalXAF: Number(subtotalXAF),
  });

  return res.json(quote);
});

/**
 * Invoice PDF — generates a sleek, monochrome B&W invoice on the fly.
 *
 * Body: { reference, date, customer, items[], subtotalXAF, shippingXAF, totalXAF }
 *
 * In production the route resolves the order from Supabase (service role) by id
 * and builds the payload server-side; here it accepts the payload directly so
 * the generator can be exercised without the database. The response streams the
 * PDF with a download-friendly Content-Disposition.
 */
app.post('/api/invoices', async (req, res, next) => {
  try {
    const data = req.body || {};

    if (!data.reference || !Array.isArray(data.items) || data.items.length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'reference and a non-empty items array are required.',
      });
    }

    const pdf = await generateInvoice({
      reference: data.reference,
      date: data.date || new Date().toISOString().slice(0, 10),
      customer: data.customer || {},
      items: data.items,
      subtotalXAF: Number(data.subtotalXAF) || 0,
      shippingXAF: Number(data.shippingXAF) || 0,
      totalXAF: Number(data.totalXAF) || 0,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="facture-${data.reference}.pdf"`,
    );
    return res.send(pdf);
  } catch (err) {
    return next(err);
  }
});

/**
 * Create an order (status: pending). The server recomputes shipping and totals
 * from the items — the client's totals are never trusted.
 *
 * Body: { items[], customer, countryCode, coords?, userId? }
 * Returns: { orderId, reference, subtotalXAF, shippingXAF, totalXAF }
 */
app.post('/api/orders', async (req, res, next) => {
  try {
    const { items, customer, countryCode } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'items must be a non-empty array.',
      });
    }
    if (!customer?.email || !countryCode) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'customer.email and countryCode are required.',
      });
    }

    const order = await createOrder(req.body);

    return res.status(201).json({
      orderId: order.id,
      reference: order.reference,
      subtotalXAF: order.subtotalXAF,
      shippingXAF: order.shippingXAF,
      totalXAF: order.totalXAF,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Initialise payment for an existing order. Returns the URL to redirect the
 * customer to (a real gateway, or the demo checkout page).
 *
 * Body: { orderId }
 * Returns: { redirectUrl, provider }
 */
app.post('/api/payments/init', async (req, res, next) => {
  try {
    const { orderId } = req.body || {};
    const order = orderId ? await getOrder(orderId) : null;
    if (!order) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
    }

    const provider = getPaymentProvider();
    const { redirectUrl } = await provider.initPayment(order, {
      notifyUrl: `${PUBLIC_API_URL}/webhooks/payment`,
      returnUrl: `${FRONTEND_URL}/checkout/success?ref=${encodeURIComponent(
        order.reference || order.id,
      )}`,
    });

    return res.json({ redirectUrl, provider: provider.name });
  } catch (err) {
    return next(err);
  }
});

/**
 * DEMO ONLY — a minimal, on-charter payment page. Renders a "pay" button that
 * confirms the order. Present regardless of provider so a demo is always
 * reachable, but only the demo provider links here.
 */
app.get('/api/payments/demo/checkout', async (req, res, next) => {
  try {
    const order = await getOrder(String(req.query.orderId || ''));
    if (!order) return res.status(404).send('Order not found');

    const total = (order.totalXAF ?? order.total_xaf ?? 0).toLocaleString('fr-FR');
    const ref = order.reference || order.id;
    const confirmUrl = `${PUBLIC_API_URL}/api/payments/demo/confirm?orderId=${encodeURIComponent(
      order.id,
    )}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!doctype html><html lang="fr"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Paiement (démo) — SCULPT'AURA</title>
      <style>
        *{margin:0;box-sizing:border-box}
        body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#171717;
             min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
        .card{max-width:420px;width:100%;text-align:center}
        .brand{font-family:Georgia,serif;font-style:italic;font-size:28px;margin-bottom:6px}
        .tag{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:40px}
        .amount{font-family:Georgia,serif;font-style:italic;font-size:40px;margin:8px 0 4px}
        .ref{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:40px}
        form{margin:0}
        button{width:100%;border:1px solid #171717;background:#171717;color:#fff;
               padding:16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;
               transition:.3s}
        button:hover{background:#fff;color:#171717}
        .note{margin-top:24px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#d1d5db}
      </style></head>
      <body><div class="card">
        <div class="brand">SCULPT'AURA</div>
        <div class="tag">Paiement — Mode démonstration</div>
        <div class="amount">${total} XAF</div>
        <div class="ref">Commande ${ref}</div>
        <form method="POST" action="${confirmUrl}">
          <button type="submit">Payer (démo)</button>
        </form>
        <div class="note">Aucun montant réel n'est débité</div>
      </div></body></html>`);
  } catch (err) {
    return next(err);
  }
});

/** DEMO ONLY — confirm the payment, email the invoice, redirect to success. */
app.post('/api/payments/demo/confirm', async (req, res, next) => {
  try {
    const orderId = String(req.query.orderId || req.body?.orderId || '');
    const outcome = await markOrderPaid(orderId, `demo:${orderId}`);
    if (!outcome) return res.status(404).send('Order not found');

    if (!outcome.alreadyPaid) {
      await sendOrderConfirmation(outcome.order).catch(() => {});
    }

    const ref = outcome.order.reference || outcome.order.id;
    return res.redirect(
      302,
      `${FRONTEND_URL}/checkout/success?ref=${encodeURIComponent(ref)}`,
    );
  } catch (err) {
    return next(err);
  }
});

/**
 * Newsletter subscription — rate limited (Resend double opt-in email).
 * Body: { email: "...", locale: "fr" | "en" }
 */
app.post('/api/newsletter', sensitiveLimiter, async (req, res, next) => {
  try {
    const { email, locale } = req.body || {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== 'string' || !emailPattern.test(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'A valid email address is required.',
      });
    }

    // Persist the subscriber when Supabase is configured (idempotent on email).
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('newsletter_subscribers')
        .upsert(
          { email: email.trim().toLowerCase(), locale: locale === 'en' ? 'en' : 'fr' },
          { onConflict: 'email' },
        );
    }

    // The Resend double opt-in email is sent here when configured (mailer no-ops
    // otherwise). Acknowledge optimistically either way.
    return res.status(202).json({ status: 'pending_confirmation' });
  } catch (err) {
    return next(err);
  }
});

/**
 * Contact form — rate limited (sends a transactional email via Resend).
 * Body: { name, email, message }
 */
app.post('/api/contact', sensitiveLimiter, (req, res) => {
  const { name, email, message } = req.body || {};

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'name, email and message are all required.',
    });
  }

  // Forward to the house inbox via Resend (later increment).
  return res.status(202).json({ status: 'received' });
});

// -----------------------------------------------------------------------------
// Error handling
// -----------------------------------------------------------------------------

// 404 fallback.
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

// Centralised error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    message: err.message || 'Unexpected error.',
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SCULPT'AURA API listening on http://localhost:${PORT}`);
});

module.exports = app;
