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

const app = express();
const PORT = process.env.PORT || 4000;

// -----------------------------------------------------------------------------
// Core middleware
// -----------------------------------------------------------------------------

// Security headers.
app.use(helmet());

// CORS — only the known storefront/admin origins may call the API.
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  process.env.ADMIN_ORIGIN || 'http://localhost:3001',
];
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server (no Origin header) and known origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS policy'));
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
  express.raw({ type: '*/*' }),
  (req, res) => {
    // Signature verification against PAYMENT_WEBHOOK_SECRET happens here; the
    // verified event then flips the matching order to 'paid' using the Supabase
    // service role (bypassing RLS). Wired in a later increment.
    //
    // Returning 200 quickly acknowledges receipt so the provider stops retrying.
    res.status(200).json({ received: true });
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
 * Newsletter subscription — rate limited (Resend double opt-in email).
 * Body: { email: "...", locale: "fr" | "en" }
 */
app.post('/api/newsletter', sensitiveLimiter, (req, res) => {
  const { email } = req.body || {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof email !== 'string' || !emailPattern.test(email)) {
    return res.status(400).json({
      error: 'INVALID_EMAIL',
      message: 'A valid email address is required.',
    });
  }

  // Persist to public.newsletter_subscribers and send the confirmation email via
  // Resend (implemented in a later increment). Acknowledge optimistically.
  return res.status(202).json({ status: 'pending_confirmation' });
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
