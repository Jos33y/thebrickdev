/**
 * Home Page - Main portfolio landing page
 * Assembles all sections in order
 */

import { Header, Footer } from '../components/layout';
import {
  Hero,
  Services,
  Projects,
  Pricing,
  Process,
  CTA
} from '../components/sections';

const Home = () => {
  return (
    <>
      <Header />
      
      <main>
        <Hero />
        <Services />
        <Projects />
        <Pricing />
        <Process />
        <CTA />
      </main>
      
      <Footer />
    </>
  );
};

export default Home;
