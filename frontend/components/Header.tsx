'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import LanguageToggle from './LanguageToggle';
import { useLocale } from './LocaleProvider';
import { useCart } from './CartProvider';

/**
 * SCULPT'AURA — storefront header.
 *
 * Transparent over the hero, then condenses to a solid white bar with a hairline
 * divider once the visitor scrolls. Holds the primary navigation, the bilingual
 * capsule toggle, and the account / cart affordances. Fully responsive, with a
 * full-screen editorial menu on small screens.
 */
export default function Header() {
  const { t } = useLocale();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const nav = [
    { href: '/collection', label: t.nav.collections },
    { href: '/collection', label: t.nav.skincare },
    { href: '/collection', label: t.nav.fragrance },
    { href: '/#manifesto', label: t.nav.journal },
    { href: '/#newsletter', label: t.nav.contact },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-8 z-50 transition-colors duration-500 ${
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur border-b border-neutral-100'
          : 'bg-transparent'
      }`}
    >
      <div className="container-editorial flex items-center justify-between py-5">
        {/* Left — desktop navigation */}
        <nav className="hidden flex-1 items-center gap-8 lg:flex">
          {nav.slice(0, 2).map((item, i) => (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              className="label-editorial text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Center — wordmark */}
        <Link href="/" className="flex flex-1 justify-center">
          <Logo withFigure={false} className="text-neutral-900" />
        </Link>

        {/* Right — utilities */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <nav className="hidden items-center gap-8 lg:flex">
            {nav.slice(3, 5).map((item, i) => (
              <Link
                key={`${item.href}-r-${i}`}
                href={item.href}
                className="label-editorial text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <LanguageToggle className="hidden sm:inline-flex" />

          <Link
            href="/login"
            aria-label="Account"
            className="label-editorial hidden text-neutral-900 transition-opacity hover:opacity-60 sm:inline-flex"
          >
            {t.nav.account}
          </Link>

          <button
            type="button"
            aria-label="Cart"
            onClick={openCart}
            className="label-editorial text-neutral-900 transition-opacity hover:opacity-60"
          >
            ({count})
          </button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-6 w-6 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span
              className={`h-px w-6 bg-neutral-900 transition-transform duration-300 ${
                menuOpen ? 'translate-y-[3.5px] rotate-45' : ''
              }`}
            />
            <span
              className={`h-px w-6 bg-neutral-900 transition-transform duration-300 ${
                menuOpen ? '-translate-y-[3.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile full-screen editorial menu */}
      <div
        className={`fixed inset-0 top-[104px] z-40 origin-top bg-white transition-all duration-500 lg:hidden ${
          menuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <nav className="container-editorial flex flex-col gap-8 py-16">
          {nav.map((item, i) => (
            <Link
              key={`m-${item.href}-${i}`}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-4xl italic text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="font-serif text-4xl italic text-neutral-900"
          >
            {t.nav.account}
          </Link>
          <LanguageToggle className="mt-4 self-start sm:hidden" />
        </nav>
      </div>
    </header>
  );
}
