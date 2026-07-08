'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase';
import { formatXAF } from '@/lib/data';
import {
  DEMO_PROMOS,
  createPromo,
  deletePromo,
  listPromos,
  togglePromo,
  updatePromo,
  type PromoCode,
} from '@/lib/promo';

/**
 * SCULPT'AURA Admin — promotions (promo codes).
 *
 * Manage discount codes, including partner/influencer codes: each row shows the
 * discount, the partner label, uses vs. cap, generated sales and commission —
 * the data needed to track an affiliate's performance. Demo mode shows sample
 * codes read-only.
 */
export default function PromotionsView() {
  const configured = isSupabaseConfigured;
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<PromoCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await listPromos());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setItems(DEMO_PROMOS);
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

  const handleDelete = async (p: PromoCode) => {
    if (!window.confirm(`Supprimer le code « ${p.code} » ?`)) return;
    try {
      await deletePromo(p.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const handleToggle = async (p: PromoCode) => {
    try {
      await togglePromo(p.id, !p.is_active);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible.');
    }
  };

  const canManage = configured && authed;

  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="label-editorial-muted">Marketing</p>
          <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
            Promotions
          </h1>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="btn-editorial"
          >
            Nouveau code
          </button>
        )}
      </header>

      {!configured && (
        <div className="mb-8 border border-neutral-200 bg-neutral-50 px-6 py-4 font-sans text-sm font-light text-neutral-600">
          <strong className="text-neutral-900">Mode démo.</strong> Exemples de
          codes en lecture seule. Connectez Supabase (voir <code>SETUP.md</code>)
          pour créer et gérer de vrais codes promo.
        </div>
      )}

      {configured && !authed && ready && (
        <div className="card-editorial flex flex-col items-start gap-4">
          <p className="font-serif text-xl italic text-neutral-900">
            Connectez-vous pour gérer les promotions.
          </p>
          <Link href="/login" className="btn-editorial">Se connecter</Link>
        </div>
      )}

      {(!configured || authed) && (
        <>
          {error && (
            <p className="mb-6 font-sans text-[0.75rem] text-neutral-600">{error}</p>
          )}
          <div className="overflow-x-auto card-editorial p-0">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <Th>Code</Th>
                  <Th>Réduction</Th>
                  <Th>Partenaire</Th>
                  <Th className="text-right">Utilisations</Th>
                  <Th className="text-right">Ventes</Th>
                  <Th>État</Th>
                  {canManage && <Th className="text-right">Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                    <Td>
                      <span className="font-sans text-sm uppercase tracking-editorial text-neutral-900">
                        {p.code}
                      </span>
                    </Td>
                    <Td className="font-sans text-sm text-neutral-700">
                      {p.kind === 'percent' ? `−${p.value}%` : `−${formatXAF(p.value)}`}
                    </Td>
                    <Td>
                      <span className="font-serif text-base italic text-neutral-900">
                        {p.label || '—'}
                      </span>
                      {p.commission_percent != null && (
                        <span className="block font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400">
                          Commission {p.commission_percent}%
                        </span>
                      )}
                    </Td>
                    <Td className="text-right font-sans text-sm text-neutral-900">
                      {p.usage_count}
                      {p.max_uses != null && (
                        <span className="text-neutral-400"> / {p.max_uses}</span>
                      )}
                    </Td>
                    <Td className="text-right font-sans text-sm text-neutral-900">
                      {formatXAF(p.total_sales_xaf)}
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => canManage && handleToggle(p)}
                        disabled={!canManage}
                        className={`pill ${
                          p.is_active
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-400'
                        }`}
                      >
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </Td>
                    {canManage && (
                      <Td className="text-right">
                        <div className="flex justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => { setEditing(p); setShowForm(true); }}
                            className="font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-500 hover:text-neutral-900 hover:underline"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 hover:text-neutral-900 hover:underline"
                          >
                            Supprimer
                          </button>
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && canManage && (
        <PromoForm
          promo={editing}
          onSaved={async () => { setShowForm(false); await refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </main>
  );
}

/** Create / edit form (slide-over). */
function PromoForm({
  promo,
  onSaved,
  onCancel,
}: {
  promo: PromoCode | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const editing = Boolean(promo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const f = new FormData(event.currentTarget);
    const input = {
      code: String(f.get('code') || ''),
      kind: (String(f.get('kind') || 'percent') as 'percent' | 'fixed'),
      value: Number(f.get('value') || 0),
      label: String(f.get('label') || '').trim() || null,
      commission_percent: f.get('commission') ? Number(f.get('commission')) : null,
      max_uses: f.get('maxUses') ? Number(f.get('maxUses')) : null,
      is_active: f.get('isActive') === 'on',
    };
    try {
      if (editing && promo) await updatePromo(promo.id, input);
      else await createPromo(input);
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
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-6">
          <h2 className="font-serif text-2xl italic text-neutral-900">
            {editing ? 'Modifier le code' : 'Nouveau code promo'}
          </h2>
          <button type="button" onClick={onCancel} className="label-editorial text-neutral-500 hover:text-neutral-900">
            &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-8 px-8 py-8">
          <FormField label="Code (ex. AWA15)" name="code" defaultValue={promo?.code} required />

          <div className="grid grid-cols-2 gap-8">
            <div className="field-editorial">
              <label className="label-editorial-muted mb-2">Type</label>
              <select name="kind" defaultValue={promo?.kind ?? 'percent'} className="w-full appearance-none bg-transparent font-sans text-sm focus:outline-none">
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (XAF)</option>
              </select>
            </div>
            <FormField label="Valeur" name="value" type="number" defaultValue={promo?.value?.toString()} required />
          </div>

          <FormField label="Partenaire / influenceur (optionnel)" name="label" defaultValue={promo?.label ?? ''} placeholder="ex. Influenceuse — Awa" />

          <div className="grid grid-cols-2 gap-8">
            <FormField label="Commission % (optionnel)" name="commission" type="number" defaultValue={promo?.commission_percent?.toString() ?? ''} placeholder="ex. 10" />
            <FormField label="Limite d'utilisations (optionnel)" name="maxUses" type="number" defaultValue={promo?.max_uses?.toString() ?? ''} placeholder="ex. 200" />
          </div>

          <label className="flex items-center gap-3">
            <input type="checkbox" name="isActive" defaultChecked={promo ? promo.is_active : true} className="h-4 w-4 accent-neutral-900" />
            <span className="label-editorial">Actif</span>
          </label>

          {error && <p className="font-sans text-[0.75rem] text-neutral-600">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving} className="btn-editorial flex-1 disabled:opacity-40">
              {saving ? '…' : editing ? 'Enregistrer' : 'Créer le code'}
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

function FormField({
  label, name, type = 'text', defaultValue, placeholder, required,
}: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="field-editorial">
      <label className="label-editorial-muted mb-2">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} required={required} min={type === 'number' ? 0 : undefined} />
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-4 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-5 align-top ${className}`}>{children}</td>;
}
