'use client';

import { useState } from 'react';
import { useLocale } from './LocaleProvider';
import type { BilingualContent, FaqContent } from '@/lib/content';

/**
 * SCULPT'AURA — FAQ accordion.
 *
 * Renders the active locale's questions as hairline-separated rows that expand
 * on click. Pure monochrome, on-charter — a thin +/− glyph marks state.
 */
export default function FaqView({
  content,
}: {
  content: BilingualContent<FaqContent>;
}) {
  const { locale } = useLocale();
  const data = content[locale];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="bg-white pb-28 pt-8">
      <div className="container-editorial max-w-3xl">
        <header className="mb-14 text-center">
          <p className="label-editorial-muted mb-4">SCULPT&rsquo;AURA</p>
          <h1 className="font-serif text-4xl italic text-neutral-900 sm:text-5xl">
            {data.title}
          </h1>
        </header>

        <ul className="border-t border-neutral-100">
          {data.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className="border-b border-neutral-100">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg italic text-neutral-900">
                    {item.q}
                  </span>
                  <span className="font-sans text-lg text-neutral-400">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen
                      ? 'grid-rows-[1fr] pb-6 opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <p className="overflow-hidden font-sans text-sm font-light leading-relaxed text-neutral-600">
                    {item.a}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
