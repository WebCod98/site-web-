'use client';

import Link from 'next/link';
import Logo from './Logo';
import { useLocale } from './LocaleProvider';

/**
 * Social links. Replace the `href` values with the brand's real accounts.
 * Icons are inline monochrome SVGs to stay on-charter (no external assets).
 */
const SOCIALS: { name: string; href: string; icon: JSX.Element }[] = [
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M14 8h2V5h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8c0-.6.4-1 1-1z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46" />
        <path d="M14 4c.5 2.5 2 4 4.5 4.2" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20l1.4-4A8 8 0 1 1 8 18.6L4 20z" />
        <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-.5l-1.3-1-1 .5c-1.2-.4-2.3-1.5-2.7-2.7l.5-1-1-1.3s-.5.4-.5 1z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

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
      links: [
        { label: t.nav.collections, href: '/collection' },
        { label: t.nav.fragrance, href: '/collection' },
        { label: t.nav.skincare, href: '/collection' },
        { label: t.footer.stores, href: '/a-propos' },
      ],
    },
    {
      heading: t.footer.care,
      links: [
        { label: 'FAQ', href: '/faq' },
        { label: t.footer.shipping, href: '/retours' },
        { label: t.footer.returns, href: '/retours' },
        { label: t.footer.contact, href: '/contact' },
      ],
    },
    {
      heading: t.footer.legal,
      links: [
        { label: t.footer.privacy, href: '/cgv' },
        { label: t.footer.terms, href: '/cgv' },
      ],
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

            {/* Social media zone */}
            <div className="mt-8">
              <h4 className="label-editorial-muted mb-4">{t.footer.follow}</h4>
              <div className="flex items-center gap-5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.heading} className="flex flex-col gap-5">
              <h4 className="label-editorial-muted">{col.heading}</h4>
              <ul className="flex flex-col gap-4">
                {col.links.map((link, i) => (
                  <li key={`${col.heading}-${i}`}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm font-light text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      {link.label}
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
