import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * SCULPT'AURA — Supabase clients (storefront).
 *
 * Exposes the public (anon-key) client for both the browser and server. The
 * anon key is safe to ship: every table is protected by Row Level Security, so
 * the client can only ever read what the policies permit (published products,
 * approved reviews) and write as the authenticated user.
 *
 * `isSupabaseConfigured` lets the rest of the app degrade gracefully to the
 * bundled mock data when the project is not yet wired up (demo mode).
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

/**
 * Memoised browser client (persists the auth session in localStorage). Returns
 * null when Supabase is not configured so callers can fall back to demo behaviour.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(url as string, anonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return browserClient;
}

/**
 * A fresh server-side client for use in Server Components / route handlers.
 * No session persistence (each request is stateless). Returns null when the
 * project is not configured.
 */
export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(url as string, anonKey as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
