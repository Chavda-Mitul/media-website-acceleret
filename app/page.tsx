import { ParticleHero } from "@/components/sections/ParticleHero";
import { Hero } from "@/components/sections/Hero";
import { EmotionalSpectrum } from "@/components/sections/EmotionalSpectrum";
import { StatementAndServices } from "@/components/sections/StatementAndServices";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { InfoCards } from "@/components/sections/InfoCards";
import { BrandBanner } from "@/components/sections/BrandBanner";
import { Act, type Chapter } from "@/components/ui/Act";
import { InitialLoader } from "@/components/ui/InitialLoader";
import { SheetEdge } from "@/components/ui/SheetEdge";
import { StoryRail } from "@/components/ui/StoryRail";

// The homepage tells one story, top to bottom: the hook, the feeling, the work, the process, then
// "let's talk". Monochrome sheets of paper and ink, the logo's blue the only colour. Wherever a section rises over a
// different tone, it arrives with the sheet's rounded edge: a SheetEdge strip between solid tones, or the
// section's own rounded top (sheetArrive) for full-bleed media. StoryRail tracks the chapters like a scrubber.
const INTRO = { id: "intro", label: "Intro" };
const FEELING = { id: "feeling", label: "The feeling" };
const WORK = { id: "work", label: "The work" };
const PROCESS = { id: "process", label: "The process" };
const CONTACT = { id: "contact", label: "Let’s talk" };
const CHAPTERS: Chapter[] = [INTRO, FEELING, WORK, PROCESS, CONTACT];

export default function Home() {
  return (
    <>
      {/* Homepage only, as on the reference. Navbar and the hero intros wait for its cues. */}
      <InitialLoader />
      {/* z-10 + solid background: <main> scrolls away over the sticky footer (curtain reveal). */}
      <main className="relative z-10 bg-tiny-white">
        {/* The hook: the logo plays out of a timeline on the white opening stage. */}
        <Act chapter={INTRO}>
          <ParticleHero recede />
        </Act>

        {/* The reel rises over the hook with its own rounded edge. */}
        <Act chapter={FEELING}>
          <Hero />
          <EmotionalSpectrum />
          <StatementAndServices />
        </Act>

        {/* The client logos that close the feeling chapter lead straight into the work. */}
        <Act chapter={WORK}>
          <CategoryShowcase theme="light" />
          <SheetEdge from="paper" to="ink" />
          <CategoryShowcase theme="dark" />
        </Act>

        <Act chapter={PROCESS}>
          <SheetEdge from="ink" to="paper" />
          <ProcessSection />
        </Act>

        {/* About & Approach rises over the process with its own rounded edge. */}
        <Act chapter={CONTACT}>
          <InfoCards />
          {/* The closing card sits on the ink stage, which the footer curtain below continues. */}
          <div data-story-end="" data-nav-theme="media" className="bg-tiny-black">
            <BrandBanner />
          </div>
        </Act>
      </main>
      <StoryRail chapters={CHAPTERS} />
    </>
  );
}
