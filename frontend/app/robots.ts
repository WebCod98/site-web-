import type { MetadataRoute } from 'next';

/**
 * SCULPT'AURA — robots directives.
 *
 * The storefront is SEO-critical, so everything public is indexable while the
 * checkout, account, and API surfaces are kept out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/account', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
