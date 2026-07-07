import type { Metadata } from 'next';
import FaqView from '@/components/FaqView';
import { fetchContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes — tailles, livraison, paiement, entretien.',
};

export const revalidate = 300;

/** SCULPT'AURA — FAQ route (content editable from the admin). */
export default async function FaqPage() {
  const content = await fetchContent('faq');
  return (
    <main className="pt-[136px]">
      <FaqView content={content} />
    </main>
  );
}
