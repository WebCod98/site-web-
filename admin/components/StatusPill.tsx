import { STATUS_LABEL, type OrderStatus } from '@/lib/data';

/**
 * SCULPT'AURA Admin — order status pill.
 *
 * Monochrome only: terminal/positive states (paid, delivered) invert to solid
 * black; in-progress and neutral states stay as a hairline outline. No colour is
 * used to convey status — weight and fill carry the meaning instead.
 */
const SOLID: OrderStatus[] = ['paid', 'delivered'];
const MUTED: OrderStatus[] = ['cancelled', 'refunded'];

export default function StatusPill({ status }: { status: OrderStatus }) {
  const solid = SOLID.includes(status);
  const muted = MUTED.includes(status);

  const classes = solid
    ? 'border-neutral-900 bg-neutral-900 text-white'
    : muted
      ? 'border-neutral-200 text-neutral-400'
      : 'border-neutral-900 text-neutral-900';

  return <span className={`pill ${classes}`}>{STATUS_LABEL[status]}</span>;
}
