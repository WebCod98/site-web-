'use client';

import { useEffect } from 'react';

/**
 * SCULPT'AURA Admin — service worker registration.
 *
 * Registers /sw.js on mount so the admin is installable and its shell is cached
 * for offline use. Registration is skipped in development to avoid stale caches
 * interfering with hot reload.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // Registration failures are non-fatal — the app still works online.
        });
    };

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
