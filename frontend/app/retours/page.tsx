import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import { fetchContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Politique de Retour',
  description: "Politique de retour et d'échange de SCULPT'AURA.",
};

export const revalidate = 300;

/** SCULPT'AURA — Returns route (content editable from the admin). */
export default async function ReturnsPage() {
  const content = await fetchContent('returns');
  return (
    <main className="pt-[136px]">
      <ContentPage content={content} />
    </main>
  );
}
