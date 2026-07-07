/**
 * SCULPT'AURA — Supabase service-role client.
 *
 * The backend uses the SERVICE ROLE key, which bypasses Row Level Security. It
 * is required for privileged operations the customer's session must never do —
 * flipping an order to `paid` on a verified payment webhook, reading the
 * newsletter table, etc. This key is server-only and must never reach the
 * browser.
 *
 * The client is created lazily so the API still boots (for health checks and
 * shipping quotes) when Supabase env vars are absent in a local dev setup.
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');

let cachedClient = null;

/**
 * Return a memoised service-role client, or null when not configured.
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Not configured — callers must handle the null and degrade gracefully.
    return null;
  }

  cachedClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

module.exports = { getSupabaseAdmin };
