'use client';

import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — manifesto.
 *
 * A quiet, centred statement of intent set as a large italic serif quote,
 * framed by hairline rules. Pure typography, maximum air — the charter distilled.
 */
export default function Manifesto() {
  const { t } = useLocale();

  return (
    <section id="manifesto" className="bg-white py-28 sm:py-40">
      <div className="container-editorial flex flex-col items-center text-center">
        <p className="label-editorial-muted mb-10">{t.manifesto.eyebrow}</p>
        <span className="mb-12 h-16 w-px bg-neutral-200" />
        <blockquote className="max-w-3xl font-serif text-3xl italic leading-snug text-neutral-900 sm:text-4xl lg:text-5xl">
          {t.manifesto.quote}
        </blockquote>
        <p className="mt-12 max-w-xl font-sans text-sm font-light leading-relaxed text-neutral-500">
          {t.manifesto.body}
        </p>
      </div>
    </section>
  );
}
