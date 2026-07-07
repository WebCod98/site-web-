/**
 * SCULPT'AURA — star rating.
 *
 * Monochrome stars drawn as inline SVG. Filled stars use currentColor (black on
 * white by default); empty stars are a hairline outline. Supports fractional
 * averages via a clipped overlay so "4.5" renders a half-filled star.
 */
export default function StarRating({
  value,
  size = 14,
  className = '',
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const stars = [0, 1, 2, 3, 4];

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`${value} / 5`}
    >
      {stars.map((i) => {
        // Fraction of THIS star that should be filled (0, partial, or 1).
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            {/* Empty outline */}
            <Star size={size} filled={false} />
            {/* Filled overlay, clipped to the fraction */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={size} filled />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Star({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.2"
      className="text-neutral-900"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
    </svg>
  );
}
