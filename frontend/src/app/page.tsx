import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LogosSection } from "@/components/landing/LogosSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <Navbar />
      <HeroSection />
      <LogosSection />
      <FeatureSection />
      <Footer />
    </main>
  );
}
