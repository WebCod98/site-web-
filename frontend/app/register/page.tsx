import type { Metadata } from 'next';
import AuthView from '@/components/AuthView';

export const metadata: Metadata = {
  title: 'Créer un compte',
  robots: { index: false, follow: false },
};

/** SCULPT'AURA — registration route. */
export default function RegisterPage() {
  return (
    <main className="pt-[136px]">
      <AuthView mode="register" />
    </main>
  );
}
