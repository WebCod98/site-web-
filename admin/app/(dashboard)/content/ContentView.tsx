'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase';
import {
  DEFAULTS,
  getEntry,
  saveEntry,
  type ContentKey,
  type FaqContent,
  type TextPage,
} from '@/lib/content';

/**
 * SCULPT'AURA Admin — content editor.
 *
 * Edit the FAQ and the About / Terms / Returns / Contact pages in FR and EN,
 * without touching the code. Text pages are title + body; the FAQ is a list of
 * question/answer pairs. Saving upserts to Supabase (admin only). In demo mode
 * the editor is previewable but saving prompts to connect Supabase.
 */

const TEXT_KEYS: { key: ContentKey; label: string }[] = [
  { key: 'about', label: 'À propos' },
  { key: 'terms', label: 'CGV' },
  { key: 'returns', label: 'Retours' },
  { key: 'contact', label: 'Contact' },
];

type TextEntry = { fr: TextPage; en: TextPage };
type FaqEntry = { fr: FaqContent; en: FaqContent };

export default function ContentView() {
  const configured = isSupabaseConfigured;
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<ContentKey>('about');

  const [texts, setTexts] = useState<Record<string, TextEntry>>({
    about: DEFAULTS.about,
    terms: DEFAULTS.terms,
    returns: DEFAULTS.returns,
    contact: DEFAULTS.contact,
  });
  const [faq, setFaq] = useState<FaqEntry>(DEFAULTS.faq);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [about, terms, returns, contact, faqData] = await Promise.all([
      getEntry('about'),
      getEntry('terms'),
      getEntry('returns'),
      getEntry('contact'),
      getEntry('faq'),
    ]);
    setTexts({ about, terms, returns, contact });
    setFaq(faqData);
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
        await loadAll();
      }
      setReady(true);
    });
  }, [configured, loadAll]);

  const save = async () => {
    setMessage(null);
    setSaving(true);
    try {
      if (tab === 'faq') {
        await saveEntry('faq', faq.fr, faq.en);
      } else {
        await saveEntry(tab, texts[tab].fr, texts[tab].en);
      }
      setMessage('Enregistré ✓');
    } catch (err) {
      setMessage(
        err instanceof Error && err.message.includes('configuré')
          ? 'Connectez Supabase pour enregistrer (voir SETUP.md).'
          : err instanceof Error
            ? err.message
            : 'Enregistrement impossible.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (ready && configured && !authed) {
    return (
      <main className="animate-fade-in px-8 py-12 lg:px-14">
        <Header />
        <div className="card-editorial flex flex-col items-start gap-4">
          <p className="font-serif text-xl italic text-neutral-900">
            Connectez-vous pour éditer le contenu.
          </p>
          <Link href="/login" className="btn-editorial">Se connecter</Link>
        </div>
      </main>
    );
  }

  // Update helpers for the active text entry.
  const updateText = (
    locale: 'fr' | 'en',
    field: keyof TextPage,
    value: string,
  ) => {
    setTexts((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [locale]: { ...prev[tab][locale], [field]: value } },
    }));
  };

  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      <Header />

      {!configured && (
        <div className="mb-8 border border-neutral-200 bg-neutral-50 px-6 py-4 font-sans text-sm font-light text-neutral-600">
          <strong className="text-neutral-900">Mode démo.</strong> Vous pouvez
          prévisualiser l’éditeur ; connectez Supabase (voir <code>SETUP.md</code>)
          pour enregistrer les modifications.
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {[...TEXT_KEYS, { key: 'faq' as ContentKey, label: 'FAQ' }].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setMessage(null); }}
            className={`pill transition-colors ${
              tab === t.key
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      {tab === 'faq' ? (
        <FaqEditor faq={faq} setFaq={setFaq} />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {(['fr', 'en'] as const).map((loc) => (
            <div key={loc} className="card-editorial space-y-6">
              <p className="label-editorial">{loc === 'fr' ? 'Français' : 'English'}</p>
              <div className="field-editorial">
                <label className="label-editorial-muted mb-2">Titre</label>
                <input
                  value={texts[tab][loc].title}
                  onChange={(e) => updateText(loc, 'title', e.target.value)}
                />
              </div>
              <div className="flex flex-col border-b border-neutral-200 pb-2 focus-within:border-neutral-900">
                <label className="label-editorial-muted mb-2">Contenu</label>
                <textarea
                  rows={12}
                  value={texts[tab][loc].body}
                  onChange={(e) => updateText(loc, 'body', e.target.value)}
                  className="w-full resize-y bg-transparent font-sans text-sm leading-relaxed text-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save */}
      <div className="mt-10 flex items-center gap-6">
        <button type="button" onClick={save} disabled={saving} className="btn-editorial disabled:opacity-40">
          {saving ? '…' : 'Enregistrer'}
        </button>
        {message && (
          <span className="font-sans text-sm text-neutral-600">{message}</span>
        )}
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="mb-10">
      <p className="label-editorial-muted">Contenu du site</p>
      <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
        Éditeur de contenu
      </h1>
    </header>
  );
}

/** FAQ list editor: add / edit / remove Q&A in FR & EN. */
function FaqEditor({
  faq,
  setFaq,
}: {
  faq: FaqEntry;
  setFaq: React.Dispatch<React.SetStateAction<FaqEntry>>;
}) {
  const count = Math.max(faq.fr.items.length, faq.en.items.length);

  const setItem = (
    loc: 'fr' | 'en',
    idx: number,
    field: 'q' | 'a',
    value: string,
  ) => {
    setFaq((prev) => {
      const items = [...prev[loc].items];
      items[idx] = { ...(items[idx] ?? { q: '', a: '' }), [field]: value };
      return { ...prev, [loc]: { ...prev[loc], items } };
    });
  };

  const addItem = () => {
    setFaq((prev) => ({
      fr: { ...prev.fr, items: [...prev.fr.items, { q: '', a: '' }] },
      en: { ...prev.en, items: [...prev.en.items, { q: '', a: '' }] },
    }));
  };

  const removeItem = (idx: number) => {
    setFaq((prev) => ({
      fr: { ...prev.fr, items: prev.fr.items.filter((_, i) => i !== idx) },
      en: { ...prev.en, items: prev.en.items.filter((_, i) => i !== idx) },
    }));
  };

  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-editorial space-y-6">
          <div className="flex items-center justify-between">
            <span className="label-editorial">Question {i + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 hover:text-neutral-900 hover:underline"
            >
              Supprimer
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {(['fr', 'en'] as const).map((loc) => (
              <div key={loc} className="space-y-4">
                <p className="label-editorial-muted">{loc === 'fr' ? 'Français' : 'English'}</p>
                <div className="field-editorial">
                  <label className="label-editorial-muted mb-2">Question</label>
                  <input
                    value={faq[loc].items[i]?.q ?? ''}
                    onChange={(e) => setItem(loc, i, 'q', e.target.value)}
                  />
                </div>
                <div className="flex flex-col border-b border-neutral-200 pb-2 focus-within:border-neutral-900">
                  <label className="label-editorial-muted mb-2">Réponse</label>
                  <textarea
                    rows={3}
                    value={faq[loc].items[i]?.a ?? ''}
                    onChange={(e) => setItem(loc, i, 'a', e.target.value)}
                    className="w-full resize-y bg-transparent font-sans text-sm leading-relaxed text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="label-editorial text-neutral-500 hover:text-neutral-900">
        + Ajouter une question
      </button>
    </div>
  );
}
