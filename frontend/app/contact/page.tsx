import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import ContactForm from '@/components/ContactForm';
import { fetchContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Contactez la maison SCULPT'AURA.",
};

export const revalidate = 300;

/** SCULPT'AURA — Contact route (intro editable from the admin + form). */
export default async function ContactPage() {
  const content = await fetchContent('contact');
  return (
    <main className="pt-[136px]">
      <ContentPage content={content}>
        <ContactForm />
      </ContentPage>
    </main>
  );
}
