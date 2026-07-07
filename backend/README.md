# SCULPT'AURA — Backend (Node.js / Express)

REST API for server-only concerns: payment webhooks, dynamic shipping quotes,
rate-limited transactional routes, and (upcoming) B&W PDF invoice generation.

## Run

```bash
cp .env.example .env      # fill in the values
npm install
npm run dev               # http://localhost:4000
```

## Routes

| Method | Path | Notes |
| --- | --- | --- |
| `GET`  | `/health` | Liveness probe. |
| `POST` | `/api/shipping/quote` | Dynamic fee by country + subtotal (XAF). |
| `POST` | `/api/orders` | Create a pending order (server recomputes totals). |
| `POST` | `/api/payments/init` | Start payment → returns a redirect URL. |
| `GET`  | `/api/payments/demo/checkout` | **Demo** payment page (no account needed). |
| `POST` | `/api/payments/demo/confirm` | **Demo** confirm → paid → invoice email. |
| `POST` | `/api/invoices` | Generates a sleek **B&W PDF invoice** (`application/pdf`). |
| `POST` | `/api/newsletter` | Persists + Resend double opt-in. **Rate limited.** |
| `POST` | `/api/contact` | House inbox via Resend. **Rate limited.** |
| `POST` | `/webhooks/payment` | Provider-verified notification → order `paid` + email. |

## Modules

| File | Responsibility |
| --- | --- |
| `src/index.js` | Composition root — middleware, limiters, routes. |
| `src/shipping.js` | Dynamic logistics (national vs. international quote). |
| `src/orders.js` | Order store — Supabase when configured, in-memory otherwise. |
| `src/payments/` | Provider abstraction: `demo` (simulator) + `cinetpay`. |
| `src/email.js` | Order confirmation email + attached PDF invoice. |
| `src/invoice.js` | Monochrome A4 PDF invoice generation (PDFKit, no network). |
| `src/lib/supabase.js` | Lazy **service-role** Supabase client (bypasses RLS). |
| `src/lib/mailer.js` | Lazy Resend client + `sendEmail` helper. |

## Payment providers

Selected via `PAYMENT_PROVIDER`: `demo` (default, no account — a self-hosted
checkout page that simulates payment) or `cinetpay` (Mobile Money / cards for
Cameroon; requires `CINETPAY_API_KEY` + `CINETPAY_SITE_ID`). Adding another
gateway is a new file in `src/payments/` exposing `initPayment()` and
`verifyWebhook()`. See [`../SETUP.md`](../SETUP.md).

Both `lib/*` clients are created lazily and no-op when their env vars are
absent, so `GET /health`, shipping quotes and invoices work with zero secrets.

## Security

- **Helmet** sets hardened HTTP headers.
- **CORS** is restricted to the storefront and admin origins.
- **Rate limiting** (`express-rate-limit`) guards auth/contact/newsletter to
  protect the Resend email quota (5 requests / 15 min / IP on sensitive routes).
- The payment webhook reads the **raw** body (mounted before `express.json`) so
  the provider signature can be verified before any state change.
- Order status transitions use the Supabase **service role** — never the client.
