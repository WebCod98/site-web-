'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import StatusPill from '@/components/StatusPill';
import {
  formatXAF,
  getPendingOrders,
  orders as allOrders,
  STATUS_LABEL,
  type OrderStatus,
} from '@/lib/data';

/** Leaflet map is client-only (touches `window`) — load without SSR. */
const LogisticsMap = dynamic(() => import('@/components/LogisticsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[26rem] items-center justify-center border border-neutral-200 bg-neutral-50">
      <span className="label-editorial-muted">Carte…</span>
    </div>
  ),
});

/**
 * SCULPT'AURA Admin — orders view.
 *
 * A status filter, the logistics tracking map for pending orders, and the full
 * orders table. The filter is client state so switching is instant; the map
 * always shows pending orders (what needs shipping) regardless of the filter.
 */
const FILTERS: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'paid',
  'shipped',
  'delivered',
];

export default function OrdersView() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? allOrders
        : allOrders.filter((o) => o.status === filter),
    [filter],
  );

  const pending = getPendingOrders();

  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      <header className="mb-10">
        <p className="label-editorial-muted">Logistique</p>
        <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
          Commandes
        </h1>
      </header>

      {/* Logistics map */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label-editorial">Suivi des commandes en attente</h2>
          <span className="label-editorial-muted">
            {pending.length} à expédier
          </span>
        </div>
        <LogisticsMap orders={pending} />
      </section>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`pill transition-colors ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              {f === 'all' ? 'Toutes' : STATUS_LABEL[f]}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto card-editorial p-0">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 text-left">
              <Th>Référence</Th>
              <Th>Client</Th>
              <Th>Destination</Th>
              <Th>Statut</Th>
              <Th className="text-right">Articles</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                className="border-b border-neutral-50 last:border-0"
              >
                <Td className="font-sans text-sm tracking-wide text-neutral-900">
                  {order.reference}
                </Td>
                <Td>
                  <span className="font-serif text-base italic text-neutral-900">
                    {order.customer}
                  </span>
                  <span className="block font-sans text-[0.65rem] tracking-editorial text-neutral-400">
                    {order.email}
                  </span>
                </Td>
                <Td>
                  <span className="font-sans text-sm text-neutral-700">
                    {order.city}
                  </span>
                  <span className="block font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400">
                    {order.scope === 'national'
                      ? 'National'
                      : 'International'}{' '}
                    &middot; {order.country}
                  </span>
                </Td>
                <Td>
                  <StatusPill status={order.status} />
                </Td>
                <Td className="text-right font-sans text-sm text-neutral-900">
                  {order.items}
                </Td>
                <Td className="text-right font-sans text-sm text-neutral-900">
                  {formatXAF(order.totalXAF)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
