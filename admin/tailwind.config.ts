import type { Config } from 'tailwindcss';

/**
 * SCULPT'AURA Admin — Tailwind tokens.
 *
 * Shares the storefront's B&W editorial charter: italic serif for titles, a
 * geometric sans with wide tracking for labels, and greys reserved for hairline
 * dividers. The admin adds a couple of dashboard-specific rhythms.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '0.2em',
        'editorial-wide': '0.25em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
