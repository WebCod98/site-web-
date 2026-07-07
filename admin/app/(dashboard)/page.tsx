import Link from 'next/link';
import StatusPill from '@/components/StatusPill';
import {
  formatXAF,
  getKpis,
  orders,
  products,
} from '@/lib/data';

/**
 * SCULPT'AURA Admin — dashboard.
 *
 * A four-tile KPI row (revenue, orders, pending, low stock), the most recent
 * orders, and a low-stock watchlist. Everything is framed with hairlines; the
 * only "colour" is the inversion of solid status pills.
 */
export default function DashboardPage() {
  const kpis = getKpis();
  const recent = [...orders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);
  const lowStock = products.filter((p) => p.stock <= 10);

  const tiles = [
    { label: "Chiffre d'affaires", value: formatXAF(kpis.revenueXAF) },
    { label: 'Commandes', value: String(kpis.orders) },
    { label: 'En attente', value: String(kpis.pending) },
    { label: 'Stock faible', value: String(kpis.lowStock) },
  ];

  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      {/* Header */}
      <header className="mb-12">
        <p className="label-editorial-muted">Vue d’ensemble</p>
        <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
          Tableau de bord
        </h1>
      </header>

      {/* KPI tiles */}
      <section className="grid grid-cols-1 gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-white p-8">
            <p className="label-editorial-muted">{tile.label}</p>
            <p className="mt-4 font-serif text-3xl italic text-neutral-900">
              {tile.value}
            </p>
          </div>
        ))}
      </section>

      {/* Recent orders */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="label-editorial">Commandes récentes</h2>
          <Link
            href="/orders"
            className="label-editorial-muted transition-colors hover:text-neutral-900"
          >
            Tout voir
          </Link>
        </div>

        <div className="overflow-x-auto card-editorial p-0">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-left">
                <Th>Référence</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right">Date</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-neutral-50 last:border-0"
                >
                  <Td>
                    <span className="font-sans text-sm tracking-wide text-neutral-900">
                      {order.reference}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-serif text-base italic text-neutral-900">
                      {order.customer}
                    </span>
                    <span className="block font-sans text-[0.65rem] tracking-editorial text-neutral-400">
                      {order.city} &middot; {order.country}
                    </span>
                  </Td>
                  <Td>
                    <StatusPill status={order.status} />
                  </Td>
                  <Td className="text-right font-sans text-sm text-neutral-900">
                    {formatXAF(order.totalXAF)}
                  </Td>
                  <Td className="text-right font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-400">
                    {order.createdAt}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Low stock */}
      <section className="mt-16">
        <h2 className="mb-6 label-editorial">Réassort à prévoir</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lowStock.map((p) => (
            <div
              key={p.id}
              className="card-editorial flex items-center justify-between"
            >
              <div>
                <p className="font-serif text-lg italic text-neutral-900">
                  {p.name}
                </p>
                <p className="label-editorial-muted mt-1">{p.category}</p>
              </div>
              <span className="font-serif text-2xl italic text-neutral-900">
                {p.stock}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-6 py-5 align-top ${className}`}>{children}</td>;
}
