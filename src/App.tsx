import { CustomerStories } from "./sections/CustomerStories";
import { Faq } from "./sections/Faq";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";
import { StickyNav } from "./components/StickyNav";
import { Hero } from "./sections/Hero";
import { InteractiveDemo } from "./sections/InteractiveDemo";
import { Pricing } from "./sections/Pricing";
import { ProductShowcase } from "./sections/ProductShowcase";
import { Solutions } from "./sections/Solutions";
import { UseWith } from "./sections/UseWith";

export default function App() {
  return (
    <main className="page">
      <StickyNav />
      <Hero />
      <Solutions />
      <UseWith />
      <ProductShowcase />
      <InteractiveDemo />
      <CustomerStories />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
