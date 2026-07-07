import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import { fetchContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'La Maison',
  description: "La maison SCULPT'AURA — gaines & minceur, née au Cameroun.",
};

export const revalidate = 300;

/** SCULPT'AURA — About route (content editable from the admin). */
export default async function AboutPage() {
  const content = await fetchContent('about');
  return (
    <main className="pt-[136px]">
      <ContentPage content={content} />
    </main>
  );
}
