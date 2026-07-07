'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';

/**
 * SCULPT'AURA — splash / opening screen.
 *
 * A full-screen black overlay showing the logo + wordmark with a soft reveal
 * (figure fades up, a hairline draws outward, the tagline fades in). It dismisses
 * automatically after ~2.8s or on any click/tap, fading out to reveal the site.
 *
 * It shows only ONCE per browser session (sessionStorage), so navigating between
 * pages does not replay it.
 */

const SESSION_KEY = 'sculptaura.splashSeen';
const AUTO_DISMISS_MS = 2800;
const FADE_MS = 700;

export default function SplashScreen() {
  // `mounted` keeps the node in the DOM through the fade-out; `visible` drives
  // the opacity. `armed` avoids a flash before we know whether to show it.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      seen = false;
    }
    if (seen) return; // already shown this session — never mount.

    setMounted(true);
    // Next frame → fade in.
    requestAnimationFrame(() => setVisible(true));

    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore — worst case the splash shows again, harmless.
    }
    setVisible(false);
    window.setTimeout(() => setMounted(false), FADE_MS);
  };

  // Lock scroll while visible.
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = visible ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted, visible]);

  if (!mounted) return null;

  return (
    <div
      role="presentation"
      onClick={dismiss}
      className={`fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center bg-neutral-900 text-white transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="animate-fade-up">
        <Logo withFigure className="text-white" figureClassName="mb-4 h-24 w-auto" />
      </div>

      {/* Hairline that draws outward under the wordmark. */}
      <span
        className={`mt-8 block h-px bg-white/60 transition-all duration-1000 ease-out ${
          visible ? 'w-40 opacity-100' : 'w-0 opacity-0'
        }`}
      />

      <p className="mt-8 animate-fade-in font-sans text-[0.65rem] uppercase tracking-editorial-wide text-white/50 [animation-delay:400ms]">
        Maison de silhouette
      </p>

      <span className="absolute bottom-10 animate-fade-in font-sans text-[0.55rem] uppercase tracking-editorial text-white/30 [animation-delay:1200ms]">
        Toucher pour entrer
      </span>
    </div>
  );
}
