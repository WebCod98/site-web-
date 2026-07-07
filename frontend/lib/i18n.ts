/**
 * SCULPT'AURA — lightweight FR/EN dictionary.
 *
 * The storefront's native market is Cameroon, so French is the default locale.
 * The toggle (see components/LanguageToggle.tsx) switches locale client-side
 * without a page reload; this module simply holds the strings and a resolver.
 */

export type Locale = 'fr' | 'en';

export const DEFAULT_LOCALE: Locale = 'fr';
export const LOCALES: Locale[] = ['fr', 'en'];

/** Persisted key used by the client toggle to remember the visitor's choice. */
export const LOCALE_STORAGE_KEY = 'sculptaura.locale';

type Dictionary = {
  nav: {
    collections: string;
    skincare: string;
    fragrance: string;
    journal: string;
    contact: string;
    account: string;
  };
  announcement: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    scroll: string;
  };
  manifesto: {
    eyebrow: string;
    quote: string;
    body: string;
  };
  collection: {
    eyebrow: string;
    title: string;
    viewAll: string;
    addToCart: string;
  };
  ritual: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
  };
  values: {
    craft: { title: string; body: string };
    origin: { title: string; body: string };
    care: { title: string; body: string };
  };
  newsletter: {
    eyebrow: string;
    title: string;
    body: string;
    placeholder: string;
    cta: string;
    consent: string;
  };
  footer: {
    tagline: string;
    house: string;
    care: string;
    legal: string;
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
    contact: string;
    stores: string;
    rights: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  fr: {
    nav: {
      collections: 'Collections',
      skincare: 'Soins',
      fragrance: 'Parfums',
      journal: 'Journal',
      contact: 'Contact',
      account: 'Compte',
    },
    announcement:
      'Livraison offerte au Cameroun dès 75 000 XAF — Expédition internationale disponible',
    hero: {
      eyebrow: 'Maison de cosmétique — Édition Haute Couture',
      title: "L'art de sculpter la lumière sur la peau",
      subtitle:
        'Des formules rares, façonnées à la main, pour révéler une aura sculptée par le soin.',
      cta: 'Découvrir la collection',
      scroll: 'Faire défiler',
    },
    manifesto: {
      eyebrow: 'Le manifeste',
      quote: '« La beauté n’est pas ajoutée. Elle est révélée. »',
      body: "SCULPT'AURA conçoit chaque soin comme une pièce de couture : mesuré, épuré, essentiel. Rien de superflu, seulement l’essence.",
    },
    collection: {
      eyebrow: 'La sélection',
      title: 'Les pièces signatures',
      viewAll: 'Voir toute la collection',
      addToCart: 'Ajouter',
    },
    ritual: {
      eyebrow: 'Le rituel',
      title: 'Un geste, une architecture de soin',
      body: "Chaque texture est pensée comme un trait de sculpteur — précise, sobre, intemporelle. Composez votre rituel du matin au soir.",
      cta: 'Explorer le rituel',
    },
    values: {
      craft: {
        title: 'Fait main',
        body: 'Petites séries façonnées avec une exigence de haute couture.',
      },
      origin: {
        title: 'Origine',
        body: 'Actifs sélectionnés, traçables, d’une pureté sans compromis.',
      },
      care: {
        title: 'Conseil',
        body: 'Un accompagnement personnel, du diagnostic à la livraison.',
      },
    },
    newsletter: {
      eyebrow: 'Le cercle',
      title: 'Entrez dans le cercle SCULPT’AURA',
      body: 'Accès anticipé aux éditions limitées, rituels confidentiels et invitations privées.',
      placeholder: 'Votre adresse e-mail',
      cta: "S'inscrire",
      consent: 'En vous inscrivant, vous acceptez notre politique de confidentialité.',
    },
    footer: {
      tagline: 'Cosmétique de prestige — Sculptée à la main.',
      house: 'La Maison',
      care: 'Service & Soin',
      legal: 'Informations',
      shipping: 'Livraison',
      returns: 'Retours',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      contact: 'Contact',
      stores: 'Boutiques',
      rights: 'Tous droits réservés.',
    },
  },
  en: {
    nav: {
      collections: 'Collections',
      skincare: 'Skincare',
      fragrance: 'Fragrance',
      journal: 'Journal',
      contact: 'Contact',
      account: 'Account',
    },
    announcement:
      'Complimentary delivery in Cameroon from 75,000 XAF — International shipping available',
    hero: {
      eyebrow: 'Cosmetic House — Haute Couture Edition',
      title: 'The art of sculpting light onto the skin',
      subtitle:
        'Rare, hand-crafted formulas that reveal an aura sculpted by care.',
      cta: 'Discover the collection',
      scroll: 'Scroll',
    },
    manifesto: {
      eyebrow: 'The manifesto',
      quote: '“Beauty is not added. It is revealed.”',
      body: "SCULPT'AURA composes every treatment like a couture piece: measured, pared-back, essential. Nothing superfluous, only the essence.",
    },
    collection: {
      eyebrow: 'The selection',
      title: 'Signature pieces',
      viewAll: 'View the full collection',
      addToCart: 'Add',
    },
    ritual: {
      eyebrow: 'The ritual',
      title: 'One gesture, an architecture of care',
      body: 'Each texture is drawn like a sculptor’s line — precise, restrained, timeless. Compose your ritual from dawn to dusk.',
      cta: 'Explore the ritual',
    },
    values: {
      craft: {
        title: 'Hand-made',
        body: 'Small batches crafted with haute-couture exactingness.',
      },
      origin: {
        title: 'Origin',
        body: 'Selected, traceable actives of uncompromising purity.',
      },
      care: {
        title: 'Guidance',
        body: 'A personal accompaniment, from diagnosis to delivery.',
      },
    },
    newsletter: {
      eyebrow: 'The circle',
      title: 'Enter the SCULPT’AURA circle',
      body: 'Early access to limited editions, confidential rituals and private invitations.',
      placeholder: 'Your email address',
      cta: 'Subscribe',
      consent: 'By subscribing, you agree to our privacy policy.',
    },
    footer: {
      tagline: 'Prestige cosmetics — Sculpted by hand.',
      house: 'The House',
      care: 'Service & Care',
      legal: 'Information',
      shipping: 'Shipping',
      returns: 'Returns',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      stores: 'Stores',
      rights: 'All rights reserved.',
    },
  },
};

/** Resolve a dictionary, falling back to the default locale defensively. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
