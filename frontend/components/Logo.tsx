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
          viewBox="0 0 120 180"
          className={figureClassName}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Single-line feminine silhouette (front, one arm raised) — head,
              bust, waist and hips. Pure stroke: adapts to any background. */}
          <circle cx="60" cy="22" r="7.5" />
          <path d="M52 44 C 46 29 53 13 67 15 C 79 17 82 31 72 37" />
          <path d="M60 31 C 72 43 74 61 66 73 C 59 83 61 97 71 108 C 82 120 79 143 66 164" />
          <path d="M55 35 C 46 49 48 67 57 79 C 65 89 62 105 52 117 C 45 126 47 147 42 164" />
          <path d="M55 61 C 46 65 46 77 56 80" />
        </svg>
      )}
      <span className="font-serif text-2xl italic tracking-[0.08em]">
        SCULPT&rsquo;AURA
      </span>
    </span>
  );
}
