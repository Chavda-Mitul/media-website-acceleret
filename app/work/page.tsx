import type { Metadata } from "next";
import { WorkHero } from "@/components/sections/WorkHero";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { PROJECTS } from "@/lib/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected case studies and snapshots from the studio.",
};

// The Grid ⇄ Filmstrip views (components/sections/WorkViews, WorkGrid, WorkFilmstrip) are kept but not
// mounted; swap <ProjectGallery> back for <WorkViews grid={<WorkGrid />} /> to restore them.
export default function WorkPage() {
  return (
    <>
      {/* No-JS: captions and images skip their reveal (see lib/reveal.ts, components/ui/FadeImage.tsx). */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}[data-fade]{opacity:1!important}"}</style>
      </noscript>
      {/* z-10 + solid background: <main> scrolls away over the sticky footer (curtain reveal). */}
      <main className="relative z-10 bg-tiny-white">
        <WorkHero />
        <ProjectGallery projects={PROJECTS} />
      </main>
    </>
  );
}
