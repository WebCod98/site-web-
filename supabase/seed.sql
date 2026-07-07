-- =============================================================================
-- SCULPT'AURA — seed data
-- -----------------------------------------------------------------------------
-- Demo catalogue mirroring the storefront mock (frontend/lib/products.ts).
-- Run AFTER schema.sql. Safe to re-run: rows upsert on the unique slug.
-- Prices are integer XAF. Bilingual fields are jsonb { "fr", "en" }.
-- =============================================================================

insert into public.products
  (slug, name, category, description, price_xaf, image_url, tag, stock, is_published)
values
  (
    'serum-lumiere-sculptante',
    '{"fr":"Sérum Lumière Sculptante","en":"Sculpting Light Serum"}',
    '{"fr":"Soin visage","en":"Face care"}',
    '{"fr":"Concentré liftant à l''acide hyaluronique fractionné.","en":"Lifting concentrate with fractionated hyaluronic acid."}',
    82000,
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    '{"fr":"Signature","en":"Signature"}',
    34,
    true
  ),
  (
    'creme-architecture-nuit',
    '{"fr":"Crème Architecture Nuit","en":"Night Architecture Cream"}',
    '{"fr":"Soin de nuit","en":"Night care"}',
    '{"fr":"Régénération nocturne aux peptides et huile de baobab.","en":"Overnight regeneration with peptides and baobab oil."}',
    96000,
    'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=1200&q=80',
    null,
    21,
    true
  ),
  (
    'huile-precieuse-aura',
    '{"fr":"Huile Précieuse Aura","en":"Aura Precious Oil"}',
    '{"fr":"Huile visage","en":"Face oil"}',
    '{"fr":"Élixir sec, fini satiné, actifs botaniques rares.","en":"Dry elixir, satin finish, rare botanical actives."}',
    74000,
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=80',
    '{"fr":"Édition limitée","en":"Limited edition"}',
    8,
    true
  ),
  (
    'masque-porcelaine-noire',
    '{"fr":"Masque Porcelaine Noire","en":"Black Porcelain Mask"}',
    '{"fr":"Rituel hebdomadaire","en":"Weekly ritual"}',
    '{"fr":"Charbon activé et argile, éclat instantané.","en":"Activated charcoal and clay, instant radiance."}',
    58000,
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=80',
    null,
    42,
    true
  ),
  (
    'eau-de-parfum-monolithe',
    '{"fr":"Eau de Parfum Monolithe","en":"Monolith Eau de Parfum"}',
    '{"fr":"Parfum","en":"Fragrance"}',
    '{"fr":"Boisé minéral, sillage sculptural et sobre.","en":"Mineral woods, a sculptural, restrained trail."}',
    120000,
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80',
    '{"fr":"Nouveauté","en":"New"}',
    15,
    true
  ),
  (
    'baume-nettoyant-marbre',
    '{"fr":"Baume Nettoyant Marbre","en":"Marble Cleansing Balm"}',
    '{"fr":"Nettoyage","en":"Cleanse"}',
    '{"fr":"Fond en huile soyeuse, démaquille et purifie.","en":"Melts into a silky oil, removes make-up and purifies."}',
    49000,
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80',
    null,
    0,
    false
  )
on conflict (slug) do update set
  name         = excluded.name,
  category     = excluded.category,
  description  = excluded.description,
  price_xaf    = excluded.price_xaf,
  image_url    = excluded.image_url,
  tag          = excluded.tag,
  stock        = excluded.stock,
  is_published = excluded.is_published;

-- =============================================================================
-- End of seed.
-- =============================================================================
