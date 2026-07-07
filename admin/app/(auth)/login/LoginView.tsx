'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase';

/**
 * SCULPT'AURA Admin — sign in.
 *
 * A centred, minimal editorial form. When Supabase is configured it authenticates
 * via Supabase Auth and verifies the profile is an admin (`profiles.is_admin`)
 * before granting access — a non-admin is signed straight back out. In demo mode
 * (no Supabase) it simply enters the dashboard so the UI can be previewed.
 */
export default function LoginView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    const supabase = getSupabaseBrowser();

    // Demo mode — enter the dashboard for preview.
    if (!supabase || !isSupabaseConfigured) {
      router.push('/');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Verify the account is an administrator.
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        throw new Error(
          "Ce compte n'a pas les droits d'administration.",
        );
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Connexion impossible.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-14 text-center">
          <h1 className="font-serif text-3xl italic tracking-wide text-neutral-900">
            SCULPT&rsquo;AURA
          </h1>
          <p className="mt-2 label-editorial-muted">Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="field-editorial">
            <label className="label-editorial-muted mb-2">
              Adresse e-mail
            </label>
            <input type="email" name="email" required autoComplete="email" />
          </div>
          <div className="field-editorial">
            <label className="label-editorial-muted mb-2">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="font-sans text-[0.7rem] leading-relaxed text-neutral-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-editorial w-full disabled:opacity-40"
          >
            {loading ? '…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-10 text-center font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-300">
          Accès réservé au Super Admin
        </p>
      </div>
    </main>
  );
}
