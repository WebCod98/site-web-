-- =============================================================================
-- SCULPT'AURA — seed data
-- -----------------------------------------------------------------------------
-- Demo catalogue mirroring the storefront mock (frontend/lib/products.ts):
-- shapewear (gaines) and slimming care. Run AFTER schema.sql.
-- Safe to re-run: rows upsert on the unique slug. Prices are integer XAF.
-- Bilingual fields are jsonb { "fr", "en" }. Image URLs are placeholders.
-- =============================================================================

insert into public.products
  (slug, name, category, description, price_xaf, image_url, tag, stock, is_published)
values
  (
    'gaine-sculptante-taille',
    '{"fr":"Gaine Sculptante Taille","en":"Waist Sculpting Shaper"}',
    '{"fr":"Gainage taille","en":"Waist shaping"}',
    '{"fr":"Gaine taille haute à double sangle, effet sablier immédiat.","en":"High-waist double-strap shaper, instant hourglass effect."}',
    18000,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    '{"fr":"Signature","en":"Signature"}',
    40,
    true
  ),
  (
    'gaine-body-integrale',
    '{"fr":"Gaine Body Intégrale","en":"Full Body Shaper"}',
    '{"fr":"Gainage complet","en":"Full-body shaping"}',
    '{"fr":"Body sculptant intégral, maintien ferme du buste aux cuisses.","en":"Full sculpting bodysuit, firm hold from bust to thighs."}',
    25000,
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=80',
    null,
    28,
    true
  ),
  (
    'gaine-post-partum',
    '{"fr":"Gaine Post-Partum","en":"Postpartum Shaper"}',
    '{"fr":"Après grossesse","en":"Postpartum"}',
    '{"fr":"Ceinture de récupération douce, soutien du ventre après grossesse.","en":"Gentle recovery belt, tummy support after pregnancy."}',
    22000,
    'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80',
    '{"fr":"Confort","en":"Comfort"}',
    18,
    true
  ),
  (
    'short-sculptant-cuisses',
    '{"fr":"Short Sculptant Cuisses","en":"Thigh Sculpting Shorts"}',
    '{"fr":"Gainage cuisses","en":"Thigh shaping"}',
    '{"fr":"Short gainant taille haute, affine cuisses et hanches.","en":"High-waist shaping shorts, refine thighs and hips."}',
    15000,
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    null,
    35,
    true
  ),
  (
    'huile-minceur-raffermissante',
    '{"fr":"Huile Minceur Raffermissante","en":"Firming Slimming Oil"}',
    '{"fr":"Soin minceur","en":"Slimming care"}',
    '{"fr":"Huile aux actifs botaniques, raffermit et tonifie la peau.","en":"Botanical-active oil, firms and tones the skin."}',
    12000,
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=80',
    '{"fr":"Nouveauté","en":"New"}',
    50,
    true
  ),
  (
    'the-minceur-detox',
    '{"fr":"Thé Minceur Détox","en":"Detox Slimming Tea"}',
    '{"fr":"Rituel minceur","en":"Slimming ritual"}',
    '{"fr":"Infusion détox aux plantes, accompagne le rituel silhouette.","en":"Herbal detox infusion, companion to the silhouette ritual."}',
    9000,
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80',
    null,
    60,
    true
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

-- Mark a couple of products as on sale (compare-at "was" price > current price).
update public.products set compare_at_xaf = 22000 where slug = 'gaine-sculptante-taille';
update public.products set compare_at_xaf = 12000 where slug = 'the-minceur-detox';

-- Seed a few promo codes (idempotent on the unique code).
insert into public.promo_codes (code, kind, value, label, commission_percent, max_uses)
values
  ('BIENVENUE10', 'percent', 10, 'Nouveaux clients', null, null),
  ('AWA15',       'percent', 15, 'Influenceuse — Awa', 10, 200),
  ('PROMO5000',   'fixed',  5000, 'Offre lancement',   null, 100)
on conflict (code) do nothing;

-- =============================================================================
-- End of seed.
-- =============================================================================
