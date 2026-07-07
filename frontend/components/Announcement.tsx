'use client';

import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — top announcement marquee.
 *
 * A slim black band carrying the shipping promise, scrolling infinitely. The
 * content is duplicated once so the marquee keyframe (translateX -50%) loops
 * seamlessly. Sits above the fixed header, so the layout offsets accordingly.
 */
export default function Announcement() {
  const { t } = useLocale();

  const items = Array.from({ length: 6 }, () => t.announcement);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-8 items-center overflow-hidden bg-neutral-900 text-white">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {/* Rendered twice for a seamless -50% loop. */}
        {[0, 1].map((group) => (
          <ul key={group} className="flex" aria-hidden={group === 1}>
            {items.map((text, i) => (
              <li
                key={`${group}-${i}`}
                className="flex items-center gap-16 px-8 font-sans text-[0.6rem] uppercase tracking-editorial-wide"
              >
                {text}
                <span className="text-neutral-500">—</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
