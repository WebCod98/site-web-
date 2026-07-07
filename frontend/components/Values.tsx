'use client';

import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — house values.
 *
 * Three columns separated by hairline rules, each a numbered editorial note.
 * No icons, no colour — only numerals, serif titles and restrained prose.
 */
export default function Values() {
  const { t } = useLocale();

  const values = [
    { n: '01', ...t.values.craft },
    { n: '02', ...t.values.origin },
    { n: '03', ...t.values.care },
  ];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container-editorial">
        <div className="grid grid-cols-1 divide-y divide-neutral-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {values.map((value) => (
            <div
              key={value.n}
              className="flex flex-col items-center px-8 py-12 text-center md:py-4"
            >
              <span className="font-serif text-3xl italic text-neutral-300">
                {value.n}
              </span>
              <h3 className="mt-6 label-editorial">{value.title}</h3>
              <p className="mt-4 max-w-xs font-sans text-sm font-light leading-relaxed text-neutral-500">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
