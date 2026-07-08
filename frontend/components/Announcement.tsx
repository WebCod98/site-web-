'use client';

import { useLocale } from './LocaleProvider';
import type { BannerContent, BilingualContent } from '@/lib/content';

/**
 * SCULPT'AURA — top announcement marquee.
 *
 * A slim black band carrying the promo message, scrolling infinitely. Content
 * and visibility are managed from the admin (site_content 'announcement'): the
 * `content` prop carries the bilingual message + an on/off switch. When disabled
 * the band renders nothing (no promo running).
 *
 * The content is duplicated once so the marquee keyframe (translateX -50%) loops
 * seamlessly. When shown it sits above the fixed header, matching the layout's
 * offset.
 */
export default function Announcement({
  content,
}: {
  content: BilingualContent<BannerContent>;
}) {
  const { locale } = useLocale();
  const banner = content[locale];

  // Hidden by the admin (no active promo) — render nothing.
  if (!banner?.enabled || !banner.message?.trim()) return null;

  const items = Array.from({ length: 6 }, () => banner.message);

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
