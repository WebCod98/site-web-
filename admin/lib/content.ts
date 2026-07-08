import { getSupabaseBrowser } from './supabase';

/**
 * SCULPT'AURA Admin — editable site content (FAQ, About, Terms, Returns, Contact).
 *
 * Reads/writes the Supabase `site_content` table (one bilingual row per page).
 * Writes require an authenticated admin (RLS). Defaults mirror the storefront so
 * the editor is pre-filled with the current live content even before any row is
 * saved.
 */

export type TextPage = { title: string; body: string };
export type FaqItem = { q: string; a: string };
export type FaqContent = { title: string; items: FaqItem[] };
export type BannerContent = { message: string; enabled: boolean };
export type ContentKey =
  | 'about'
  | 'terms'
  | 'returns'
  | 'contact'
  | 'faq'
  | 'announcement';

export type Entry<T> = { fr: T; en: T };

/** Default content — kept in sync with frontend/lib/content.ts. */
export const DEFAULTS = {
  announcement: {
    fr: { message: 'Livraison offerte au Cameroun dès 75 000 XAF — Expédition internationale disponible', enabled: true },
    en: { message: 'Complimentary delivery in Cameroon from 75,000 XAF — International shipping available', enabled: true },
  },
  about: {
    fr: { title: 'La Maison', body: "SCULPT'AURA est une maison dédiée à la silhouette féminine. Nous concevons des gaines d'exception et des soins minceur pensés pour révéler chaque femme.\n\nNée au Cameroun, notre maison marie exigence, élégance et confort." },
    en: { title: 'The House', body: "SCULPT'AURA is a house devoted to the feminine silhouette. We craft exceptional shapewear and slimming care designed to reveal every woman.\n\nBorn in Cameroon, our house blends exactingness, elegance and comfort." },
  },
  terms: {
    fr: { title: 'Conditions Générales de Vente', body: 'Les présentes conditions régissent les ventes réalisées sur SCULPT’AURA. Les prix sont en XAF, toutes taxes comprises. (Modèle à personnaliser.)' },
    en: { title: 'Terms & Conditions', body: 'These terms govern sales made on SCULPT’AURA. Prices are in XAF, all taxes included. (Template to personalise.)' },
  },
  returns: {
    fr: { title: 'Politique de Retour', body: 'Vous disposez de 7 jours après réception pour nous contacter. Les articles doivent être retournés non portés. (Modèle à personnaliser.)' },
    en: { title: 'Return Policy', body: 'You have 7 days after delivery to contact us. Items must be returned unworn. (Template to personalise.)' },
  },
  contact: {
    fr: { title: 'Contact', body: 'Une question ? Écrivez-nous via le formulaire ci-dessous, ou par WhatsApp. Douala, Cameroun.' },
    en: { title: 'Contact', body: 'A question? Write to us via the form below, or on WhatsApp. Douala, Cameroon.' },
  },
  faq: {
    fr: {
      title: 'Questions fréquentes',
      items: [
        { q: 'Comment choisir ma taille de gaine ?', a: 'Mesurez votre tour de taille et référez-vous au guide des tailles.' },
        { q: 'Quels sont les délais de livraison ?', a: 'Au Cameroun : 1 à 3 jours. À l’international : 5 à 14 jours.' },
        { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Mobile Money (MTN, Orange) et carte bancaire.' },
      ],
    },
    en: {
      title: 'Frequently asked questions',
      items: [
        { q: 'How do I choose my size?', a: 'Measure your waist and refer to the size guide.' },
        { q: 'What are the delivery times?', a: 'In Cameroon: 1 to 3 days. International: 5 to 14 days.' },
        { q: 'Which payment methods do you accept?', a: 'Mobile Money (MTN, Orange) and bank card.' },
      ],
    },
  },
} satisfies {
  announcement: Entry<BannerContent>;
  about: Entry<TextPage>;
  terms: Entry<TextPage>;
  returns: Entry<TextPage>;
  contact: Entry<TextPage>;
  faq: Entry<FaqContent>;
};

/** Fetch a single entry, DB over defaults. */
export async function getEntry<K extends ContentKey>(
  key: K,
): Promise<(typeof DEFAULTS)[K]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return DEFAULTS[key];

  const { data } = await supabase
    .from('site_content')
    .select('fr, en')
    .eq('key', key)
    .maybeSingle();

  if (!data || !data.fr || Object.keys(data.fr).length === 0) {
    return DEFAULTS[key];
  }
  return { fr: data.fr, en: data.en } as (typeof DEFAULTS)[K];
}

/** Upsert an entry (admin only — enforced by RLS). */
export async function saveEntry(
  key: ContentKey,
  fr: unknown,
  en: unknown,
): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Supabase non configuré.');

  const { error } = await supabase
    .from('site_content')
    .upsert({ key, fr, en }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}
