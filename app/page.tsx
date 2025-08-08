import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Stats from "@/components/landing/stats";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import Contact from "@/components/landing/contact";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="autochat-landing">
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
