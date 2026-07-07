# SCULPT'AURA — Admin (Isolated Super Admin PWA)

Reserved for the Super Admin. A separate Next.js 14+ application, deployed on
its own origin, and installable as a **Progressive Web App** (mobile & desktop).

> The admin shares the same B&W editorial charter as the storefront: pure white
> and deep black, italic serif titles, wide-tracked uppercase labels, and
> boxless bottom-line form fields.

## Scope

- Catalogue management (products, stock, bilingual FR/EN content).
- Order pipeline: `pending → paid → shipped → delivered`, with **Leaflet.js**
  logistics tracking for pending orders (delivery coordinates from checkout).
- Review moderation (verified-buyer ratings).
- Shipping-zone configuration (national vs. international fees).

## Isolation & security

- Runs on a **separate origin** from the public storefront.
- Access limited to profiles with `profiles.is_admin = true` (enforced by the
  Supabase RLS `is_admin()` predicate — see `../supabase/schema.sql`).

## PWA

- `manifest.webmanifest` + a service worker enable installation and offline
  shell caching for the dashboard.

## Run

```bash
cp .env.example .env.local
npm install          # from the repo root (workspaces)
npm run dev --workspace=admin   # http://localhost:3001
```

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Dashboard — KPI tiles, recent orders, low-stock watchlist. |
| `/orders` | Orders table + **Leaflet logistics map** of pending deliveries. |
| `/products` | Catalogue management (price, stock, publication state). |
| `/reviews` | Verified-review moderation (publish / hide). |
| `/login` | Super-admin sign-in (no sidebar, separate route group). |

## PWA

- `public/manifest.webmanifest` — standalone display, black theme, `SA` icons.
- `public/sw.js` — network-first navigations, cache-first assets, offline shell.
- `public/icons/` — 192, 512 and maskable-512 PNGs (generated, on-brand).
- Registered client-side by `components/PwaRegister.tsx` (production only).

## Status

Built and installable. Data is currently mocked in `lib/data.ts`; wiring to
Supabase (read with an admin session authorised by the `is_admin()` RLS
predicate) is the next increment.
