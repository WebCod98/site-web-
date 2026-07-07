'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase';
import {
  deleteProduct,
  listProducts,
  setPublished,
  type CatalogProduct,
} from '@/lib/catalog';
import { formatXAF, products as demoProducts } from '@/lib/data';

/**
 * SCULPT'AURA Admin — catalogue management.
 *
 * Three states:
 *   - Supabase not configured → read-only demo list + a banner explaining how to
 *     connect the database.
 *   - Configured but not signed in → a prompt to sign in.
 *   - Signed-in admin → full CRUD (create, edit, delete, publish toggle) wired to
 *     Supabase; RLS guarantees only admins can write.
 */
export default function ProductsView() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);

  const configured = isSupabaseConfigured;

  const refresh = useCallback(async () => {
    try {
      setItems(await listProducts());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setAuthed(true);
        await refresh();
      }
      setReady(true);
    });
  }, [configured, refresh]);

  const handleDelete = async (product: CatalogProduct) => {
    if (!window.confirm(`Supprimer « ${product.name.fr} » ?`)) return;
    try {
      await deleteProduct(product.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const handleTogglePublish = async (product: CatalogProduct) => {
    try {
      await setPublished(product.id, !product.is_published);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible.');
    }
  };

  // ---- Demo mode (no Supabase) --------------------------------------------
  if (ready && !configured) {
    return (
      <Shell>
        <Banner>
          <strong className="text-neutral-900">Mode démo.</strong> Connectez
          Supabase (voir <code>SETUP.md</code>) pour ajouter et modifier de vrais
          produits qui apparaîtront sur la boutique.
        </Banner>
        <DemoTable />
      </Shell>
    );
  }

  // ---- Configured but not signed in ---------------------------------------
  if (ready && configured && !authed) {
    return (
      <Shell>
        <div className="card-editorial flex flex-col items-start gap-4">
          <p className="font-serif text-xl italic text-neutral-900">
            Connectez-vous pour gérer le catalogue.
          </p>
          <Link href="/login" className="btn-editorial">
            Se connecter
          </Link>
        </div>
      </Shell>
    );
  }

  if (!ready) {
    return (
      <Shell>
        <p className="label-editorial-muted">Chargement…</p>
      </Shell>
    );
  }

  // ---- Signed-in admin — full CRUD ----------------------------------------
  return (
    <Shell onNew={() => { setEditing(null); setShowForm(true); }}>
      {error && (
        <p className="mb-6 font-sans text-[0.75rem] text-neutral-600">{error}</p>
      )}

      {items.length === 0 ? (
        <div className="card-editorial text-center">
          <p className="font-serif text-xl italic text-neutral-400">
            Aucun produit pour le moment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto card-editorial p-0">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <Th>Produit</Th>
                <Th>Catégorie</Th>
                <Th className="text-right">Prix</Th>
                <Th className="text-right">Stock</Th>
                <Th>État</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                  <Td>
                    <span className="font-serif text-lg italic text-neutral-900">
                      {p.name.fr}
                    </span>
                    <span className="block font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400">
                      {p.slug}
                    </span>
                  </Td>
                  <Td className="font-sans text-sm text-neutral-600">
                    {p.category.fr}
                  </Td>
                  <Td className="text-right font-sans text-sm text-neutral-900">
                    {formatXAF(p.price_xaf)}
                  </Td>
                  <Td className="text-right font-sans text-sm text-neutral-900">
                    {p.stock}
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(p)}
                      className={`pill ${
                        p.is_published
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {p.is_published ? 'Publié' : 'Brouillon'}
                    </button>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => { setEditing(p); setShowForm(true); }}
                        className="font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 underline-offset-4 hover:text-neutral-900 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onSaved={async () => { setShowForm(false); await refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </Shell>
  );
}

/** Page frame with the header + optional "new product" action. */
function Shell({
  children,
  onNew,
}: {
  children: React.ReactNode;
  onNew?: () => void;
}) {
  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="label-editorial-muted">Catalogue</p>
          <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
            Produits
          </h1>
        </div>
        {onNew && (
          <button type="button" onClick={onNew} className="btn-editorial">
            Nouveau produit
          </button>
        )}
      </header>
      {children}
    </main>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 border border-neutral-200 bg-neutral-50 px-6 py-4 font-sans text-sm font-light leading-relaxed text-neutral-600">
      {children}
    </div>
  );
}

/** Read-only mock table shown in demo mode. */
function DemoTable() {
  return (
    <div className="overflow-x-auto card-editorial p-0 opacity-70">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-neutral-100 text-left">
            <Th>Produit</Th>
            <Th>Catégorie</Th>
            <Th className="text-right">Prix</Th>
            <Th className="text-right">Stock</Th>
          </tr>
        </thead>
        <tbody>
          {demoProducts.map((p) => (
            <tr key={p.id} className="border-b border-neutral-50 last:border-0">
              <Td className="font-serif text-lg italic text-neutral-900">{p.name}</Td>
              <Td className="font-sans text-sm text-neutral-600">{p.category}</Td>
              <Td className="text-right font-sans text-sm text-neutral-900">{formatXAF(p.priceXAF)}</Td>
              <Td className="text-right font-sans text-sm text-neutral-900">{p.stock}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-4 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-5 align-top ${className}`}>{children}</td>;
}
