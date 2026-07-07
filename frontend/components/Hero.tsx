'use client';

import Image from 'next/image';
import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — hero.
 *
 * Full-height editorial opening: a monochrome image under a soft black scrim,
 * with the serif headline set large and italic. A slow zoom on the backdrop and
 * a staggered fade-up on the copy give the composition its couture cadence.
 */
export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-900 text-white">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-slow-zoom object-cover opacity-70 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Copy */}
      <div className="container-editorial relative z-10 flex flex-col items-center text-center">
        <p className="label-editorial-muted mb-8 animate-fade-in text-white/70">
          {t.hero.eyebrow}
        </p>
        <h1 className="max-w-4xl animate-fade-up font-serif text-5xl italic leading-[1.05] sm:text-6xl lg:text-7xl">
          {t.hero.title}
        </h1>
        <p className="mt-8 max-w-xl animate-fade-up font-sans text-sm font-light leading-relaxed text-white/80 [animation-delay:120ms]">
          {t.hero.subtitle}
        </p>
        <div className="mt-12 animate-fade-up [animation-delay:220ms]">
          <a href="#collection" className="btn-editorial-inverse">
            {t.hero.cta}
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="label-editorial-muted text-white/50">
          {t.hero.scroll}
        </span>
        <span className="h-12 w-px bg-white/30" />
      </div>
    </section>
  );
}
