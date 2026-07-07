/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Storefront is SEO-critical: keep images optimized and remote sources explicit.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Native currency is XAF; the storefront ships FR/EN, FR being the default market language.
  poweredByHeader: false,
};

module.exports = nextConfig;
