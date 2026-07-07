# SCULPT'AURA

> _Prestige B&W editorial e-commerce for high-end cosmetics._
> Native market: **Cameroon** — International shipping enabled. Native currency: **CFA Franc (XAF)**.

---

## Design System — Haute Couture Editorial (Black & White)

| Token | Rule |
| --- | --- |
| **Colors** | Pure White (`bg-white`), Deep Black (`bg-black` / `bg-neutral-900`). Light greys **only** for dividers (`border-neutral-100/200`). No structural color. |
| **Titles / Quotes** | Cormorant Garamond, italic serif. |
| **Buttons / Labels / Menus** | Sans-serif, `uppercase tracking-[0.2em]` → `tracking-[0.25em]`. |
| **Spacing** | Airy, fashion-magazine rhythm (`py-12`, `px-8`, `space-y-8`). |
| **Forms** | No boxed inputs. Thin bottom lines only: `border-b border-neutral-200 focus-within:border-black`, animated on focus. |

---

## Monorepo Architecture

```
sculptaura/
├── frontend/    Public Next.js 14+ (App Router, SSR/ISR, SEO) — the storefront
├── admin/       Isolated Next.js 14+ Super Admin, installable PWA
├── backend/     Node.js / Express REST API — heavy requests + payment webhooks
└── supabase/    PostgreSQL schemas, tables & Row Level Security policies
```

## Roadmap

- **Native Multilingual** — FR / EN capsule toggle, no page reload.
- **Dynamic Logistics** — shipping fees computed at checkout by country (Local Cameroon vs. International).
- **Leaflet.js Mapping** — delivery coordinate capture (front) + logistics tracking (admin).
- **Verified Reviews** — ratings/comments restricted to profiles with a `Paid` purchase.
- **Market Security** — rate limiting on auth/contact/reset (Resend quota protection) + B&W PDF invoices.

---

## Getting Started

```bash
# from the repo root
npm install

# run the public storefront
npm run dev:frontend      # http://localhost:3000
```

Each workspace carries its own `.env.example`. Copy it to `.env.local` and fill in values before running.
