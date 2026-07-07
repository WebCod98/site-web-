import type { Metadata } from 'next';
import AuthView from '@/components/AuthView';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

/** SCULPT'AURA — sign in route. */
export default function LoginPage() {
  return (
    <main className="pt-[136px]">
      <AuthView mode="login" />
    </main>
  );
}
