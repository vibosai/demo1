import { Audience } from "@/components/audience";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero";
import { Layers } from "@/components/layers";
import { Navbar } from "@/components/navbar";
import { Product } from "@/components/product";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Product />
      <Layers />
      <Audience />
      <Contact />
      <Footer />
    </div>
  );
}
