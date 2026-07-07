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

## Status

Workspace reserved and documented. The application is scaffolded in a dedicated
increment so it can be reviewed independently of the storefront.
