/**
 * SCULPT'AURA — wordmark + editorial line-figure.
 *
 * The mark pairs the serif wordmark with a single continuous line drawing of a
 * sculpted silhouette, echoing the brand's founding sketch. Pure stroke, no
 * fill — it reads identically on white or black backgrounds via currentColor.
 */
export default function Logo({
  withFigure = true,
  className = '',
}: {
  withFigure?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
      aria-label="SCULPT'AURA"
    >
      {withFigure && (
        <svg
          viewBox="0 0 64 80"
          className="mb-1 h-9 w-auto"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* A single-line sculpted silhouette — head, back, and drape. */}
          <path d="M30 6c4 0 6 3 6 6s-2 6-5 7c5 2 8 7 8 13 0 5-2 9-6 12 3 2 5 5 5 9 0 7-6 13-14 15" />
          <path d="M31 19c-3 4-4 9-3 14 1 5 4 9 4 14 0 6-4 11-10 15" />
          <path d="M38 44c3 3 4 7 3 11" />
        </svg>
      )}
      <span className="font-serif text-2xl italic tracking-wide">
        SCULPT&rsquo;AURA
      </span>
    </span>
  );
}
