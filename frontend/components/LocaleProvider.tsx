'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getDictionary,
  type Locale,
} from '@/lib/i18n';

/**
 * SCULPT'AURA — client-side locale context.
 *
 * The bilingual toggle must switch FR/EN without a page reload, so the active
 * locale lives in React state at the root of the client tree. The choice is
 * persisted to localStorage and reflected on <html lang> for accessibility and
 * SEO. Server components render the default (French) locale for first paint;
 * this provider then hydrates the visitor's saved preference.
 */

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Convenience accessor for the resolved dictionary. */
  t: ReturnType<typeof getDictionary>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Restore the persisted preference on mount (client only).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        LOCALE_STORAGE_KEY,
      ) as Locale | null;
      if (stored === 'fr' || stored === 'en') {
        setLocaleState(stored);
      }
    } catch {
      // localStorage may be unavailable (private mode); silently keep default.
    }
  }, []);

  // Keep <html lang> and the persisted value in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore persistence failures — the in-memory state remains correct.
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'fr' ? 'en' : 'fr'));
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: getDictionary(locale),
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** Access the active locale, its setters, and the resolved dictionary. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a <LocaleProvider>.');
  }
  return ctx;
}
