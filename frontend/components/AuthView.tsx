'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from './LocaleProvider';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase';

/**
 * SCULPT'AURA — authentication (sign in / register).
 *
 * A single, centred editorial form using only bottom-line fields (charter). The
 * submit is stubbed — the wired version calls Supabase Auth. Both modes share
 * this component; the `mode` prop selects copy and fields.
 */
export default function AuthView({ mode }: { mode: 'login' | 'register' }) {
  const { locale } = useLocale();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = {
    fr: {
      loginTitle: 'Connexion',
      registerTitle: 'Créer un compte',
      name: 'Nom complet',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      login: 'Se connecter',
      register: "S'inscrire",
      toRegister: 'Pas encore de compte ? Créer un compte',
      toLogin: 'Déjà un compte ? Se connecter',
      forgot: 'Mot de passe oublié ?',
      done: 'Vérifiez votre boîte e-mail.',
      demo: 'Mode démo — connectez Supabase pour activer les comptes réels.',
      failed: 'Une erreur est survenue. Veuillez réessayer.',
    },
    en: {
      loginTitle: 'Sign in',
      registerTitle: 'Create an account',
      name: 'Full name',
      email: 'Email address',
      password: 'Password',
      login: 'Sign in',
      register: 'Register',
      toRegister: 'No account yet? Create one',
      toLogin: 'Already have an account? Sign in',
      forgot: 'Forgot your password?',
      done: 'Check your inbox.',
      demo: 'Demo mode — connect Supabase to enable real accounts.',
      failed: 'Something went wrong. Please try again.',
    },
  }[locale];

  const isLogin = mode === 'login';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const fullName = String(form.get('fullName') || '').trim();

    const supabase = getSupabaseBrowser();

    // Demo mode — no Supabase configured. Acknowledge without a real account.
    if (!supabase || !isSupabaseConfigured) {
      setError(copy.demo);
      setSubmitted(true);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // Signed in — return to the storefront.
        router.push('/');
        router.refresh();
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, locale } },
      });
      if (signUpError) throw signUpError;
      // Registered — Supabase sends a confirmation email.
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-editorial flex min-h-[60vh] items-center justify-center py-24">
      <div className="w-full max-w-sm">
        <h1 className="mb-12 text-center font-serif text-4xl italic text-neutral-900">
          {isLogin ? copy.loginTitle : copy.registerTitle}
        </h1>

        {submitted ? (
          <p className="text-center font-serif text-xl italic text-neutral-500">
            {copy.done}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {!isLogin && (
              <div className="field-editorial">
                <label className="label-editorial-muted mb-2">{copy.name}</label>
                <input type="text" name="fullName" required autoComplete="name" />
              </div>
            )}

            <div className="field-editorial">
              <label className="label-editorial-muted mb-2">{copy.email}</label>
              <input type="email" name="email" required autoComplete="email" />
            </div>

            <div className="field-editorial">
              <label className="label-editorial-muted mb-2">
                {copy.password}
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
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
              {loading ? '…' : isLogin ? copy.login : copy.register}
            </button>
          </form>
        )}

        {/* Cross-links */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href={isLogin ? '/register' : '/login'}
            className="font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-500 transition-colors hover:text-neutral-900"
          >
            {isLogin ? copy.toRegister : copy.toLogin}
          </Link>
          {isLogin && (
            <Link
              href="/reset-password"
              className="font-sans text-[0.65rem] uppercase tracking-editorial text-neutral-400 transition-colors hover:text-neutral-900"
            >
              {copy.forgot}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
