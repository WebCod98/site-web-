import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * SCULPT'AURA Admin — Supabase browser client.
 *
 * The admin writes to the catalogue with the anon key **plus an authenticated
 * admin session**: Row Level Security only permits product writes to profiles
 * whose `is_admin` flag is true (see supabase/schema.sql). So the same anon key
 * is safe here — privilege comes from the logged-in user, not the key.
 *
 * `isSupabaseConfigured` lets the admin degrade to a read-only demo when the
 * project is not yet wired up.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Memoised browser client (persists the admin session), or null if unconfigured. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (client) return client;
  client = createClient(url as string, anonKey as string, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
