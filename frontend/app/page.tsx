import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import ProductGrid from '@/components/ProductGrid';
import RitualSection from '@/components/RitualSection';
import Values from '@/components/Values';
import Newsletter from '@/components/Newsletter';

/**
 * SCULPT'AURA — homepage.
 *
 * The shared chrome (announcement, header, footer, cart drawer) lives in the
 * root layout. The homepage owns only its editorial narrative, which reads top
 * to bottom: hero → manifesto → signature collection → the ritual (black
 * interlude) → house values → newsletter (black close). The full-screen hero
 * sits beneath the transparent header, so no top offset is needed here.
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ProductGrid />
      <RitualSection />
      <Values />
      <Newsletter />
    </main>
  );
}
