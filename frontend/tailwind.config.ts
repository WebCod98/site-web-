import type { Config } from 'tailwindcss';

/**
 * SCULPT'AURA — Tailwind design tokens.
 *
 * The graphic charter is deliberately austere: pure white, deep black, and
 * light greys reserved exclusively for hairline dividers. Typography carries
 * the whole identity — an italic serif (Cormorant Garamond) for editorial
 * voice, and a geometric sans with wide tracking for labels and navigation.
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
        // Bound to the CSS variables injected by next/font in app/layout.tsx.
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        // Charter mandates expanded tracking on all uppercase labels.
        editorial: '0.2em',
        'editorial-wide': '0.25em',
      },
      maxWidth: {
        editorial: '1440px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 1.2s ease-out forwards',
        'slow-zoom': 'slow-zoom 12s ease-out forwards',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
