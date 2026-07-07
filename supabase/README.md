# SCULPT'AURA — Supabase (PostgreSQL)

Database layer for the storefront and admin. All amounts are stored in the
native currency, **XAF**, as integers.

## Contents

- `schema.sql` — tables, enums, functions, triggers, and Row Level Security.

## What the schema provides

| Concern | Implementation |
| --- | --- |
| **Bilingual content** | `products.name/category/description/tag` stored as `jsonb` `{ "fr", "en" }`. |
| **Dynamic logistics** | `shipping_zones` seeded with a Cameroon `national` zone (free over 75 000 XAF) and an `international` catch-all. |
| **Leaflet coordinates** | `orders.delivery_lat` / `delivery_lng` capture the map pin. |
| **Verified reviews** | Reviews require a `paid` order of that product — enforced by both an RLS policy **and** the `enforce_verified_review` trigger. |
| **Admin isolation** | `profiles.is_admin` + `is_admin()` predicate gate every write policy. |

## Applying the schema

```bash
# Using the Supabase CLI against a local stack
supabase db reset            # or:
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
```

The script is safe to re-run: enums are guarded, tables use `if not exists`,
and policies/triggers are dropped before recreation.

## Security note

Order status transitions (`pending → paid → shipped …`) are performed by the
**backend** using the Supabase **service role** (bypasses RLS) when it receives
a verified payment webhook — never by the customer's client session.
