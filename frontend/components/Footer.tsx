'use client';

import Link from 'next/link';
import Logo from './Logo';
import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — footer.
 *
 * A restrained four-region footer on white: the figured wordmark and tagline,
 * then three link columns with wide-tracked labels, closed by a hairline rule
 * and the copyright line. Colour is forbidden; structure comes from whitespace
 * and a single divider.
 */
export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: t.footer.house,
      links: [t.nav.collections, t.nav.skincare, t.nav.fragrance, t.footer.stores],
    },
    {
      heading: t.footer.care,
      links: [t.footer.shipping, t.footer.returns, t.footer.contact, t.nav.journal],
    },
    {
      heading: t.footer.legal,
      links: [t.footer.privacy, t.footer.terms],
    },
  ];

  return (
    <footer className="bg-white pt-24">
      <div className="container-editorial">
        <div className="grid grid-cols-1 gap-16 pb-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <Logo withFigure className="text-neutral-900" />
            <p className="mt-6 max-w-xs font-sans text-sm font-light leading-relaxed text-neutral-500">
              {t.footer.tagline}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.heading} className="flex flex-col gap-5">
              <h4 className="label-editorial-muted">{col.heading}</h4>
              <ul className="flex flex-col gap-4">
                {col.links.map((link, i) => (
                  <li key={`${col.heading}-${i}`}>
                    <Link
                      href="#"
                      className="font-sans text-sm font-light text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Baseline */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-100 py-8 sm:flex-row">
          <p className="font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-400">
            &copy; {year} SCULPT&rsquo;AURA. {t.footer.rights}
          </p>
          <p className="font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-400">
            Douala &middot; Cameroun &middot; XAF
          </p>
        </div>
      </div>
    </footer>
  );
}
