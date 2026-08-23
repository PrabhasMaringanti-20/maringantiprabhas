import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Experience from '@/components/Experience';
import Hero from '@/components/Hero';
import Journey from '@/components/Journey';
import Nav from '@/components/Nav';
import PointerLayer from '@/components/PointerLayer';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';

/** Every section is now built; global polish and deployment come next. */
export default function Page() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-on-accent"
      >
        Skip to content
      </a>

      <PointerLayer />
      <Nav />

      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Experience />
        <div className="band">
          <Skills />
        </div>
        <Projects />
        <div className="band">
          <Journey />
        </div>
        <Contact />
      </main>

      <Footer />
    </>
  );
}
