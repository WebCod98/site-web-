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
| `POST` | `/api/invoices` | Generates a sleek **B&W PDF invoice** (streams `application/pdf`). |
| `POST` | `/api/newsletter` | Resend double opt-in. **Rate limited.** |
| `POST` | `/api/contact` | House inbox via Resend. **Rate limited.** |
| `POST` | `/webhooks/payment` | Raw-body signature verification → order `paid`. |

## Modules

| File | Responsibility |
| --- | --- |
| `src/index.js` | Composition root — middleware, limiters, routes. |
| `src/shipping.js` | Dynamic logistics (national vs. international quote). |
| `src/invoice.js` | Monochrome A4 PDF invoice generation (PDFKit, no network). |
| `src/lib/supabase.js` | Lazy **service-role** Supabase client (bypasses RLS). |
| `src/lib/mailer.js` | Lazy Resend client + `sendEmail` helper. |

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
