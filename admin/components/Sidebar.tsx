'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * SCULPT'AURA Admin — sidebar navigation.
 *
 * A fixed, hairline-bordered rail carrying the figured wordmark and the section
 * links. The active link is marked by a solid black left tick — no fills, no
 * colour, per the charter.
 */
const LINKS = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/orders', label: 'Commandes' },
  { href: '/products', label: 'Produits' },
  { href: '/reviews', label: 'Avis' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-neutral-100 bg-white px-8 py-10 lg:flex">
      {/* Wordmark */}
      <Link href="/" className="mb-16 block">
        <span className="font-serif text-2xl italic tracking-wide text-neutral-900">
          SCULPT&rsquo;AURA
        </span>
        <span className="mt-1 block label-editorial-muted">Administration</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => {
          const active =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 py-3 font-sans text-[0.7rem] uppercase tracking-editorial transition-colors ${
                active
                  ? 'text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <span
                className={`h-px w-6 transition-all ${
                  active
                    ? 'bg-neutral-900'
                    : 'bg-neutral-200 group-hover:bg-neutral-900'
                }`}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <Link
          href="/login"
          className="label-editorial-muted transition-colors hover:text-neutral-900"
        >
          Déconnexion
        </Link>
        <p className="mt-4 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-300">
          Douala &middot; XAF
        </p>
      </div>
    </aside>
  );
}
