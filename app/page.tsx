import Clients from '@/components/Clients';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Hero3D from '@/components/Hero3D';
import Industries from '@/components/Industries';
import Manifesto from '@/components/Manifesto';
import Marquee from '@/components/Marquee';
import Products from '@/components/Products';
import Stats from '@/components/Stats';
import Why from '@/components/Why';
import WindmillStory from '@/components/WindmillStory';

export default function Page() {
  return (
    <>
      <Hero3D />
      <Marquee />
      <Manifesto />
      <Stats />
      <Products />
      <WindmillStory />
      <Industries />
      <Why />
      <Clients />
      <Contact />
      <Footer />
    </>
  );
}
