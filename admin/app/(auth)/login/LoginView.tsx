'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';

/**
 * SCULPT'AURA Admin — sign in.
 *
 * A centred, minimal editorial form with bottom-line fields only. Submitting is
 * stubbed — the wired version authenticates via Supabase and verifies
 * `profiles.is_admin` before granting access. On success we route to the
 * dashboard.
 */
export default function LoginView() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Wired: supabase.auth.signInWithPassword + is_admin check.
    router.push('/');
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
          <button type="submit" className="btn-editorial w-full">
            Se connecter
          </button>
        </form>

        <p className="mt-10 text-center font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-300">
          Accès réservé au Super Admin
        </p>
      </div>
    </main>
  );
}
