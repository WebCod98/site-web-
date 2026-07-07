'use client';

import Image from 'next/image';
import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — the ritual.
 *
 * An asymmetric split: a tall monochrome image on one side, editorial copy on
 * the other, separated only by whitespace. On black to punctuate the page rhythm
 * between the two white sections around it.
 */
export default function RitualSection() {
  const { t } = useLocale();

  return (
    <section id="ritual" className="bg-neutral-900 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[42rem]">
          <Image
            src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1400&q=80"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover grayscale"
          />
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center px-8 py-20 sm:px-16 lg:px-24">
          <p className="label-editorial-muted mb-6 text-white/50">
            {t.ritual.eyebrow}
          </p>
          <h2 className="max-w-md font-serif text-4xl italic leading-tight sm:text-5xl">
            {t.ritual.title}
          </h2>
          <p className="mt-8 max-w-md font-sans text-sm font-light leading-relaxed text-white/70">
            {t.ritual.body}
          </p>
          <div className="mt-12">
            <a href="#collection" className="btn-editorial-inverse">
              {t.ritual.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
