<div align="center">

# SCULPT&rsquo;AURA

_**L&rsquo;art de sculpter la lumière sur la peau.**_

Prestige, Black &amp; White editorial e-commerce for high-end cosmetics.
Native market: **Cameroon** &middot; International shipping enabled &middot; Native currency: **CFA Franc (XAF)**.

`Next.js 14 (App Router)` &nbsp;·&nbsp; `Tailwind CSS` &nbsp;·&nbsp; `Node.js / Express` &nbsp;·&nbsp; `Supabase (PostgreSQL)` &nbsp;·&nbsp; `Leaflet.js`

</div>

---

## Table of Contents

1. [Overview](#1--overview)
2. [Design System — Haute Couture Editorial (B&W)](#2--design-system--haute-couture-editorial-bw)
3. [Monorepo Architecture](#3--monorepo-architecture)
4. [Tech Stack](#4--tech-stack)
5. [Getting Started](#5--getting-started)
6. [Environment Variables](#6--environment-variables)
7. [The Storefront (`frontend/`)](#7--the-storefront-frontend)
8. [The Admin PWA (`admin/`)](#8--the-admin-pwa-admin)
9. [The API (`backend/`)](#9--the-api-backend)
10. [The Database (`supabase/`)](#10--the-database-supabase)
11. [Feature Deep-Dives](#11--feature-deep-dives)
12. [Currency &amp; Internationalisation](#12--currency--internationalisation)
13. [Security](#13--security)
14. [Scripts Reference](#14--scripts-reference)
15. [Roadmap &amp; Status](#15--roadmap--status)
16. [Deployment Notes](#16--deployment-notes)

---

## 1 · Overview

SCULPT&rsquo;AURA is a prestige cosmetics house selling online to the Cameroonian
national market and internationally. The platform is built as a **monorepo** of
four workspaces — a public storefront, an isolated admin PWA, a REST API, and a
PostgreSQL database — all sharing a single, uncompromising **Black & White
"Haute Couture" editorial** identity.

Everything you see is monochrome by design: identity is carried by **typography,
whitespace and hairline rules**, never by colour.

---

## 2 · Design System — Haute Couture Editorial (B&W)

The charter is applied to **every** component, without deviation.

| Token | Rule |
| --- | --- |
| **Colours** | Pure White (`bg-white`), Deep Black (`bg-black` / `bg-neutral-900`). Light greys **only** for lines & dividers (`border-neutral-100/200`). No structural colour is tolerated. |
| **Titles / Quotes** | **Cormorant Garamond**, italic serif. |
| **Buttons / Menus / Labels / Metadata** | Sans-serif (**Jost**), `uppercase tracking-[0.2em]` → `tracking-[0.25em]`. |
| **Spacing** | Airy, "fashion magazine" rhythm — generous margins/padding (`py-12`, `px-8`, `space-y-8`) so products breathe. |
| **Forms** | **No** boxed inputs or grey blocks. Fields are thin bottom lines (`border-b border-neutral-200 focus-within:border-black`) that animate on focus. |

### How it's implemented

- **Fonts** are loaded once via `next/font/google` and exposed as CSS variables
  (`--font-cormorant`, `--font-jost`), then bound to Tailwind's `font-serif` /
  `font-sans` tokens in each app's `tailwind.config.ts`.
- **Reusable primitives** live in `globals.css` under `@layer components`:
  `.label-editorial`, `.btn-editorial`, `.field-editorial`, `.container-editorial`,
  `.card-editorial` (admin), `.pill` (admin).
- **Product & lifestyle imagery** is rendered `grayscale` and reveals to colour
  only on hover, keeping listings monochrome at rest.

---

## 3 · Monorepo Architecture

```
sculptaura/
├── frontend/                  Public Next.js 14 storefront (SSR/ISR, SEO)
│   ├── app/
│   │   ├── layout.tsx         Root layout — fonts, providers, shared chrome
│   │   ├── page.tsx           Homepage (editorial narrative)
│   │   ├── globals.css        Charter base layer + component primitives
│   │   ├── robots.ts          SEO robots directives
│   │   ├── sitemap.ts         SEO sitemap (homepage + products)
│   │   ├── collection/        /collection — full catalogue grid
│   │   ├── products/[slug]/   /products/:slug — detail + verified reviews (SSG)
│   │   ├── checkout/          /checkout — form + Leaflet map + live totals
│   │   ├── login/             /login  (charter auth form)
│   │   └── register/          /register
│   ├── components/            Header, Footer, Hero, ProductCard, CartDrawer,
│   │                          LanguageToggle, DeliveryMap (Leaflet), …
│   └── lib/                   i18n, currency (XAF), products, reviews,
│                              shipping, api client
│
├── admin/                     Isolated Super-Admin PWA (installable)
│   ├── app/
│   │   ├── (dashboard)/       Sidebar-framed console (/, orders, products, reviews)
│   │   └── (auth)/login/      Sign-in (no sidebar)
│   ├── components/            Sidebar, StatusPill, LogisticsMap, PwaRegister
│   ├── lib/data.ts            Dashboard data + KPIs (mock → Supabase)
│   └── public/                manifest.webmanifest, sw.js, icons/
│
├── backend/                   Node.js / Express REST API
│   └── src/
│       ├── index.js           Composition root (middleware, limiters, routes)
│       ├── shipping.js        Dynamic logistics (national vs. international)
│       ├── invoice.js         B&W PDF invoice generator (PDFKit)
│       └── lib/               supabase.js (service role), mailer.js (Resend)
│
├── supabase/                  PostgreSQL
│   ├── schema.sql             Tables, enums, functions, triggers, RLS
│   └── seed.sql               Demo catalogue
│
├── package.json               npm workspaces root
└── README.md                  You are here
```

---

## 4 · Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Storefront & Admin | **Next.js 14** (App Router), **React 18**, **TypeScript** | SSR/ISR for SEO, server components, file-based routing. |
| Styling | **Tailwind CSS 3** | Utility-first, native to the charter (no custom CSS drift). |
| Fonts | **Cormorant Garamond** + **Jost** (`next/font`) | The editorial voice, self-hosted & optimised. |
| Maps | **Leaflet.js** + **react-leaflet** | Open-source, no API key; delivery capture + logistics. |
| API | **Express 4**, **Helmet**, **express-rate-limit**, **CORS** | Small, explicit, webhook-friendly. |
| PDF | **PDFKit** | Offline, deterministic, monochrome invoices. |
| Email | **Resend** | Transactional email (confirmations, opt-in). |
| Database | **Supabase** (PostgreSQL + Auth + RLS) | Row-Level-Security-first data model. |

---

## 5 · Getting Started

### Prerequisites

- **Node.js ≥ 18.17**
- **npm ≥ 9** (workspaces)

### Install (from the repo root)

```bash
npm install          # installs all workspaces
```

### Run each app

```bash
# Storefront  → http://localhost:3000
npm run dev:frontend

# Admin PWA   → http://localhost:3001
npm run dev:admin

# REST API    → http://localhost:4000
npm run dev:backend
```

> Copy each workspace's `.env.example` to `.env.local` (frontend/admin) or
> `.env` (backend) and fill in values before running against real services.
> The storefront, admin and API all boot **without** secrets for local UI work.

### Database

```bash
# Apply schema, then seed the demo catalogue
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

---

## 6 · Environment Variables

| Workspace | Variable | Purpose |
| --- | --- | --- |
| frontend | `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Public Supabase access (RLS-protected). |
| frontend | `NEXT_PUBLIC_API_URL` | Base URL of the Express backend. |
| frontend | `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO / sitemap. |
| admin | `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Admin reads (gated by `is_admin()` RLS). |
| admin | `NEXT_PUBLIC_API_URL` | Backend (invoices, heavy ops). |
| backend | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** privileged access (bypasses RLS). |
| backend | `RESEND_API_KEY` | Transactional email. |
| backend | `PAYMENT_WEBHOOK_SECRET` | Verifies payment webhooks. |
| backend | `FRONTEND_ORIGIN` / `ADMIN_ORIGIN` | CORS allow-list. |

> ⚠️ The **service role key** and `RESEND_API_KEY` are secrets — never expose
> them to the browser. Only `NEXT_PUBLIC_*` values are safe client-side.

---

## 7 · The Storefront (`frontend/`)

An SSR/ISR-optimised Next.js 14 storefront. Shared chrome (announcement marquee,
header, footer, cart drawer) lives in the root layout; each route owns its content.

### Routes

| Route | Rendering | Description |
| --- | --- | --- |
| `/` | Static | Editorial homepage: hero → manifesto → signature collection → ritual → values → newsletter. |
| `/collection` | Static | Full catalogue grid. |
| `/products/[slug]` | **SSG** (`generateStaticParams`) | Detail, gallery, quantity, **verified reviews**. |
| `/checkout` | Client | Delivery form + **Leaflet map** + live XAF totals with dynamic shipping. |
| `/login`, `/register` | Static | Charter auth forms. |
| `/robots.txt`, `/sitemap.xml` | Generated | SEO. |

### State & context

- **`LocaleProvider`** — reload-free FR/EN, persisted to `localStorage`, synced to `<html lang>`.
- **`CartProvider`** — cart lines, count, XAF subtotal, drawer open/close, persisted to `localStorage`.

### Notable components

`Header` (transparent→solid on scroll, mobile menu), `LanguageToggle` (sliding
capsule), `Hero` (slow-zoom backdrop), `ProductCard` (grayscale→colour on hover),
`CartDrawer` (slide-over), `DeliveryMap` (Leaflet, black CSS pin), `StarRating`
(fractional monochrome stars).

---

## 8 · The Admin PWA (`admin/`)

An **isolated**, installable Super-Admin console on its own origin (`:3001`),
sharing the storefront charter.

- **Route groups**: `(dashboard)` renders the fixed sidebar; `(auth)` (login)
  does not.
- **Dashboard** — KPI tiles (revenue, orders, pending, low-stock), recent orders,
  reassort watchlist.
- **Orders** — status filter + **Leaflet logistics map** plotting pending
  deliveries at their captured coordinates.
- **Products** — price / stock / publication management.
- **Reviews** — moderation of verified-buyer reviews (publish / hide).
- **PWA** — `manifest.webmanifest`, a hand-written `sw.js` (network-first
  navigations, cache-first assets, offline shell), and generated on-brand icons.

---

## 9 · The API (`backend/`)

A small, explicit Express API for server-only concerns.

| Method | Path | Notes |
| --- | --- | --- |
| `GET`  | `/health` | Liveness probe. |
| `POST` | `/api/shipping/quote` | Dynamic fee by country + subtotal (XAF). |
| `POST` | `/api/invoices` | Streams a **B&W PDF invoice** (`application/pdf`). |
| `POST` | `/api/newsletter` | Resend double opt-in. **Rate limited.** |
| `POST` | `/api/contact` | House inbox via Resend. **Rate limited.** |
| `POST` | `/webhooks/payment` | Raw-body signature verification → order `paid`. |

Hardened with **Helmet**, an origin-restricted **CORS** allow-list, and
**rate limiting** on sensitive routes. The payment webhook is mounted with a
**raw body parser before `express.json`** so provider signatures verify before
any state change.

---

## 10 · The Database (`supabase/`)

PostgreSQL with a Row-Level-Security-first model. See `schema.sql`.

| Table | Highlights |
| --- | --- |
| `profiles` | Mirrors `auth.users`; `is_admin`, `locale`; auto-provisioned by trigger. |
| `products` | Bilingual `jsonb` (`name/category/description/tag`); `price_xaf`, `stock`. |
| `shipping_zones` | Seeded **national (CM)** — free over 75 000 XAF — and **international**. |
| `orders` | Status enum, XAF breakdown, **Leaflet `delivery_lat/lng`**, `paid_at`. |
| `order_items` | Snapshots unit price at purchase time. |
| `reviews` | **Verified-purchase gate** (RLS policy **and** trigger); one per buyer/product. |
| `newsletter_subscribers` | Double opt-in, admin/service-role only. |

Helper functions: `has_paid_for_product()`, `is_admin()`, `handle_new_user()`,
`touch_updated_at()`. Every table has RLS enabled with explicit policies.

---

## 11 · Feature Deep-Dives

### Native Multilingual (FR / EN)
A sleek capsule toggle switches locale **without a page reload** — state lives in
`LocaleProvider`, is persisted, and drives every dictionary lookup. French is the
default (native market).

### Dynamic Logistics
Shipping is computed from **destination country + cart subtotal**. Cameroon is the
national zone (flat 2 000 XAF, **free over 75 000 XAF**); everything else is
international (25 000 XAF). The rule lives in three mirrored places: the seeded
`shipping_zones` rows, `backend/src/shipping.js` (authoritative), and
`frontend/lib/shipping.ts` (instant checkout preview).

### Leaflet Mapping
Open-source maps with **no API key**. Storefront: the customer drops a pin at
checkout to capture precise delivery coordinates. Admin: pending orders are
plotted on a logistics map. Markers use a black CSS `divIcon` to stay on-charter.

### Verified Reviews
Only customers with a **`paid`** order of a product may publish a review. This is
enforced **twice** server-side — an RLS `insert` policy **and** a `BEFORE INSERT`
trigger (`enforce_verified_review`) — so the guarantee holds regardless of client.

### Market Security
**Rate limiting** on `auth` / `contact` / `newsletter` / `reset` protects the
Resend email quota (5 req / 15 min / IP). **B&W PDF invoices** are generated
offline with PDFKit.

---

## 12 · Currency & Internationalisation

- **Native currency: XAF (CFA Franc).** Amounts are stored as **integers** (the
  franc has no retail minor unit) and formatted with `Intl.NumberFormat`
  (`fr-FR` / `en-US`) plus an explicit `XAF` suffix — see `frontend/lib/currency.ts`.
- **Locales: FR (default) / EN.** Product content is bilingual `jsonb` in the DB
  and typed `Record<'fr'|'en', string>` in the app.

---

## 13 · Security

- **RLS everywhere** — customers only ever see their own orders; the public reads
  published products & approved reviews; admins are gated by `is_admin()`.
- **Service role is server-only** — order status transitions (e.g. → `paid`) run
  in the backend on a verified webhook, never from a browser session.
- **Helmet + strict CORS** on the API.
- **Rate limiting** on sensitive routes.
- **Webhook signature verification** with a raw body parser.
- **Admin is a separate origin** and is never indexed (`X-Robots-Tag: noindex`).

---

## 14 · Scripts Reference

Run from the repo root:

| Script | Action |
| --- | --- |
| `npm run dev:frontend` | Storefront dev server (`:3000`). |
| `npm run dev:admin` | Admin dev server (`:3001`). |
| `npm run dev:backend` | API with `--watch` (`:4000`). |
| `npm run build:frontend` | Production build of the storefront. |
| `npm run build:admin` | Production build of the admin. |
| `npm run lint` | Lint the storefront. |

---

## 15 · Roadmap & Status

| Feature | Status |
| --- | --- |
| B&W editorial design system | ✅ Implemented |
| Storefront: home, collection, product, cart, checkout | ✅ Implemented |
| Reload-free FR/EN toggle | ✅ Implemented |
| Dynamic shipping (national/international) | ✅ Implemented (front + API + DB) |
| Leaflet delivery capture + admin tracking | ✅ Implemented |
| Verified reviews (paid-buyer gate) | ✅ Schema + UI (RLS + trigger) |
| Admin PWA (dashboard/orders/products/reviews) | ✅ Implemented + installable |
| B&W PDF invoices | ✅ Implemented (API route) |
| Rate limiting (Resend quota) | ✅ Implemented |
| Supabase schema + seed | ✅ Implemented |
| Live Supabase/Auth/Resend/payment wiring | ⏳ Next increment |

Data in the storefront and admin is currently **mock/typed** so the UI can be
built and reviewed independently of live services; the shapes already match the
SQL tables, so wiring is a drop-in.

---

## 16 · Deployment Notes

- **frontend** & **admin** → Vercel (each its own project/origin). Set the
  `NEXT_PUBLIC_*` env vars per project.
- **backend** → any Node host (Render, Railway, Fly, a container). Set the
  server-only secrets; point `FRONTEND_ORIGIN` / `ADMIN_ORIGIN` at the deployed
  storefront/admin for CORS.
- **database** → Supabase project; run `schema.sql` then `seed.sql`.

---

<div align="center">

_SCULPT&rsquo;AURA — Cosmétique de prestige, sculptée à la main._
**Douala · Cameroun · XAF**

</div>
