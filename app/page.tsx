import { Hero } from "@/components/sections/Hero";
import { EmotionalSpectrum } from "@/components/sections/EmotionalSpectrum";
import { StatementAndServices } from "@/components/sections/StatementAndServices";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ShipyardBanner } from "@/components/sections/ShipyardBanner";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { InfoCards } from "@/components/sections/InfoCards";
import { NewsSection } from "@/components/sections/NewsSection";
import { Footer } from "@/components/sections/Footer";
import { InitialLoader } from "@/components/ui/InitialLoader";

export default function Home() {
  return (
    <>
      {/* Homepage only, as on the reference. Navbar and Hero intros wait for its cues. */}
      <InitialLoader />
      {/* z-10 + solid background: <main> scrolls away over the sticky footer (curtain reveal). */}
      <main className="relative z-10 bg-tiny-white">
        <Hero />
        <EmotionalSpectrum />
        <StatementAndServices />
        <SelectedWork />
        <ShipyardBanner />
        <CategoryShowcase theme="light" />
        <CategoryShowcase theme="dark" />
        <InfoCards />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
