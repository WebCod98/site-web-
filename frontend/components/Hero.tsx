'use client';

import Image from 'next/image';
import Logo from './Logo';
import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — hero.
 *
 * A full-height black opening built around the brand mark: a deep-black ground
 * with a low-opacity, grayscale image of a sculpted feminine silhouette, the
 * white logo as the centrepiece, then the tagline and CTA. A slow zoom on the
 * backdrop and a staggered fade give it a couture cadence.
 *
 * The backdrop image is a placeholder — swap the `src` below (or drop your own
 * in public/ and point to it) for your brand photography.
 */
export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-900 text-white">
      {/* Backdrop — sculpted silhouette, kept subtle behind the mark */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-slow-zoom object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Mark + copy */}
      <div className="container-editorial relative z-10 flex flex-col items-center text-center">
        <p className="label-editorial-muted mb-8 animate-fade-in text-white/70">
          {t.hero.eyebrow}
        </p>

        {/* Brand logo as the hero centrepiece */}
        <div className="animate-fade-up">
          <Logo
            withFigure
            className="text-white"
            figureClassName="mb-3 h-20 w-auto sm:h-24"
          />
        </div>

        <h1 className="mt-10 max-w-3xl animate-fade-up font-serif text-4xl italic leading-[1.08] sm:text-5xl lg:text-6xl [animation-delay:100ms]">
          {t.hero.title}
        </h1>
        <p className="mt-8 max-w-xl animate-fade-up font-sans text-sm font-light leading-relaxed text-white/80 [animation-delay:200ms]">
          {t.hero.subtitle}
        </p>
        <div className="mt-12 animate-fade-up [animation-delay:300ms]">
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
