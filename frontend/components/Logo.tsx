/**
 * SCULPT'AURA — wordmark + editorial line-figure.
 *
 * Pairs the serif wordmark with a single continuous line drawing of a seated
 * feminine silhouette (back view), echoing the brand's founding sketch. Pure
 * stroke, no fill — it reads identically on white or black backgrounds via
 * `currentColor`.
 *
 * When the brand's own logo file is dropped in `public/logo.png`, pass
 * `src="/logo.png"` to render it instead of the SVG.
 */
export default function Logo({
  withFigure = true,
  src,
  className = '',
  figureClassName = 'mb-2 h-14 w-auto',
}: {
  withFigure?: boolean;
  src?: string;
  className?: string;
  figureClassName?: string;
}) {
  // If a real logo image is supplied, use it as-is.
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="SCULPT'AURA"
        className={`h-auto w-auto ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
      aria-label="SCULPT'AURA"
    >
      {withFigure && (
        <svg
          viewBox="0 0 90 120"
          className={figureClassName}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Single-line seated silhouette — head, arched back, hip, and arm. */}
          <path d="M46 10c5 0 8 4 8 9 0 4-2 7-6 8 3 2 5 5 5 9" />
          <path d="M53 36c-6 2-11 7-13 14-2 8-1 16 2 24 2 6 5 12 5 19 0 7-3 13-9 17" />
          <path d="M42 52c-7 3-12 9-14 17-1 6 0 12 3 17" />
          <path d="M40 78c8 1 15 5 19 12" />
        </svg>
      )}
      <span className="font-serif text-2xl italic tracking-[0.08em]">
        SCULPT&rsquo;AURA
      </span>
    </span>
  );
}
