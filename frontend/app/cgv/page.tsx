import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import { fetchContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: "Conditions générales de vente de SCULPT'AURA.",
};

export const revalidate = 300;

/** SCULPT'AURA — Terms route (content editable from the admin). */
export default async function TermsPage() {
  const content = await fetchContent('terms');
  return (
    <main className="pt-[136px]">
      <ContentPage content={content} />
    </main>
  );
}
