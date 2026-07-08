-- =============================================================================
-- SCULPT'AURA — PostgreSQL schema (Supabase)
-- -----------------------------------------------------------------------------
-- Native currency: CFA Franc (XAF), stored as integer amounts (no minor unit).
-- Market: Cameroon (national) + International.
--
-- This script is idempotent where practical and is meant to be run against a
-- fresh Supabase project. It creates the core commerce tables, the logistics
-- shipping zones, the verified-reviews mechanism (ratings restricted to buyers
-- whose order reached the 'paid' status), and the Row Level Security policies
-- that keep customer data private while exposing the public catalogue.
-- =============================================================================

-- Supabase ships these, but declare defensively for local Postgres runs.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'pending',    -- created, awaiting payment
      'paid',       -- payment confirmed (unlocks the right to review)
      'shipped',    -- handed to the carrier
      'delivered',  -- received by the customer
      'cancelled',  -- cancelled before shipping
      'refunded'    -- payment reversed
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'shipping_scope') then
    create type shipping_scope as enum ('national', 'international');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- PROFILES
-- Mirrors auth.users with the storefront-facing customer fields. A row is
-- created automatically by the handle_new_user() trigger below.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  phone        text,
  -- Preferred locale drives transactional email language (fr = default market).
  locale       text not null default 'fr' check (locale in ('fr', 'en')),
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- PRODUCTS
-- Bilingual fields are stored as jsonb ({"fr": "...", "en": "..."}) so the
-- storefront can render either locale without a join.
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  name         jsonb not null,        -- { "fr": "...", "en": "..." }
  category     jsonb not null,
  description  jsonb not null,
  -- Native price in XAF as an integer amount (the CURRENT selling price).
  price_xaf    integer not null check (price_xaf >= 0),
  -- Optional "was" price. When set and higher than price_xaf, the product is on
  -- sale: the storefront strikes it through and shows the discount badge.
  compare_at_xaf integer check (compare_at_xaf >= 0),
  image_url    text,
  tag          jsonb,                 -- optional editorial tag, bilingual
  stock        integer not null default 0 check (stock >= 0),
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_published_idx
  on public.products (is_published);

-- -----------------------------------------------------------------------------
-- SHIPPING ZONES
-- Powers the dynamic logistics fee at checkout: a base fee per scope, plus an
-- optional free-shipping threshold. The national row targets Cameroon.
-- -----------------------------------------------------------------------------
create table if not exists public.shipping_zones (
  id                 uuid primary key default uuid_generate_v4(),
  scope              shipping_scope not null,
  -- ISO 3166-1 alpha-2, or NULL for the catch-all international zone.
  country_code       text,
  label              jsonb not null,           -- bilingual display label
  base_fee_xaf       integer not null check (base_fee_xaf >= 0),
  -- Orders at/above this subtotal ship free; NULL disables the threshold.
  free_over_xaf      integer check (free_over_xaf >= 0),
  estimated_days_min integer not null default 2,
  estimated_days_max integer not null default 7,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- Seed the two canonical zones: Cameroon national + international catch-all.
insert into public.shipping_zones
  (scope, country_code, label, base_fee_xaf, free_over_xaf, estimated_days_min, estimated_days_max)
values
  ('national', 'CM',
    '{"fr": "Cameroun", "en": "Cameroon"}'::jsonb,
    2000, 75000, 1, 3),
  ('international', null,
    '{"fr": "International", "en": "International"}'::jsonb,
    25000, null, 5, 14)
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- ORDERS
-- The reference used by the verified-reviews gate is `status = 'paid'`.
-- Delivery coordinates (lat/lng) are captured via the Leaflet map at checkout.
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  status           order_status not null default 'pending',
  -- Monetary breakdown, all in XAF integers.
  subtotal_xaf     integer not null default 0 check (subtotal_xaf >= 0),
  shipping_xaf     integer not null default 0 check (shipping_xaf >= 0),
  total_xaf        integer not null default 0 check (total_xaf >= 0),
  shipping_scope   shipping_scope not null default 'national',
  -- Delivery address + Leaflet-captured coordinates.
  country_code     text,
  city             text,
  address_line     text,
  delivery_lat     double precision,
  delivery_lng     double precision,
  -- Payment reference from the provider webhook (set by the backend).
  payment_ref      text,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

-- -----------------------------------------------------------------------------
-- ORDER ITEMS
-- Line items snapshot the price at purchase time (prices may change later).
-- -----------------------------------------------------------------------------
create table if not exists public.order_items (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     uuid not null references public.products (id),
  quantity       integer not null check (quantity > 0),
  unit_price_xaf integer not null check (unit_price_xaf >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- -----------------------------------------------------------------------------
-- REVIEWS
-- Verified reviews: a customer may only rate a product they have actually paid
-- for. The rule is enforced twice — by RLS on INSERT and by a BEFORE trigger —
-- so it holds regardless of the client used.
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  is_approved boolean not null default true,
  created_at  timestamptz not null default now(),
  -- One review per product per customer.
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx on public.reviews (product_id);

-- Returns true when the given user has a paid order containing the product.
create or replace function public.has_paid_for_product(p_user uuid, p_product uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.user_id = p_user
      and oi.product_id = p_product
      and o.status = 'paid'
  );
$$;

-- Guard trigger — blocks reviews from non-buyers even if RLS is bypassed.
create or replace function public.enforce_verified_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_paid_for_product(new.user_id, new.product_id) then
    raise exception
      'SCULPT_AURA_VERIFIED_REVIEW: user % has no paid purchase of product %',
      new.user_id, new.product_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_verified_review on public.reviews;
create trigger trg_enforce_verified_review
  before insert on public.reviews
  for each row execute function public.enforce_verified_review();

-- -----------------------------------------------------------------------------
-- NEWSLETTER
-- Populated by the rate-limited backend route (Resend double opt-in).
-- -----------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  locale        text not null default 'fr' check (locale in ('fr', 'en')),
  confirmed     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles              enable row level security;
alter table public.products              enable row level security;
alter table public.shipping_zones        enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.reviews               enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Convenience predicate: is the current session an admin profile?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- --- PROFILES ---------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- --- PRODUCTS ---------------------------------------------------------------
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_published or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- --- SHIPPING ZONES ---------------------------------------------------------
drop policy if exists "shipping_public_read" on public.shipping_zones;
create policy "shipping_public_read" on public.shipping_zones
  for select using (is_active or public.is_admin());

drop policy if exists "shipping_admin_write" on public.shipping_zones;
create policy "shipping_admin_write" on public.shipping_zones
  for all using (public.is_admin()) with check (public.is_admin());

-- --- ORDERS -----------------------------------------------------------------
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

-- Status transitions (e.g. -> paid, -> shipped) are performed by the backend
-- via the service role, or by an admin. Customers never mutate their orders.
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- --- ORDER ITEMS ------------------------------------------------------------
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- --- REVIEWS ----------------------------------------------------------------
-- Public can read approved reviews; buyers can write for products they paid for.
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (is_approved or public.is_admin());

drop policy if exists "reviews_insert_verified" on public.reviews;
create policy "reviews_insert_verified" on public.reviews
  for insert with check (
    auth.uid() = user_id
    and public.has_paid_for_product(auth.uid(), product_id)
  );

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- --- NEWSLETTER -------------------------------------------------------------
-- Only the backend (service role) or admins read/write subscribers.
drop policy if exists "newsletter_admin_all" on public.newsletter_subscribers;
create policy "newsletter_admin_all" on public.newsletter_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- TRIGGERS — housekeeping
-- =============================================================================

-- Auto-provision a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'locale', 'fr')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh on mutation for the tables that expose it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_profiles on public.profiles;
create trigger trg_touch_profiles before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_products on public.products;
create trigger trg_touch_products before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_orders on public.orders;
create trigger trg_touch_orders before update on public.orders
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- SITE CONTENT (editable pages: FAQ, About, Terms, Returns)
-- -----------------------------------------------------------------------------
-- Each editable page is one row keyed by a stable slug. Content is stored as
-- bilingual jsonb so the admin can edit FR/EN without code:
--   - text pages ('about','terms','returns','contact'): { "title", "body" }
--   - 'faq': { "items": [ { "q", "a" }, ... ] }
-- Public reads are open; only admins may write (same predicate as products).
-- The storefront ships sensible defaults in code, so pages render even when a
-- row is absent (demo mode).
-- =============================================================================
create table if not exists public.site_content (
  key        text primary key,
  fr         jsonb not null default '{}',
  en         jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content
  for select using (true);

drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_touch_site_content on public.site_content;
create trigger trg_touch_site_content before update on public.site_content
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- PROMOTIONS & DISCOUNTS
-- -----------------------------------------------------------------------------
-- (A) Per-product sale: products.compare_at_xaf (added above). These ALTERs let
--     an already-created database gain the new columns safely.
-- (B) Promo codes: a codes table + order columns capturing the applied code and
--     discount. Codes are validated/applied server-side (backend service role);
--     they are NOT publicly readable so the full list stays private.
-- =============================================================================

-- Idempotent column adds for existing databases.
alter table public.products add column if not exists compare_at_xaf integer;
alter table public.orders   add column if not exists promo_code text;
alter table public.orders   add column if not exists discount_xaf integer not null default 0;

-- Promo code kind: percentage off, or a fixed XAF amount off.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'promo_kind') then
    create type promo_kind as enum ('percent', 'fixed');
  end if;
end
$$;

create table if not exists public.promo_codes (
  id                 uuid primary key default uuid_generate_v4(),
  -- Stored uppercase; what the customer types at checkout (e.g. "AWA15").
  code               text unique not null,
  kind               promo_kind not null default 'percent',
  -- percent: 1..100 ; fixed: an XAF amount.
  value              integer not null check (value >= 0),
  -- Optional partner/influencer label + commission for payout tracking.
  label              text,
  commission_percent integer check (commission_percent between 0 and 100),
  -- Optional cap on total uses (NULL = unlimited).
  max_uses           integer check (max_uses >= 0),
  usage_count        integer not null default 0,
  -- Running total of sales (order totals) generated by this code, in XAF.
  total_sales_xaf    integer not null default 0,
  is_active          boolean not null default true,
  starts_at          timestamptz,
  ends_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists promo_codes_code_idx on public.promo_codes (code);

alter table public.promo_codes enable row level security;

-- Only admins (and the service role, which bypasses RLS) touch promo codes.
drop policy if exists "promo_codes_admin_all" on public.promo_codes;
create policy "promo_codes_admin_all" on public.promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- End of schema.
-- =============================================================================
