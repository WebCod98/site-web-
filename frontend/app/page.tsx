import Announcement from '@/components/Announcement';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import ProductGrid from '@/components/ProductGrid';
import RitualSection from '@/components/RitualSection';
import Values from '@/components/Values';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

/**
 * SCULPT'AURA — homepage.
 *
 * The editorial narrative reads top to bottom: announcement → hero → manifesto
 * → signature collection → the ritual (black interlude) → house values →
 * newsletter (black close) → footer. Each block owns its own vertical rhythm so
 * the page breathes like a fashion magazine.
 */
export default function HomePage() {
  return (
    <>
      <Announcement />
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <ProductGrid />
        <RitualSection />
        <Values />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
