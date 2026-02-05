import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Publications from "@/components/Publications";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Publications />
      <Projects />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
