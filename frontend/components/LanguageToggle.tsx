'use client';

import { useLocale } from './LocaleProvider';
import type { Locale } from '@/lib/i18n';

/**
 * SCULPT'AURA — sleek bilingual capsule toggle (FR / EN).
 *
 * A single hairline-bordered capsule with a sliding black indicator. Switching
 * is instantaneous and reload-free (state lives in <LocaleProvider>). Fully
 * keyboard-accessible via a real radiogroup semantics layer.
 */
export default function LanguageToggle({
  className = '',
}: {
  className?: string;
}) {
  const { locale, setLocale } = useLocale();

  const options: Locale[] = ['fr', 'en'];

  return (
    <div
      role="radiogroup"
      aria-label="Language selector"
      className={`relative inline-flex items-center rounded-full border border-neutral-200 p-0.5 ${className}`}
    >
      {/* Sliding indicator — translates to the active side. */}
      <span
        aria-hidden="true"
        className={`absolute top-0.5 bottom-0.5 w-1/2 rounded-full bg-neutral-900 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          locale === 'en' ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ left: '2px', right: '2px', width: 'calc(50% - 2px)' }}
      />
      {options.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(code)}
            className={`relative z-10 w-9 py-1.5 text-center font-sans text-[0.65rem] uppercase tracking-editorial transition-colors duration-500 ${
              active ? 'text-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
