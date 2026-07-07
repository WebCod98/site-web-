'use client';

import { useState, type FormEvent } from 'react';
import {
  createProduct,
  slugify,
  updateProduct,
  type CatalogProduct,
  type ProductInput,
} from '@/lib/catalog';

/**
 * SCULPT'AURA Admin — product create / edit form.
 *
 * Charter-compliant: bottom-line fields only. Bilingual FR/EN inputs map to the
 * jsonb columns. On submit it creates or updates the product in Supabase and
 * calls onSaved so the list can refresh. Shown in a slide-over panel.
 */
export default function ProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product?: CatalogProduct | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const editing = Boolean(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const f = new FormData(event.currentTarget);
    const nameFr = String(f.get('nameFr') || '').trim();

    const input: ProductInput = {
      slug: String(f.get('slug') || '').trim() || slugify(nameFr),
      name: { fr: nameFr, en: String(f.get('nameEn') || '').trim() },
      category: {
        fr: String(f.get('categoryFr') || '').trim(),
        en: String(f.get('categoryEn') || '').trim(),
      },
      description: {
        fr: String(f.get('descriptionFr') || '').trim(),
        en: String(f.get('descriptionEn') || '').trim(),
      },
      price_xaf: Number(f.get('priceXaf') || 0),
      stock: Number(f.get('stock') || 0),
      image_url: String(f.get('imageUrl') || '').trim() || null,
      tag:
        String(f.get('tagFr') || '').trim() || String(f.get('tagEn') || '').trim()
          ? {
              fr: String(f.get('tagFr') || '').trim(),
              en: String(f.get('tagEn') || '').trim(),
            }
          : null,
      is_published: f.get('isPublished') === 'on',
    };

    try {
      if (editing && product) {
        await updateProduct(product.id, input);
      } else {
        await createProduct(input);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-6">
          <h2 className="font-serif text-2xl italic text-neutral-900">
            {editing ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fermer"
            className="label-editorial text-neutral-500 hover:text-neutral-900"
          >
            &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-8 px-8 py-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field label="Nom (FR)" name="nameFr" defaultValue={product?.name.fr} required />
            <Field label="Nom (EN)" name="nameEn" defaultValue={product?.name.en} />
            <Field label="Catégorie (FR)" name="categoryFr" defaultValue={product?.category.fr} />
            <Field label="Catégorie (EN)" name="categoryEn" defaultValue={product?.category.en} />
          </div>

          <Field label="Description (FR)" name="descriptionFr" defaultValue={product?.description.fr} />
          <Field label="Description (EN)" name="descriptionEn" defaultValue={product?.description.en} />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field label="Prix (XAF)" name="priceXaf" type="number" defaultValue={product?.price_xaf?.toString()} required />
            <Field label="Stock" name="stock" type="number" defaultValue={product?.stock?.toString() ?? '0'} />
          </div>

          <Field label="URL de l'image" name="imageUrl" defaultValue={product?.image_url ?? ''} placeholder="https://…" />
          <Field label="Slug (laisser vide = auto)" name="slug" defaultValue={product?.slug} placeholder="ex. serum-lumiere" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field label="Étiquette (FR)" name="tagFr" defaultValue={product?.tag?.fr ?? ''} placeholder="ex. Signature" />
            <Field label="Étiquette (EN)" name="tagEn" defaultValue={product?.tag?.en ?? ''} placeholder="ex. Signature" />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={product ? product.is_published : true}
              className="h-4 w-4 accent-neutral-900"
            />
            <span className="label-editorial">Publié (visible sur la boutique)</span>
          </label>

          {error && (
            <p className="font-sans text-[0.75rem] leading-relaxed text-neutral-600">
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving} className="btn-editorial flex-1 disabled:opacity-40">
              {saving ? '…' : editing ? 'Enregistrer' : 'Créer le produit'}
            </button>
            <button type="button" onClick={onCancel} className="label-editorial px-6 text-neutral-500 hover:text-neutral-900">
              Annuler
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/** A single charter-styled bottom-line field. */
function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="field-editorial">
      <label className="label-editorial-muted mb-2">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 0 : undefined}
      />
    </div>
  );
}
