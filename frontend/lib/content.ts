import { getSupabaseServer } from './supabase';

/**
 * SCULPT'AURA — editable site content (FAQ, About, Terms, Returns).
 *
 * Content lives in the Supabase `site_content` table (one row per page, keyed by
 * slug, bilingual jsonb) and is edited from the admin without touching code.
 * This module ships sensible **defaults** so every page renders even before the
 * database is connected (demo mode). Both locales are always returned together
 * so the client view can switch FR/EN without a refetch.
 */

export type TextPage = { title: string; body: string };
export type FaqItem = { q: string; a: string };
export type FaqContent = { title: string; items: FaqItem[] };
/** The scrolling top banner: a message + an on/off switch. */
export type BannerContent = { message: string; enabled: boolean };

export type ContentKey =
  | 'about'
  | 'terms'
  | 'returns'
  | 'contact'
  | 'faq'
  | 'announcement';

/** { fr, en } pair for a given key. */
export type BilingualContent<T> = { fr: T; en: T };

/** Default content shipped in code — the fallback when no DB row exists. */
export const DEFAULT_CONTENT = {
  announcement: {
    fr: {
      message:
        'Livraison offerte au Cameroun dès 75 000 XAF — Expédition internationale disponible',
      enabled: true,
    },
    en: {
      message:
        'Complimentary delivery in Cameroon from 75,000 XAF — International shipping available',
      enabled: true,
    },
  },
  about: {
    fr: {
      title: 'La Maison',
      body: `SCULPT'AURA est une maison dédiée à la silhouette féminine. Nous concevons des gaines d'exception et des soins minceur pensés pour révéler, sublimer et accompagner chaque femme.\n\nNée au Cameroun, notre maison marie exigence, élégance et confort. Chaque pièce est choisie pour son maintien, sa finition et son respect du corps.\n\nNotre promesse : une silhouette sculptée, une confiance retrouvée.`,
    },
    en: {
      title: 'The House',
      body: `SCULPT'AURA is a house devoted to the feminine silhouette. We craft exceptional shapewear and slimming care designed to reveal, enhance and support every woman.\n\nBorn in Cameroon, our house blends exactingness, elegance and comfort. Each piece is chosen for its hold, its finish and its respect for the body.\n\nOur promise: a sculpted silhouette, restored confidence.`,
    },
  },
  terms: {
    fr: {
      title: 'Conditions Générales de Vente',
      body: `1. Objet\nLes présentes conditions régissent les ventes réalisées sur SCULPT'AURA.\n\n2. Prix\nLes prix sont indiqués en Francs CFA (XAF), toutes taxes comprises.\n\n3. Commande\nToute commande validée après paiement vaut acceptation des présentes conditions.\n\n4. Paiement\nLes paiements sont sécurisés (Mobile Money, carte). La commande est préparée après confirmation du paiement.\n\n5. Livraison\nLes délais et frais de livraison sont précisés au paiement, selon la destination.\n\n(Ce texte est un modèle — adaptez-le à votre activité depuis l'administration.)`,
    },
    en: {
      title: 'Terms & Conditions',
      body: `1. Purpose\nThese terms govern sales made on SCULPT'AURA.\n\n2. Prices\nPrices are shown in CFA Francs (XAF), all taxes included.\n\n3. Orders\nAny order confirmed after payment constitutes acceptance of these terms.\n\n4. Payment\nPayments are secure (Mobile Money, card). Orders are prepared after payment confirmation.\n\n5. Delivery\nTimes and fees are shown at checkout, depending on destination.\n\n(This is a template — adapt it to your business from the admin.)`,
    },
  },
  returns: {
    fr: {
      title: 'Politique de Retour',
      body: `Vous disposez de 7 jours après réception pour nous contacter en cas de problème.\n\nLes articles doivent être retournés non portés, dans leur emballage d'origine, avec l'étiquette.\n\nPour des raisons d'hygiène, certains articles (gaines portées) ne peuvent être repris que s'ils sont défectueux.\n\nLes frais de retour sont à la charge du client, sauf erreur de notre part.\n\n(Modèle à personnaliser depuis l'administration.)`,
    },
    en: {
      title: 'Return Policy',
      body: `You have 7 days after delivery to contact us in case of an issue.\n\nItems must be returned unworn, in their original packaging, with the tag attached.\n\nFor hygiene reasons, some items (worn shapewear) can only be returned if defective.\n\nReturn shipping is the customer's responsibility, except in case of our error.\n\n(Template to personalise from the admin.)`,
    },
  },
  contact: {
    fr: {
      title: 'Contact',
      body: `Une question ? Notre équipe vous répond.\n\nÉcrivez-nous via le formulaire ci-dessous, ou par WhatsApp.\n\nDouala, Cameroun.`,
    },
    en: {
      title: 'Contact',
      body: `A question? Our team is here to help.\n\nWrite to us via the form below, or on WhatsApp.\n\nDouala, Cameroon.`,
    },
  },
  faq: {
    fr: {
      title: 'Questions fréquentes',
      items: [
        { q: 'Comment choisir ma taille de gaine ?', a: 'Mesurez votre tour de taille et référez-vous au guide des tailles de chaque produit. En cas de doute, contactez-nous, nous vous conseillons.' },
        { q: 'Quels sont les délais de livraison ?', a: 'Au Cameroun : 1 à 3 jours. À l’international : 5 à 14 jours. Les frais et délais exacts s’affichent au paiement.' },
        { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Mobile Money (MTN, Orange) et carte bancaire, via un paiement 100% sécurisé.' },
        { q: 'Puis-je porter une gaine toute la journée ?', a: 'Oui, nos gaines sont pensées pour le confort. Nous recommandons une adaptation progressive les premiers jours.' },
        { q: 'Comment entretenir ma gaine ?', a: 'Lavage à la main à l’eau tiède, séchage à plat, à l’abri du soleil direct. Évitez le sèche-linge.' },
      ],
    },
    en: {
      title: 'Frequently asked questions',
      items: [
        { q: 'How do I choose my shaper size?', a: 'Measure your waist and refer to each product’s size guide. If unsure, contact us and we’ll advise you.' },
        { q: 'What are the delivery times?', a: 'In Cameroon: 1 to 3 days. International: 5 to 14 days. Exact fees and times show at checkout.' },
        { q: 'Which payment methods do you accept?', a: 'Mobile Money (MTN, Orange) and bank card, through a fully secure payment.' },
        { q: 'Can I wear a shaper all day?', a: 'Yes, our shapers are designed for comfort. We recommend easing in gradually over the first few days.' },
        { q: 'How do I care for my shaper?', a: 'Hand wash in lukewarm water, dry flat away from direct sunlight. Avoid tumble drying.' },
      ],
    },
  },
} satisfies {
  announcement: BilingualContent<BannerContent>;
  about: BilingualContent<TextPage>;
  terms: BilingualContent<TextPage>;
  returns: BilingualContent<TextPage>;
  contact: BilingualContent<TextPage>;
  faq: BilingualContent<FaqContent>;
};

/**
 * Fetch a content entry (both locales) from Supabase, falling back to defaults.
 * The returned object always has `fr` and `en`.
 */
export async function fetchContent<K extends ContentKey>(
  key: K,
): Promise<(typeof DEFAULT_CONTENT)[K]> {
  const fallback = DEFAULT_CONTENT[key];
  const supabase = getSupabaseServer();
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from('site_content')
    .select('fr, en')
    .eq('key', key)
    .maybeSingle();

  if (error || !data || !data.fr || Object.keys(data.fr).length === 0) {
    return fallback;
  }
  return { fr: data.fr, en: data.en } as (typeof DEFAULT_CONTENT)[K];
}
