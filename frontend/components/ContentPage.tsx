'use client';

import { useLocale } from './LocaleProvider';
import type { BilingualContent, TextPage } from '@/lib/content';

/**
 * SCULPT'AURA — generic editorial content page (About, Terms, Returns, Contact).
 *
 * Receives both locales from the server page and renders the active one. The
 * body is plain text; blank lines separate paragraphs. Optional children render
 * below the body (e.g. the contact form).
 */
export default function ContentPage({
  content,
  children,
}: {
  content: BilingualContent<TextPage>;
  children?: React.ReactNode;
}) {
  const { locale } = useLocale();
  const page = content[locale];
  const paragraphs = page.body.split('\n\n');

  return (
    <div className="bg-white pb-28 pt-8">
      <div className="container-editorial max-w-3xl">
        <header className="mb-14 text-center">
          <p className="label-editorial-muted mb-4">SCULPT&rsquo;AURA</p>
          <h1 className="font-serif text-4xl italic text-neutral-900 sm:text-5xl">
            {page.title}
          </h1>
        </header>

        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="whitespace-pre-line font-sans text-sm font-light leading-relaxed text-neutral-600"
            >
              {p}
            </p>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
